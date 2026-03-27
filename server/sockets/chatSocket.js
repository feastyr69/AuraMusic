const { getRoomHistory, saveMessage } = require("../services/chatService");
const { cueSong,getQueue,currentSong } = require("../services/ytMusic");

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
        });

        //user get queue
        socket.on("get-queue", async (roomId) => {
            const data = await getQueue(roomId);
            io.to(roomId).emit("queue-results", data);
        });

        //user get current song
        socket.on("get-current-song", async (roomId) => {
            const data = await currentSong(roomId);
            io.to(roomId).emit("current-song", data);
        });

        //user disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    console.log("Sockets connected!")
};

module.exports = connectIO;

