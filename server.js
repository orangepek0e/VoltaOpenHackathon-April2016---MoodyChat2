var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//////////////////////////////////////////////////////
// declare our variables for this instance of the chat
var usernames = {};
var rooms = ['happy', 'sad', 'angry'];


io.sockets.on('connection', function (socket) {

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(username){
        if (username == null){
            socket.emit('updatechat', 'SERVER', 'Error. Please reload and enter a username.');
            return;
        }
        else{
            socket.username = username;
            socket.room = 'happy';
            usernames[username] = username;
            socket.join('happy');
            socket.emit('updatechat', 'SERVER', 'Welcome to the happy chat!');
            socket.broadcast.to('happy').emit('updatechat', 'SERVER', 'give ' + username + ' a warm hello as they have joined the chat!');
            socket.emit('updaterooms', rooms, 'happy');
            socket.emit('updateusers', usernames);
        }
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'Welcome to the '+ newroom + ' room!');
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

app.use('/public', express.static(__dirname + '/public'));

http.listen(1337, function(){
    console.log('listening on *:1337');
});

require('whiteboard.io');