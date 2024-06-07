const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid'); // For generating unique session IDs

const sessions = {}; // Store sessions with IDs

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/broadcaster.html');
});

app.get('/listener', (req, res) => {
    res.sendFile(__dirname + '/public/listener.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Generate a unique session ID
    const sessionId = uuidv4();
    sessions[sessionId] = socket.id;

    // Send session ID to the user
    socket.emit('sessionID', sessionId);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // Remove session ID when user disconnects
        delete sessions[sessionId];
    });

    socket.on('offer', ({ offer, targetSessionId }) => {
        // Send offer to the targeted user
        io.to(sessions[targetSessionId]).emit('offer', { offer, senderSessionId: sessionId });
    });

    socket.on('answer', ({ answer, senderSessionId }) => {
        // Send answer to the sender
        io.to(sessions[senderSessionId]).emit('answer', answer);
    });

    socket.on('candidate', ({ candidate, targetSessionId }) => {
        // Send candidate to the targeted user
        io.to(sessions[targetSessionId]).emit('candidate', { candidate, senderSessionId: sessionId });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
