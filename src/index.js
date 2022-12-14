const express = require("express");
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

// importing utilities
const formatMessage = require("./utils/formatMessage.js");
const {
    game,
    getQuestion,
    updateGame,
} = require("./utils/game.js")

const {
    players,
    addPlayer,
    getAllPlayers,
    getPlayer,
    removePlayer,
} = require("./utils/players.js");


// initiating server
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// providing path for front end code that server will use
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

// listening for new connections
io.on('connection', socket => {

    // receiving 'join' emit from trivia.js
    socket.on('join', ({ playerName, room, team }, callback) => {
        const {error, newPlayer} = addPlayer({id: socket.id, playerName, room, team});
        
        console.log(`${newPlayer.playerName} just connected to room: ${newPlayer.room}.`);
        
        if (error) return callback(error.message);
        callback();

        // adding newPlayer to specific room
        socket.join(newPlayer.room);

        // sending welcome message back to JUST the newPlayer
        socket.emit('message', formatMessage('Admin', `Welcome ya filthy ${team}`));

        // notifying other players that the newPlayer joined
        socket.broadcast
        .to(newPlayer.room)
        .emit('message',
        formatMessage('Admin', `${newPlayer.playerName} has joined the game as a ${team}!`)
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

    socket.on('startRound', (room) => {
        getQuestion((error, value) => {
        if (error) return alert(error);
        
        // Update game details
        const qdata = value[0];
        updateGame(room,'prompt.question',qdata.question); //update question
        updateGame(room,'prompt.category',qdata.category); //update category
        updateGame(room,'prompt.createdAt',new Date().getTime()); //update createdTime
        updateGame(room,'prompt.answers',qdata.incorrectAnswers.concat([qdata.correctAnswer])); //update answers
        updateGame(room,'prompt.correctAnswer',qdata.correctAnswer); //update correctAnswer

        
        // Send game details to all players
        io.in(room).emit('gameDetails', { room, game });
        console.log(game);
    });
    })

    socket.on("submission", (room, target, playerName, team, callback) => {
        // Get current state of submissions object
        const current_submissions = game[room].roundStatus.submissions;
        
        // Check to see if player already submitted
        const existingSubmission = current_submissions.find((sub) => {
            return sub.playerName === playerName && sub.team === team;
          });
        
        // If submitted, throw error for user
        if (existingSubmission) {
            error = new Error("You've already submitted an answer")
            return callback(error.message)
        }

        current_submissions.push({target, playerName, team});

        updateGame(room, 'roundStatus.submissions', current_submissions);

        // io.in(room).emit('submission)
            // updategame details
        // function ()
            // check to see if number of submissions = number of players
            // if so, calculate scores ->
                // updategame details
                // update scoreboard
        
    })

    //socket.on("any submission") - Update game object - emit back "updategame details"

    //socket.on("next question") - updategame object - getQuestion - emit back updategame details

    //socket.on("gameOver") -> update game details to show winner

});



server.listen(port, () => {
    console.log(`Server is up on port ${port}.`);
});


