const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/broadcaster.html');
});

app.get('/listener', (req, res) => {
    res.sendFile(__dirname + '/public/listener.html');
});

// This endpoint will serve the audio stream directly
app.get('/listen', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked'
    });

    // Using the correct path to the audio file
    const audioFilePath = path.join(__dirname, 'audio/sample.wav');
    const audioStream = fs.createReadStream(audioFilePath);
    audioStream.pipe(res);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        socket.broadcast.emit('candidate', candidate);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
