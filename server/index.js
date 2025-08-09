const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const roomCodeMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => ({
            socketId,
            username: userSocketMap[socketId] || 'Anonymous'
        })
    );
};

io.on('connection', (socket) => {
    
    console.log(`user connected: ${socket.id}`);

    socket.on('join', ({ roomId, username }) => {
        
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        //store the room code in a variable
        const existingCode = roomCodeMap[roomId] || '';

        // Notify all users in the room
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId: socket.id
            });
        });

        io.to(socket.id).emit('code-change', {
            code : existingCode
        })
    });

    socket.on('code-change', ({ roomId, code }) => {
      roomCodeMap[roomId] = code;
      console.log(`[CODE-CHANGE] room=${roomId} stored code:`, code);
        socket.in(roomId).emit('code-change', { 
            code,
            username : userSocketMap[socket.id] || 'Anonymous'
        });
    });

    socket.on("sync-code", ({socketId, code})=>{
        io.to(socketId).emit("code-change", { code });
    })

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id] || 'Anonymous'
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running at: ${PORT}`));