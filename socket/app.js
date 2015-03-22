/* This file is the actual game server; it holds all the game information in the state machine and sends
   updates to the various clients
 * */

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var util = require("util");

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

// Run server
var server = app.listen(8000);
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
staticGameData.villages[0] = {top:14,left:22 };
staticGameData.villages[1] = {top:34, left:12 };
staticGameData.villages[2] = {top:60, left:18 };
staticGameData.villages[3] = {top:16, left:43 };
staticGameData.villages[4] = {top:30, left:33 };
staticGameData.villages[5] = {top:49, left:36 };
staticGameData.villages[6] = {top:70, left:36 };
staticGameData.villages[7] = {top:21, left:59 };
staticGameData.villages[8] = {top:38, left:56 };
staticGameData.villages[9] = {top:65, left:54 };
staticGameData.villages[10] = {top:57, left:70 };
staticGameData.villages[11] = {top:40, left:75 };
staticGameData.villages[12] = {top:9, left:73 };

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
staticGameData.bridges[9] = {from:3, to:7};
staticGameData.bridges[10] = {from:4, to:5};
staticGameData.bridges[11] = {from:5, to:6};
staticGameData.bridges[12] = {from:5, to:9};
staticGameData.bridges[13] = {from:5, to:8};
staticGameData.bridges[14] = {from:6, to:9};
staticGameData.bridges[15] = {from:9, to:10};
staticGameData.bridges[16] = {from:8, to:10};
staticGameData.bridges[17] = {from:11, to:10};
staticGameData.bridges[18] = {from:7, to:11};
staticGameData.bridges[19] = {from:7, to:8};
staticGameData.bridges[20] = {from:3, to:12};
staticGameData.bridges[21] = {from:7, to:12};
staticGameData.bridges[22] = {from:12, to:11};

staticGameData.neighbours = [];
staticGameData.neighbours[0] = [1,2,3,4];
staticGameData.neighbours[1] = [0,2,4,6];
staticGameData.neighbours[2] = [0,1,6];
staticGameData.neighbours[3] = [0,7,12];
staticGameData.neighbours[4] = [0,1,5,7];
staticGameData.neighbours[5] = [4,6,8,9];
staticGameData.neighbours[6] = [1,2,5,9];
staticGameData.neighbours[7] = [3,4,8,11,12];
staticGameData.neighbours[8] = [5,7,10];
staticGameData.neighbours[9] = [5,6,10];
staticGameData.neighbours[10] = [8,9,11];
staticGameData.neighbours[11] = [7,10,12];
staticGameData.neighbours[12] = [3,7,11];

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

/* Preset starting placements for 3 players */
staticGameData.startingPlacements = [];
staticGameData.startingPlacements[3] = {};
staticGameData.startingPlacements[3].villages = {};
staticGameData.startingPlacements[3].villages['village_0'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_blue']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_0']['player_red']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_1'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_blue']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_1']['player_red']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_2'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_blue']['P'] = 1;
staticGameData.startingPlacements[3].villages['village_2']['player_yellow']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_4'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_blue']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_4']['player_red']['P'] = 1;
staticGameData.startingPlacements[3].villages['village_5'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_yellow']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_5']['player_red']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_6'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_yellow']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_6']['player_red']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_7'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_yellow']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_7']['player_blue']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_8'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_yellow']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_8']['player_blue']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_9'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_red']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_9']['player_blue']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_10'] = {};
staticGameData.startingPlacements[3].villages['village_10']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_10']['player_yellow']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_11'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_yellow'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_red']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_11']['player_yellow']['P'] = 1;

/* Preset starting placements for 4 players */
staticGameData.startingPlacements[4] = {};
staticGameData.startingPlacements[4].villages = {};
staticGameData.startingPlacements[4].villages['village_0'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_violet']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_0']['player_violet']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_0']['player_red']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_2'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_blue']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_2']['player_yellow']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_2']['player_red']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_3'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_red']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_3']['player_yellow']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_4'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_red']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_4']['player_blue']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_5'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_red']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_5']['player_yellow']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_5']['player_violet']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_7'] = {};
staticGameData.startingPlacements[4].villages['village_7']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_7']['player_blue']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_7']['player_blue']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_8'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_yellow']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_8']['player_blue']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_8']['player_yellow']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_9'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_violet']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_9']['player_yellow']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_9']['player_violet']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_10'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_yellow'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_blue']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_10']['player_blue']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_10']['player_yellow']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_11'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_violet']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_11']['player_red']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_11']['player_red']['Y'] = 1;

