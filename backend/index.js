require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db.js');
const userRoutes = require('./routes/userRoutes.js');
const canvasRoutes = require('./routes/canvasRoutes.js');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});
const { handleJoinCanvas, handleUpdateCanvas } = require('./controllers/canvasController.js');

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

connectToDatabase();

app.use('/users', userRoutes);
app.use('/canvas', canvasRoutes);

// Establish a connection with the client
io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Handle messages from the client
    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // You can broadcast the message to all connected clients
        io.emit('message', message);
    });
    socket.on('joinCanvas', (data) => handleJoinCanvas(socket, data));
    socket.on('drawingUpdate', (data) => handleUpdateCanvas(io, socket, data));
});

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}.`));