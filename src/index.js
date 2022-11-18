const express = require("express");
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const formatMessage = require("./utils/formatMessage.js");

const {
    addPlayer,
    getAllPlayers,
    getPlayer,
    removePlayer,
} = require("./utils/players.js");


const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

// listening for new connections
io.on('connection', socket => {

    // receiving 'join' emit from trivia.js
    socket.on('join', ({ playerName, room }, callback) => {
        const {error, newPlayer} = addPlayer({id: socket.id, playerName, room});
        
        console.log(`${newPlayer.playerName} just connected to room: ${newPlayer.room}.`);
        
        if (error) return callback(error.message);
        callback();

        // adding newPlayer to specific room
        socket.join(newPlayer.room);

        // sending welcome message back to JUST the newPlayer
        socket.emit('message', formatMessage('Admin', 'Welcome!'));

        // notifying other players that the newPlayer joined
        socket.broadcast
        .to(newPlayer.room)
        .emit('message',
        formatMessage('Admin', `${newPlayer.playerName} has joined the game!`)
        );

            // Emit a "room" event to all players to update their Game Info sections
        io.in(newPlayer.room).emit('room', {
            room: newPlayer.room,
            players: getAllPlayers(newPlayer.room),
        });

    });

    socket.on("sendMessage", (message, callback) => {
        const {error, player} = getPlayer(socket.id);

        if (error) return callback(error.message);

        if (player) {
            io.to(player.room).emit(
                "message",
                formatMessage(player.playerName, message)
                );
                callback();
        }
    });

    socket.on("disconnect", () => {
        console.log("A player disconnected.");
      
        const disconnectedPlayer = removePlayer(socket.id);
      
        if (disconnectedPlayer) {
          const { playerName, room } = disconnectedPlayer;
          io.in(room).emit(
            "message",
            formatMessage("Admin", `${playerName} has left!`)
          );
      
          io.in(room).emit("room", {
            room,
            players: getAllPlayers(room),
          });
        }
      });

    

});



server.listen(port, () => {
    console.log(`Server is up on port ${port}.`);
});


