/* This file is the actual game server; it holds all the game information in the state machine and sends
   updates to the various clients
 * */

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var util = require("util");
var stateMachine;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

// Run server
var server = app.listen(8000);
var io = require('socket.io')(server);

eval(fs.readFileSync('tools.js').toString());

/* Include static game data */
eval(fs.readFileSync('staticGameData.js').toString());

// Log complete state machine
function logSM() {
    util.log(util.inspect(stateMachine,{showHidden:false,depth:10}));
}

function resetStateMachine() {
    /* Configure initial statemachine */
    stateMachine = {};
    stateMachine['villages'] = {}; // empty array to hold villages information
    stateMachine['current_round'] = null; // keep track of which round we are in
    stateMachine['currentPlayer'] = null; // keep track of which player is currently playing
    stateMachine['local_player'] = null;
    stateMachine['activePlayers'] = {};
    stateMachine['activePlayersColors'] = [];
    stateMachine['activePlayersColors']['blue'] = null;
    stateMachine['activePlayersColors']['red'] = null;
    stateMachine['activePlayersColors']['green'] = null;
    stateMachine['activePlayersColors']['violet'] = null;
    stateMachine['playerOrder'] = ['blue','red','green','violet']; // for singleplayer
    stateMachine['playerOrder'] = stateMachine['playerOrder'].shuffle(); // random order through shuffling
    stateMachine['setupRound'] = true;
    for(i=0;i<staticGameData.villagePositions.length;i++) {
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
    return stateMachine;
}

stateMachine = resetStateMachine();

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
        util.log("Player has disconnected: " + this.id);
        if(stateMachine.setupRound == false) {
            if (stateMachine.activePlayers.hasOwnProperty(this.id)) {
                colorName = stateMachine.activePlayers[this.id];
                stateMachine = resetStateMachine();
                io.sockets.emit('_setInitialGameData', {
                    staticGameData: staticGameData,
                    stateMachine: stateMachine
                });
                io.sockets.emit('_showSplashScreen');
                setTimeout(function () {
                    io.sockets.emit('message', 'Player ' + colorName + ' quit; game ended.');
                }, 500);
            } else {
                console.log('Fatal error; disconnecting player not found in client list.');
            }
        } else {
            if (stateMachine.activePlayers.hasOwnProperty(this.id)) {
                colorName = stateMachine.activePlayers[this.id];
                stateMachine.activePlayersColors[colorName] = null;
                // If the game initiator leaves the game, select a random new game initiator
                if (stateMachine.gameInitiator == colorName) {
                    stateMachine.gameInitiator = stateMachine.activePlayers.random();
                    console.log('New game initiator is ' + stateMachine.gameInitiator);
                    io.sockets.emit('_updateStateMachineValue', {
                        gameInitiator: stateMachine.gameInitiator
                    });
                }
                // Remove player from stateMachine
                delete stateMachine.activePlayers[this.id];
            }
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
    socket.on('__initNewGame', function(options) {
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
            villages = staticGameData.villagePositions;
            villages.splice(-1,1);
            bridges = staticGameData.bridgePositions;
            bridges.splice(-3,3);
            delete stateMachine['villages']['village_12'];
            io.sockets.emit('_updateGameData', {
                bridges: bridges,
                villages: villages
            });
        }

        io.sockets.emit('_initNewGame');
        if(stateMachine.setupRound && options.presetStartingPositions) {
            // Combine starting positions with staticGameData
            for(i=0;i<staticGameData.villagePositions.length;i++) {
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
        for(bridge in staticGameData.bridgePositions) {
            if(
                (staticGameData.bridgePositions[bridge].from == data.fromVillage && staticGameData.bridgePositions[bridge].to == data.toVillage)
                ||
                (staticGameData.bridgePositions[bridge].to == data.fromVillage && staticGameData.bridgePositions[bridge].from == data.toVillage)
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
            for(i=0;i<staticGameData.villagePositions.length;i++) {
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
        return Math.floor(Math.random(0,1)*staticGameData.villagePositions.length);
    }

    function getRandomGuildForAutoSetupRound() {
        return Math.floor(Math.random(0,1)*staticGameData.guilds.length);
    }

});
