const { getRoomHistory, saveMessage } = require("../services/chatService");
const { cueSong, getQueue, nextSong, removeSong } = require("../services/ytMusic");
const { joinUser, getUsersInRoom, removeUser, deleteRoom, isUserInDifferentRoom } = require("../services/roomService");
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const skipLocks = new Map();
const roomPlayback = new Map();

const verifyAccessToken = (token) => {
    try {
        return token ? jwt.verify(token, process.env.JWT_SECRET || 'secret') : null;
    } catch (_error) {
        return null;
    }
};

const saveListeningTick = async (userId, song, seconds) => {
    if (!song?.videoId || !song?.name || !song?.artist?.name) return;
    await db.query(
        `INSERT INTO listening_stats (user_id, listened_seconds) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET listened_seconds = listening_stats.listened_seconds + EXCLUDED.listened_seconds`,
        [userId, seconds]
    );
    await db.query(
        `INSERT INTO listening_tracks (user_id, video_id, title, artist, listened_seconds)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, video_id) DO UPDATE
         SET title = EXCLUDED.title, artist = EXCLUDED.artist,
             listened_seconds = listening_tracks.listened_seconds + EXCLUDED.listened_seconds`,
        [userId, song.videoId, song.name, song.artist.name, seconds]
    );
};

const checkpointRoom = async (io, roomId, now = Date.now(), extraSocket = null) => {
    const playback = roomPlayback.get(roomId);
    if (!playback || !playback.isPlaying || !playback.song) return;
    const seconds = Math.floor((now - playback.lastAccountedAt) / 1000);
    playback.lastAccountedAt = now;
    if (seconds <= 0) return;
    const sockets = await io.in(roomId).fetchSockets();
    if (extraSocket?.accountId && !sockets.some((socket) => socket.id === extraSocket.id)) sockets.push(extraSocket);
    await Promise.all(sockets
        .filter((socket) => socket.accountId)
        .map((socket) => saveListeningTick(socket.accountId, playback.song, seconds)));
};

