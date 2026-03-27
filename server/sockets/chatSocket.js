const { getRoomHistory, saveMessage } = require("../services/chatService");
const { cueSong,getQueue,nextSong} = require("../services/ytMusic");

const connectIO = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected");


        //user join room
        socket.on("join-room", async (roomId,senderName,timestamp) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
            await saveMessage(roomId, `${senderName} has joined the room`, "System");
            socket.to(roomId).emit("receive-message", {message: `${senderName} has joined the room`, sender: "System"});
            const history = await getRoomHistory(roomId);
            socket.emit("room-history", history);
        });


        //user send message
        socket.on("send-message", async (data) => {
            const { roomId, messageObj } = data;
            await saveMessage(roomId, messageObj.message, messageObj.sender);
            socket.to(roomId).emit("receive-message", messageObj);
        });

        //user cue song
        socket.on("cue-song", async (roomId,videoId) => {
            await cueSong(roomId,videoId);
            const updatedQueue = await getQueue(roomId);
            io.to(roomId).emit("queue-results", updatedQueue);
            io.to(roomId).emit("current-song", updatedQueue[0]);
        });

        //user get queue
        socket.on("get-queue", async (roomId) => {
            const data = await getQueue(roomId);
            io.to(roomId).emit("queue-results", data);
            io.to(roomId).emit("current-song", data[0]);
        });

        //user next song
        socket.on("next-song", async (roomId) => {
            const data = await nextSong(roomId);
            io.to(roomId).emit("queue-results", data);
            io.to(roomId).emit("current-song", data[0]);
        });

        //user disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

        //user sync song
        socket.on("sync-song", async (roomId,songData) => {
            console.log("sync song",songData);
            io.to(roomId).emit("receive-sync-song", songData);
        });
    });

    console.log("Sockets connected!")
};

module.exports = connectIO;

