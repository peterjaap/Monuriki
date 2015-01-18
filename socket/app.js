/* This file is the actual game server; it holds all the game information in the state machine and sends
   updates to the various clients

   TODO:
   - apply consistency in how to identify players; through their client ID or their color?
 * */

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var util = require("util");

app.use(express.static(path.join(__dirname, 'public')));

// Run server
var server = app.listen(80);
var io = require('socket.io')(server);

/* Array functions */
/* Remove item from array */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/* Pick random element from array */
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
};

/* Shuffle array */
Array.prototype.shuffle = function() {
    for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
};

/* Return size (length) of object */
Object.prototype.size = function() {
    var size = 0, key;
    for (key in this) {
        if (this.hasOwnProperty(key)) size++;
    }
    return size;
};

/* Pick random element from object */
Object.prototype.random = function() {
    var keys = Object.keys(this);
    return this[keys[ keys.length * Math.random() << 0]];
};

/* Configure game data object */
var staticGameData = {};

/* Define the guilds */
staticGameData.guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

/* Define positions of villages */
staticGameData.villages = [];
staticGameData.villages[0] = {top:5,left:8 };
staticGameData.villages[1] = {top:36, left:14 };
staticGameData.villages[2] = {top:64, left:6 };
staticGameData.villages[3] = {top:5, left:43 };
staticGameData.villages[4] = {top:23, left:33 };
staticGameData.villages[5] = {top:49, left:36 };
staticGameData.villages[6] = {top:79, left:28 };
staticGameData.villages[7] = {top:21, left:59 };
staticGameData.villages[8] = {top:38, left:56 };
staticGameData.villages[9] = {top:78, left:74 };
staticGameData.villages[10] = {top:9, left:73 };
staticGameData.villages[11] = {top:40, left:77 };
staticGameData.villages[12] = {top:57, left:70 };
staticGameData.villageWidth = 0.12;
staticGameData.villageHeight = 0.12;

/* Define the bridges that connect the villages
 * From and to refers to index key in the staticGameData.villages object above
 */
staticGameData.bridges = [];
staticGameData.bridges[0] = {from:0, to:2};
staticGameData.bridges[1] = {from:2, to:6};
staticGameData.bridges[2] = {from:0, to:1};
staticGameData.bridges[3] = {from:1, to:2};
staticGameData.bridges[4] = {from:0, to:4};
staticGameData.bridges[5] = {from:4, to:1};
staticGameData.bridges[6] = {from:1, to:6};
staticGameData.bridges[7] = {from:0, to:3};
staticGameData.bridges[8] = {from:4, to:7};
staticGameData.bridges[9] = {from:3, to:10};
staticGameData.bridges[10] = {from:7, to:10};
staticGameData.bridges[11] = {from:10, to:11};
staticGameData.bridges[12] = {from:3, to:7};
staticGameData.bridges[13] = {from:4, to:5};
staticGameData.bridges[14] = {from:5, to:6};
staticGameData.bridges[15] = {from:5, to:9};
staticGameData.bridges[16] = {from:5, to:8};
staticGameData.bridges[17] = {from:6, to:9};
staticGameData.bridges[18] = {from:9, to:12};
staticGameData.bridges[19] = {from:8, to:12};
staticGameData.bridges[20] = {from:11, to:12};
staticGameData.bridges[21] = {from:7, to:11};
staticGameData.bridges[22] = {from:7, to:8};

/* Define the colors that are used for the various players */
/**
 *  - Red (Ro-Tarya)
 *  - Blue (Ba-Lao)
 *  - Yellow (Gyl-Den)
 *  - Violet (Li-Lamas)
 */
staticGameData.colorNames = ['violet','yellow','red','blue'];
staticGameData.colors = {};
staticGameData.colors['blue'] = {};
staticGameData.colors['blue']['gamecanvasBackground'] = 'lightblue';
staticGameData.colors['blue']['controldeckBackground'] = '#7ec1d7';

staticGameData.colors['red'] = {};
staticGameData.colors['red']['gamecanvasBackground'] = '#f46d6d';
staticGameData.colors['red']['controldeckBackground'] = '#b80000';

staticGameData.colors['yellow'] = {};
staticGameData.colors['yellow']['gamecanvasBackground'] = '#fffcaa';
staticGameData.colors['yellow']['controldeckBackground'] = '#d8d500';

staticGameData.colors['violet'] = {};
staticGameData.colors['violet']['gamecanvasBackground'] = '#e6aaff';
staticGameData.colors['violet']['controldeckBackground'] = '#58007d';

staticGameData.numberOfActiveMessages = 0;

staticGameData.messageHistory = [];

staticGameData.aiDifficulty = 'easy';

staticGameData.gameMode = 'multiplayer';

/* Configure initial statemachine */
var stateMachine = {};
stateMachine['villages'] = {}; // empty array to hold villages information
stateMachine['current_round'] = null; // keep track of which round we are in
stateMachine['currentPlayer'] = null; // keep track of which player is currently playing
stateMachine['local_player'] = null;
stateMachine['activePlayers'] = {};
stateMachine['playerOrder'] = ['blue','red','yellow','violet']; // for singleplayer
stateMachine['playerOrder'] = stateMachine['playerOrder'].shuffle(); // random order through shuffling
for(i=0;i<staticGameData.villages.length;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=0;j<staticGameData.colorNames.length;j++) {
        stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]] = {};
        for(k=0;k<staticGameData.guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]][staticGameData.guilds[k].substr(0,1)] = 0;
        }
    }
}

