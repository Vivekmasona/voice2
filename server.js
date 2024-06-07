const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/broadcaster.html');
});

app.get('/listener', (req, res) => {
    res.sendFile(__dirname + '/public/listener.html');
});

let broadcaster;

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room', (role) => {
        if (role === 'broadcaster') {
            broadcaster = socket.id;
        }
        if (broadcaster && role === 'listener') {
            socket.to(broadcaster).emit('broadcaster');
        }
    });

    socket.on('offer', (offer) => {
        if (socket.id === broadcaster) {
            socket.broadcast.emit('offer', offer);
        } else {
            socket.to(broadcaster).emit('offer', offer);
        }
    });

    socket.on('answer', (answer) => {
        socket.to(broadcaster).emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.id === broadcaster) {
            broadcaster = null;
            socket.broadcast.emit('broadcaster');
        }
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