/* Misc */
staticGameData.numberOfActiveMessages = 0;
staticGameData.messageHistory = [];
staticGameData.autoSetupRound = false;
staticGameData.presetStartingPositions = true;

/* Configure initial statemachine */
var stateMachine = {};
stateMachine['villages'] = {}; // empty array to hold villages information
stateMachine['current_round'] = null; // keep track of which round we are in
stateMachine['currentPlayer'] = null; // keep track of which player is currently playing
stateMachine['local_player'] = null;
stateMachine['activePlayers'] = {};
stateMachine['activePlayersColors'] = [];
stateMachine['activePlayersColors']['blue'] = null;
stateMachine['activePlayersColors']['red'] = null;
stateMachine['activePlayersColors']['yellow'] = null;
stateMachine['activePlayersColors']['violet'] = null;
stateMachine['playerOrder'] = ['blue','red','yellow','violet']; // for singleplayer
stateMachine['playerOrder'] = stateMachine['playerOrder'].shuffle(); // random order through shuffling
stateMachine['setupRound'] = true;
for(i=0;i<staticGameData.villages.length;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=0;j<staticGameData.colorNames.length;j++) {
        stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]] = {};
        for(k=0;k<staticGameData.guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]][staticGameData.guilds[k].substr(0,1)] = 0;
        }
    }
}
stateMachine.studentsPlacedInThisRound = 0;
stateMachine.neighbours = staticGameData.neighbours;

// Log complete state machine
function logSM() {
    util.log(util.inspect(stateMachine,{showHidden:false,depth:10}));
}

