//Create a basic express/socketio server to handle incoming accelerometer data and then send it to listeners
var express = require('express');
var app = express();
var server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var port = 8001;



app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
    }
);


//The page that records the acceelerometer data, using a candle drawn
//on a virtual canvas- the goal is to move the candle to control a pong game
//where the flame extinguishes if moved too fast- and the paddle/candle
//burns with time.
app.get('/candle', function(req, res){
    res.sendFile(__dirname + '/candle.html');
});

app.get('/candleDisplay.js', function(req, res){
    res.sendFile(__dirname + '/candleDisplay.js');
});

app.get('/main', function(req, res){
    res.sendFile(__dirname + '/newGame.html');
});

app.get('/mainGame.js', function(req, res){
    res.sendFile(__dirname + '/mainGame.js');
});

app.use(express.static('public'));

var curPlayers = [];

function getPlayerById(id){
    for(var i = 0; i < curPlayers.length; i++){
        if(curPlayers[i].id == id){
            return curPlayers[i];
        }
    }
    return null;
}


io.sockets.on('connection', function(socket){
    //Add socket to list of players
    curPlayers.push({"id":socket.id, "inGame":false, "ready": false});

    socket.on('gyro', function(data){
        console.log(data);
        io.sockets.emit('gyro', data);
    });

    socket.on('ready', function(data){
        console.log("READY FROM " + socket.id + "")
        //Find the player in the list
        var player = getPlayerById(socket.id);
        if(player != null){
            player.ready = true;
        }
        //Find another player who is ready and not in a game
        var otherPlayer = null;
        for(var i = 0; i < curPlayers.length; i++){
            console.log("PLAYER " + curPlayers[i].id + " READY: " + curPlayers[i].ready + " IN GAME: " + curPlayers[i].inGame + "")
            if(curPlayers[i].ready && !curPlayers[i].inGame && curPlayers[i].id != socket.id){
                otherPlayer = curPlayers[i];
                break;
            }
        }
        //If we found a player, start a game
        if(otherPlayer != null){
            console.log("OTHER PLAYER FOUND");
            //Set both players to inGame
            player.inGame = true;
            otherPlayer.inGame = true;

            player.partner = otherPlayer.id;
            otherPlayer.partner = player.id;
            //Emit a start game event
            io.to(player.id).emit('startGame', {listener: false});
            io.to(otherPlayer.id).emit('startGame', {listener: true});
        }else{
            io.to(player.id).emit('waitForPartner');
        }
    });

    socket.on('updateGameState', function(data){
        // console.log("UPDATE FROM " + socket.id + "")
        //Find the player in the list
        var player = getPlayerById(socket.id);
        if(player != null){
            //Find the other player
            var otherPlayer = getPlayerById(player.partner);
            if(otherPlayer != null){
                //Send the game state to the other player
                io.to(otherPlayer.id).emit('updateGameState', data);
            }
        }
    });

});

//Handle socket disconnection
io.sockets.on('disconnect', function(socket){
    //Remove the player from the list
    let player = getPlayerById(socket.id);
    if(player != null){

        console.log("PLAYER " + player.id + " DISCONNECTED");
        //If the player was in a game, remove the other player from the game
        if(player.inGame){
            let otherPlayer = getPlayerById(player.partner);
            if(otherPlayer != null){
                otherPlayer.inGame = false;
                otherPlayer.ready = false;
                otherPlayer.partner = null;
                io.to(otherPlayer.id).emit('resetGame');
            }
        }
        //Remove the player from the list
        curPlayers.splice(curPlayers.indexOf(player), 1);
    }
});


//Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});