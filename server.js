const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/user.html');
});

let users = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('ready', () => {
        users[socket.id] = socket;
        if (Object.keys(users).length === 2) {
            const userIDs = Object.keys(users);
            users[userIDs[0]].emit('ready');
            users[userIDs[1]].emit('ready');
        }
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

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete users[socket.id];
    });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