const connectIO = (io) => {
    const listeningTimer = setInterval(async () => {
        for (const roomId of roomPlayback.keys()) {
            try {
                await checkpointRoom(io, roomId);
            } catch (error) {
                console.error('Listening stats update error:', error);
            }
        }
    }, 15000);
    listeningTimer.unref?.();

    io.on("connection", (socket) => {


        //haath mat chhorna saath mat chhorna
        socket.on("keep-alive", (data) => {

        });

        socket.on('authenticate-session', async (accessToken) => {
            const claims = verifyAccessToken(accessToken);
            if (!claims?.id || socket.accountId === claims.id) return;
            socket.accountId = claims.id;
            if (socket.roomId) {
                await db.query(
                    `INSERT INTO listening_stats (user_id, room_sessions) VALUES ($1, 1)
                     ON CONFLICT (user_id) DO UPDATE SET room_sessions = listening_stats.room_sessions + 1`,
                    [socket.accountId]
                );
            }
        });

        //user join room
        socket.on("join-room", async (clientData) => {
            const { roomId, sessionId, userName, avatarUrl, joinedAt, accessToken } = clientData;
            
            if (await isUserInDifferentRoom(sessionId, roomId)) {
                socket.emit("already-in-room");
                return;
            }

            await checkpointRoom(io, roomId);
            socket.join(roomId);

            socket.roomId = roomId;
            socket.userId = sessionId;
            socket.userName = userName;
            socket.avatarUrl = avatarUrl;
            const claims = verifyAccessToken(accessToken);
            socket.accountId = claims?.id || null;
            await joinUser(roomId, sessionId, userName, avatarUrl);
            if (socket.accountId) {
                await db.query(
                    `INSERT INTO listening_stats (user_id, room_sessions) VALUES ($1, 1)
                     ON CONFLICT (user_id) DO UPDATE SET room_sessions = listening_stats.room_sessions + 1`,
                    [socket.accountId]
                );
            }


            if (!skipLocks.get(userName + roomId)) {
                socket.to(roomId).emit("receive-message", { message: `${userName} has joined the room`, sender: "System" });
                await saveMessage(roomId, { message: `${userName} has joined the room`, sender: "System" });
            }
            skipLocks.set(userName + roomId, true);
            setTimeout(() => skipLocks.delete(userName + roomId), 15000);

            const history = await getRoomHistory(roomId);
            socket.emit("room-history", history);

            const users = await getUsersInRoom(roomId);
            io.to(roomId).emit("update-users", users);
        });


        //user send message
        socket.on("send-message", async (data) => {
            const { roomId, messageObj } = data;
            await saveMessage(roomId, messageObj);
            socket.to(roomId).emit("receive-message", messageObj);
        });

        //user cue song
        socket.on("cue-song", async (roomId, videoId) => {
            await checkpointRoom(io, roomId);
            await cueSong(roomId, videoId);
            const updatedQueue = await getQueue(roomId);
            io.to(roomId).emit("queue-results", updatedQueue);
            if (updatedQueue.length == 1) {
                roomPlayback.set(roomId, { isPlaying: true, song: updatedQueue[0], lastAccountedAt: Date.now() });
                io.to(roomId).emit("current-song", updatedQueue[0]);
                io.to(roomId).emit("receive-sync-song", {
                    videoId: updatedQueue[0].videoId, isPlaying: true, progress: 0, songData: updatedQueue[0]
                });
            }
        });

        //user get queue
        socket.on("get-queue", async (roomId) => {
            const data = await getQueue(roomId);
            io.to(roomId).emit("queue-results", data);
        });

        //user next song
        socket.on("next-song", async (roomId, currentVideoId) => {

            if (skipLocks.get(roomId)) {
                return;
            }
            skipLocks.set(roomId, true);
            setTimeout(() => skipLocks.delete(roomId), 1000);

            const queue = await getQueue(roomId);

            if (currentVideoId && queue.length > 0 && queue[0].videoId !== currentVideoId) {
                return;
            }

            await checkpointRoom(io, roomId);
            const data = await nextSong(roomId);
            roomPlayback.set(roomId, { isPlaying: Boolean(data[0]), song: data[0] || null, lastAccountedAt: Date.now() });

            io.to(roomId).emit("queue-results", data);
            io.to(roomId).emit("current-song", data[0] || null);
            if (data[0]) {
                io.to(roomId).emit("receive-sync-song", {
                    videoId: data[0].videoId, isPlaying: true, progress: 0, songData: data[0]
                });
            }
        });

        //user remove song
        socket.on("remove-song", async (roomId, index, videoId) => {
            if (index === 0) return; // prevent removing current song this way
            const queue = await getQueue(roomId);
            if (queue[index] && queue[index].videoId === videoId) {
                const updatedQueue = await removeSong(roomId, index);
                io.to(roomId).emit("queue-results", updatedQueue);
            }
        });

        //user get current song
        socket.on("get-current-song", async (roomId) => {
            const data = await getQueue(roomId);
            socket.emit("current-song", data[0] || null);
        });


        socket.on("preview-room", (roomId) => {
            socket.join(roomId);
        });

        //user disconnect
        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${socket.userName} from ${socket.roomId}`);
            if (socket.roomId && socket.userName) {
                await checkpointRoom(io, socket.roomId, Date.now(), socket);
                await removeUser(socket.roomId, socket.userId, socket.userName, socket.avatarUrl);

                const users = await getUsersInRoom(socket.roomId);
                
                if (users.length === 0) {
                    await deleteRoom(socket.roomId);
                    roomPlayback.delete(socket.roomId);
                    io.to(socket.roomId).emit("room-deleted");
                } else {
                    io.to(socket.roomId).emit("update-users", users);
                    const leaveMsg = { message: `${socket.userName} has left the room`, sender: "System" };
                    socket.to(socket.roomId).emit("receive-message", leaveMsg);
                    await saveMessage(socket.roomId, leaveMsg);
                }
            }
        });

        //user sync song
        socket.on("sync-song", async (roomId, songData) => {
            await checkpointRoom(io, roomId);
            if (songData?.videoId) {
                const previous = roomPlayback.get(roomId);
                roomPlayback.set(roomId, {
                    isPlaying: Boolean(songData.isPlaying),
                    song: songData.songData || (previous?.song?.videoId === songData.videoId ? previous.song : null),
                    lastAccountedAt: Date.now(),
                });
            } else if (roomPlayback.has(roomId)) {
                roomPlayback.get(roomId).isPlaying = Boolean(songData?.isPlaying);
                roomPlayback.get(roomId).lastAccountedAt = Date.now();
            }
            socket.to(roomId).emit("receive-sync-song", songData);
        });

        //user request sync
        socket.on("request-sync", async (roomId) => {

            const totalSockets = await io.in(roomId).fetchSockets();
            if (totalSockets.length > 1) {
                const proxySocket = totalSockets.find(s => s.id !== socket.id);
                if (proxySocket) {
                    io.to(proxySocket.id).emit("provide-sync");
                }
            }
            else {

                const data = await getQueue(roomId);
                if (data[0]) {
                    roomPlayback.set(roomId, { isPlaying: true, song: data[0], lastAccountedAt: Date.now() });
                    socket.emit("receive-sync-song", {
                    videoId: data[0].videoId,
                    isPlaying: true,
                    progress: 0,
                    duration: data[0].duration,
                    songData: data[0]
                    });
                }
            }
        });

        //user logs action

        socket.on('log-action', async (roomId, sender, action, timestamp) => {
            const actionMessages = {
                skipped: `${sender} skipped the song`,
                cued:    `${sender} cued a song`,
                removed: `${sender} removed a song`,
            };
            const text = actionMessages[action];
            if (!text) return;

            const msgObj = { message: text, sender: "System", timestamp };
            await saveMessage(roomId, msgObj);
            io.to(roomId).emit('receive-message', msgObj);
        })

    });

    console.log("Sockets connected!")
};

module.exports = connectIO;