// Listen for server side events
io.sockets.on('connection', function (socket) {
    logSM();
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
            stateMachine.activePlayersColors[colorName] = null;
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
            stateMachine.activePlayersColors[data.local_player] = socket.id;
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
        stateMachine.setupRound = true;
        /* Remove village 12 and its bridges when it is a 3-player game */
        if(stateMachine.playerOrder.length == 3) {
            staticGameData.villages.splice(-1,1);
            staticGameData.bridges.splice(-3,3);
            delete stateMachine['villages']['village_12'];
            io.sockets.emit('_updateGameData', {
                bridges: staticGameData.bridges,
                villages: staticGameData.villages
            });
        }

        io.sockets.emit('_initNewGame');
        if(stateMachine.setupRound && staticGameData.presetStartingPositions) {
            // Combine starting positions with staticGameData
            for(i=0;i<staticGameData.villages.length;i++) {
                for(j=0;j<staticGameData.colorNames.length;j++) {
                    for(k=0;k<staticGameData.guilds.length;k++) {
                        if(typeof staticGameData.startingPlacements[stateMachine.playerOrder.length].villages['village_' + i] != 'undefined') {
                            if(typeof staticGameData.startingPlacements[stateMachine.playerOrder.length].villages['village_' + i]['player_' + stateMachine.playerOrder[j]] != 'undefined') {
                                if(typeof staticGameData.startingPlacements[stateMachine.playerOrder.length].villages['village_' + i]['player_' + stateMachine.playerOrder[j]][staticGameData.guilds[k].substr(0,1)] != 'undefined') {
                                    stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]][staticGameData.guilds[k].substr(0,1)] = 1;
                                    console.log('Setting village ' + i + ' for player ' + stateMachine.playerOrder[j] + ' for guild ' + staticGameData.guilds[k]);

                                    io.sockets.emit('_updateGuildShield', {
                                        'village_id': i,
                                        guild_id: k,
                                        guildName: staticGameData.guilds[k],
                                        player: stateMachine.playerOrder[j],
                                        silent: true,
                                        typeOfPlacing: 'master'
                                    });
                                }
                            }
                        }
                    }
                }
            }
            io.sockets.emit('_updateStateMachineValue', {
                villages: stateMachine.villages
            });
            stateMachine.setupRound = false;
            io.sockets.emit('_updateStateMachineValue', {
                setupRound:stateMachine.setupRound
            });
        }
        io.sockets.emit('_updateStateMachineValue', {
            currentPlayer:stateMachine.currentPlayer
        });
    });

    // When a bridge has been removed, update stateMachine etc
    socket.on('__removeBridge', function(data) {
        // Do some checks whether this bridge still exists etc
        // Remove the toVillage from the fromVillage's neighbours list
        stateMachine.neighbours[data.fromVillage].remove(data.toVillage);
        // Remove the fromVillage from the toVillage's neighbours list
        stateMachine.neighbours[data.toVillage].remove(data.fromVillage);
        // Update stateMachine
        io.sockets.emit('_updateStateMachineValue', {
            neighbours: stateMachine.neighbours
        });
        // Find bridge
        bridge_id = false;
        for(bridge in staticGameData.bridges) {
            if(
                (staticGameData.bridges[bridge].from == data.fromVillage && staticGameData.bridges[bridge].to == data.toVillage)
                ||
                (staticGameData.bridges[bridge].to == data.fromVillage && staticGameData.bridges[bridge].from == data.toVillage)
            )
            {
                bridge_id = bridge;
            }
        }
        if(bridge_id) {
            // Remove bridge
            io.sockets.emit('_removeBridge', {
                bridge_id: bridge_id
            });

            // Move students


            // Define who is next
            index = stateMachine.playerOrder.indexOf(stateMachine.currentPlayer);
            if(typeof index != 'undefined') {
                if(typeof stateMachine.playerOrder[index+1] != 'undefined') {
                    nextPlayer = stateMachine.playerOrder[index + 1];
                } else {
                    nextPlayer = stateMachine.playerOrder[0];
                }
                // Update counters
                stateMachine.studentsPlacedInThisRound = 0;
                // Update the state machine and the turn indicator
                stateMachine.currentPlayer = nextPlayer;
                io.sockets.emit('_updateStateMachineValue', {
                    currentPlayer:stateMachine.currentPlayer
                });
            }
        } else {
            io.sockets.send('Somebody cheated! Game is voided.');
        }
    });

    // When player has placed a master, update stateMachine etc
    socket.on('__placeMaster', function(data) {
        data.typeOfPlacing = 'master';
        if(data.village_id == 'auto' && stateMachine.setupRound) {
            // Auto placement for debugging purposes; choose village & guild automatically
            canPlaceTile = false;
            do {
                village_id = getRandomVillageForAutoSetupRound();
                guild_id = getRandomGuildForAutoSetupRound();

                guildName = staticGameData.guilds[guild_id];

                sum = 0;
                sumForPlayer = 0;
                sumGuildForPlayer = 0;
                specificTileAmount = 0;
                guildAllowed = true;

                // check whether this specific tile is available
                // check whether the player already has placed this guild somewhere
                // check whether there are less than 3 masters in this village
                // check whether the current player has less than 2 masters in this village
                for(var village in stateMachine['villages']) {
                    for(var player in stateMachine['villages'][village]) {
                        for(var guild in stateMachine['villages'][village][player]) {
                            amount = stateMachine['villages'][village][player][guild];
                            playerColor = player.replace('player_','');
                            if(typeof amount == 'number') {
                                if (village.substr(village.indexOf('_') + 1) == village_id) {
                                    sum += amount;
                                    if (playerColor == stateMachine.currentPlayer) {
                                        sumForPlayer += amount;
                                    }
                                }
                                if (playerColor == stateMachine.currentPlayer && guild == guildName.substr(0, 1)) {
                                    sumGuildForPlayer += amount;
                                }
                                if (guild == guildName.substr(0, 1) && village.substr(village.indexOf('_') + 1) == village_id) {
                                    specificTileAmount += amount;
                                }
                            }
                        }
                    }
                }
                console.log('Sum guild for player ' + stateMachine.currentPlayer + '; ' + sumGuildForPlayer);

                /* The placing limits are different for a 3 player game than for a 4 player game */
                console.log('Active players length; ' + stateMachine.playerOrder.length);
                if(stateMachine.playerOrder.length == 3) {
                    villageLimit = 2;
                    perPlayerLimit = 1;
                } else {
                    villageLimit = 3;
                    perPlayerLimit = 2;
                }

                if(
                    sum < villageLimit &&
                    sumForPlayer < perPlayerLimit &&
                    sumGuildForPlayer == 0 &&
                    specificTileAmount == 0
                ) {
                    canPlaceTile = true;
                    data.guildName = guildName;
                    data.guild_id = guild_id;
                    data.village_id = village_id;
                    data.player = stateMachine.currentPlayer;
                }
            } while(!canPlaceTile);
        } else if(data.village_id == 'auto' && !stateMachine.setupRound) {
            return;
        }

        console.log('Updating state machine; village ' + data.village_id + ' - ' + data.player + ' - ' + data.guildName);
        // Update state machine
        stateMachine['villages']['village_' + data.village_id]['player_' + data.player][data.guildName.substr(0,1)] += 1;
        io.sockets.emit('_updateStateMachineValue', {
            villages:stateMachine.villages
        });

        /* Update guild shields on all clients */
        console.log('Updating guild shields for all clients');
        io.sockets.emit('_updateGuildShield', data);

        // Calculate whether the setup round is finished (ie; check if all players have 5 of all guilds left)
        if(stateMachine.setupRound == true) {
            // Calculate end of turn
            total = [];
            for(i=0;i<staticGameData.villages.length;i++) {
                for(j=0;j<stateMachine.playerOrder.length;j++) {
                    for(k=0;k<staticGameData.guilds.length;k++) {
                        guilds = stateMachine['villages']['village_' + i]['player_' + stateMachine.playerOrder[j]][staticGameData.guilds[k].substr(0,1)];
                        if(typeof total[stateMachine.playerOrder[j]] == 'undefined') {
                            total[stateMachine.playerOrder[j]] = guilds;
                        } else {
                            total[stateMachine.playerOrder[j]] += guilds;
                        }
                    }
                }
            }
            stateMachine.setupRound = false;
            for(var color in total) {
                if(total.hasOwnProperty(color)) {
                    if (total[color] != 7) {
                        // If all colors have 7 masters placed, the setup round is over, if not, it is still going
                        stateMachine.setupRound = true;
                    }
                }
            }
            if(!stateMachine.setupRound) {
                io.sockets.emit('_updateStateMachineValue', {
                    setupRound:stateMachine.setupRound
                });
                io.sockets.send('Set up round is over, game starts! Good luck!');
            }
        }

        // Define who is next
        index = stateMachine.playerOrder.indexOf(stateMachine.currentPlayer);
        if(typeof index != 'undefined') {
            if(typeof stateMachine.playerOrder[index+1] != 'undefined') {
                nextPlayer = stateMachine.playerOrder[index + 1];
            } else {
                nextPlayer = stateMachine.playerOrder[0];
            }
            // Update counters
            stateMachine.studentsPlacedInThisRound = 0;
            // Update the state machine and the turn indicator
            stateMachine.currentPlayer = nextPlayer;
            io.sockets.emit('_updateStateMachineValue', {
                currentPlayer:stateMachine.currentPlayer
            });
        }
    });

    // When player has placed a student, update stateMachine etc
    socket.on('__placeStudent', function(data) {
        data.typeOfPlacing = 'student';
        // check if placing a student is even possible
        mastersOnGuild = stateMachine.villages['village_' + data.village_id]['player_' + data.player][data.guildName.substr(0,1)];
        if(mastersOnGuild != 1) {
            console.log('Placing student on this guild is not possible; somebody is cheating?');
            return;
        }

        // Update state machine
        console.log('Updating state machine; village ' + data.village_id + ' - ' + data.player + ' - ' + data.guildName);
        stateMachine['villages']['village_' + data.village_id]['player_' + data.player][data.guildName.substr(0,1)] += 1;
        io.sockets.emit('_updateStateMachineValue', {
            villages:stateMachine.villages
        });

        /* Update guild shields on all clients */
        console.log('Updating guild shields for all clients');
        io.sockets.emit('_updateGuildShield', data);

        // Keep track of how many students this round have been placed
        stateMachine.studentsPlacedInThisRound++;
        console.log(stateMachine.studentsPlacedInThisRound);

        // If two, decide who is next
        if(stateMachine.studentsPlacedInThisRound >= 2) {
            index = stateMachine.playerOrder.indexOf(stateMachine.currentPlayer);
            if (typeof index != 'undefined') {
                if (typeof stateMachine.playerOrder[index + 1] != 'undefined') {
                    nextPlayer = stateMachine.playerOrder[index + 1];
                } else {
                    nextPlayer = stateMachine.playerOrder[0];
                }
                // Update counters
                stateMachine.studentsPlacedInThisRound = 0;
                // Update the state machine and the turn indicator
                stateMachine.currentPlayer = nextPlayer;
                io.sockets.emit('_updateStateMachineValue', {
                    currentPlayer: stateMachine.currentPlayer
                });
            }
        }
    });

    function getRandomVillageForAutoSetupRound() {
        return Math.floor(Math.random(0,1)*staticGameData.villages.length);
    }

    function getRandomGuildForAutoSetupRound() {
        return Math.floor(Math.random(0,1)*staticGameData.guilds.length);
    }

});
