const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://chat-app-frontend-peach-three.vercel.app/", // Allow requests from this origin
        methods: ["GET", "POST"] // Allow these HTTP methods
    }
});

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("addNewUser", (userId) => {
        if (!onlineUsers.some(user => user.userId === userId)) {
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
            console.log("OnlineUser", onlineUsers);

            io.emit("getonlineUsers", onlineUsers);
        }
    });

    // Add message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find(user => user.userId === message.recipientId);

        if (user) {
            io.to(user.socketId).emit("getmessage", message);
            io.to(user.socketId).emit("getnotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
            });
            console.log("Message sent: ", message);
        }
    });

    socket.on("disconnect", () => { // Fixed typo here
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        io.emit("getonlineUsers", onlineUsers);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
