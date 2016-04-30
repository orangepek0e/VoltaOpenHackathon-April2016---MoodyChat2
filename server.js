var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//////////////////////////////////////////////////////
// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

    ///////////////////////////////////////////////////
    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });

    /////////////////////////////////////////////////
    // when the client emits 'adduser', this goes off
    socket.on('adduser', function(username){
        socket.username = username;
        usernames[username] = username;
        socket.emit('updatechat', 'SERVER', 'you have connected');
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
        io.sockets.emit('updateusers', usernames);
    });

    ///////////////////////////////////////////////////
    // whenever a user disconnects, this will fire off!
    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });
});

http.listen(1337, function(){
    console.log('listening on *:1337');
});