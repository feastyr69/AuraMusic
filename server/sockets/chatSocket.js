const { getRoomHistory, saveMessage } = require("../services/chatService");
const { cueSong } = require("../services/ytMusic");

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
            const data = await cueSong(roomId,videoId);
            socket.to(roomId).emit("cue-results", data);
        });

        //user disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    console.log("Sockets connected!")
};

module.exports = connectIO;