// Log complete state machine
function logSM() {
    util.log(util.inspect(stateMachine,{showHidden:false,depth:10}));
}

// Listen for server side events
io.sockets.on('connection', function (socket) {
    // Send message new player has connected
    util.log("New player has connected: "+socket.id);

    // Send relevant game data to the client
    socket.emit('_setInitialGameData', {
        staticGameData:staticGameData,
        stateMachine:stateMachine
    });

    // Asynchronous functions
    // Set action what to do when player disconnects
    socket.on('disconnect', function () {
        util.log("Player has disconnected: "+this.id);
        if(stateMachine.activePlayers.hasOwnProperty(this.id)) {
            colorName = stateMachine.activePlayers[this.id];
            // If the game initiator leaves the game, select a random new game initiator
            if(stateMachine.gameInitiator == colorName) {
                stateMachine.gameInitiator = stateMachine.activePlayers.random();
                console.log('New game initiator is ' + stateMachine.gameInitiator);
                io.sockets.emit('_updateStateMachineValue', {
                    gameInitiator:stateMachine.gameInitiator
                });
            }
            // Remove player from stateMachine
            delete stateMachine.activePlayers[this.id];
        }
        console.log('Current players; ');
        util.log(util.inspect(stateMachine.activePlayers,{showHidden:false,depth:10}));
        // Update all clients
        io.sockets.emit('activePlayersUpdate', stateMachine.activePlayers);
    });

    socket.on('__showSplashScreen', function () {
        socket.emit('_showSplashScreen');
    });

    // When player has chosen a color, update stateMachine
    socket.on('__choseColor', function(data) {
        stateMachine['current_round'] = 0;

        if(staticGameData.gameMode == 'singleplayer') {
            stateMachine['currentPlayer'] = data.local_player; // local player always starts
            stateMachine.playerOrder.remove(data.local_player).shuffle().unshift(data.local_player); // move the local player up to the front in the play order
            stateMachine['local_player'] = data.local_player;
            console.log('Local player is ' + stateMachine['local_player'] + ' and we are in round ' + stateMachine.current_round);
        } else {
            // Set current client id as with color key in activePlayers list
            stateMachine.activePlayers[socket.id] = data.local_player;
            console.log('Client ' + socket.id + ' is ' + data.local_player + ' and we are in round ' + stateMachine.current_round);
            if(stateMachine.activePlayers.size() == 1) {
                stateMachine.gameInitiator = data.local_player;
            }
            // Update all clients
            io.sockets.emit('_updateStateMachineValue', {
                gameInitiator:stateMachine.gameInitiator
            });
            console.log('Current players; ');
            util.log(util.inspect(stateMachine.activePlayers,{showHidden:false,depth:10}));
            io.sockets.emit('activePlayersUpdate', stateMachine.activePlayers);
        }
    });

    // Game initiator has started a new game
    socket.on('__initNewGame', function() {
        // Set player order
        var playerOrder = [];
        for(var playerClientId in stateMachine.activePlayers) {
            if(stateMachine.activePlayers.hasOwnProperty(playerClientId)) {
                playerOrder.push(stateMachine.activePlayers[playerClientId]);
            }
        }
        stateMachine.playerOrder = playerOrder.shuffle();
        console.log('Player order; ');
        util.log(util.inspect(stateMachine.playerOrder));
        stateMachine.currentPlayer = stateMachine.playerOrder[0];
        io.sockets.emit('_initNewGame');
        io.sockets.emit('_updateStateMachineValue', {
            currentPlayer:stateMachine.currentPlayer
        });
    });

    // When player has placed a master, update stateMachine etc
    socket.on('__placeMaster', function(data) {
        // Update state machine
        stateMachine['villages']['village_' + data.village_id]['player_' + data.player][data.guildName.substr(0,1)] += 1;
        // Calculate end of turn
        var total = 0;
        for(i=0;i<staticGameData.villages.length;i++) {
            guildsPlayer = stateMachine['villages']['village_' + i]['player_' + data.player];
            for(guild in guildsPlayer) {
                if(guildsPlayer.hasOwnProperty('guild')) {
                    total += guildsPlayer[guild];
                }
            }
        }

        /* Update guild shields on all clients */
        console.log('Updating guild shields for all clients');
        io.sockets.emit('_updateGuildShield', data);

        // Calculate whether the setup round is finished (ie; check if all players have 5 of all guilds left)

        // Define who is next
        index = stateMachine.playerOrder.indexOf(stateMachine.currentPlayer);
        if(typeof index != 'undefined') {
            if(typeof stateMachine.playerOrder[index+1] != 'undefined') {
                nextPlayer = stateMachine.playerOrder[index + 1];
            } else {
                nextPlayer = stateMachine.playerOrder[0];
            }
            // Update the state machine and the turn indicator
            stateMachine.currentPlayer = nextPlayer;
            io.sockets.emit('_updateStateMachineValue', {
                currentPlayer:stateMachine.currentPlayer
            });
        }
    });

});
