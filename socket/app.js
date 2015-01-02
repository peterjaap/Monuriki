var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var util = require("util");

app.use(express.static(path.join(__dirname, 'public')));

// Run server
var server = app.listen(80);
var io = require('socket.io')(server);

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

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}

/* Configure game data object */
var gameData = {};

/* Define the guilds */
gameData.guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

/* Define positions of villages */
gameData.villages = [];
gameData.villages[0] = {top:5,left:8 };
gameData.villages[1] = {top:36, left:14 };
gameData.villages[2] = {top:64, left:6 };
gameData.villages[3] = {top:5, left:43 };
gameData.villages[4] = {top:23, left:33 };
gameData.villages[5] = {top:49, left:36 };
gameData.villages[6] = {top:79, left:28 };
gameData.villages[7] = {top:21, left:59 };
gameData.villages[8] = {top:38, left:56 };
gameData.villages[9] = {top:78, left:74 };
gameData.villages[10] = {top:9, left:73 };
gameData.villages[11] = {top:40, left:77 };
gameData.villages[12] = {top:57, left:70 };
gameData.villageWidth = 0.12;
gameData.villageHeight = 0.12;

/* Define the bridges that connect the villages
 * From and to refers to index key in the gameData.villages object above
 */
gameData.bridges = [];
gameData.bridges[0] = {from:0, to:2};
gameData.bridges[1] = {from:2, to:6};
gameData.bridges[2] = {from:0, to:1};
gameData.bridges[3] = {from:1, to:2};
gameData.bridges[4] = {from:0, to:4};
gameData.bridges[5] = {from:4, to:1};
gameData.bridges[6] = {from:1, to:6};
gameData.bridges[7] = {from:0, to:3};
gameData.bridges[8] = {from:4, to:7};
gameData.bridges[9] = {from:3, to:10};
gameData.bridges[10] = {from:7, to:10};
gameData.bridges[11] = {from:10, to:11};
gameData.bridges[12] = {from:3, to:7};
gameData.bridges[13] = {from:4, to:5};
gameData.bridges[14] = {from:5, to:6};
gameData.bridges[15] = {from:5, to:9};
gameData.bridges[16] = {from:5, to:8};
gameData.bridges[17] = {from:6, to:9};
gameData.bridges[18] = {from:9, to:12};
gameData.bridges[19] = {from:8, to:12};
gameData.bridges[20] = {from:11, to:12};
gameData.bridges[21] = {from:7, to:11};
gameData.bridges[22] = {from:7, to:8};

/* Define the colors that are used for the various players */
/**
 *  - Red (Ro-Tarya)
 *  - Blue (Ba-Lao)
 *  - Yellow (Gyl-Den)
 *  - Violet (Li-Lamas)
 */
gameData.colorNames = ['violet','yellow','red','blue'];
gameData.colors = {};
gameData.colors['blue'] = {};
gameData.colors['blue']['gamecanvasBackground'] = 'lightblue';
gameData.colors['blue']['controldeckBackground'] = '#7ec1d7';

gameData.colors['red'] = {};
gameData.colors['red']['gamecanvasBackground'] = '#f46d6d';
gameData.colors['red']['controldeckBackground'] = '#b80000';

gameData.colors['yellow'] = {};
gameData.colors['yellow']['gamecanvasBackground'] = '#fffcaa';
gameData.colors['yellow']['controldeckBackground'] = '#d8d500';

gameData.colors['violet'] = {};
gameData.colors['violet']['gamecanvasBackground'] = '#e6aaff';
gameData.colors['violet']['controldeckBackground'] = '#58007d';

gameData.numberOfActiveMessages = 0;

gameData.playerOrder = ['blue','red','yellow','violet']; // initial order, this gets shuffled

gameData.messageHistory = [];

gameData.aiDifficulty = 'easy';

gameData.gameMode = 'multiplayer';

/* Configure initial statemachine */
var stateMachine = {};
stateMachine['villages'] = {}; // empty array to hold villages information
stateMachine['current_round'] = null; // keep track of which round we are in
stateMachine['current_player'] = null; // keep track of which player is currently playing
stateMachine['local_player'] = null;
stateMachine['activePlayers'] = [];
for(i=0;i<gameData.villages.length;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=0;j<gameData.colorNames.length;j++) {
        stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]] = {};
        for(k=0;k<gameData.guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]][gameData.guilds[k].substr(0,1)] = 0;
        }
    }
}


function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    if(stateMachine['in_lobby']) {
        // stop game and send notice to other players
    } else {

    }

};

// Listen for events
io.sockets.on('connection', function (socket) {
    util.log("New player has connected: "+socket.id);
    socket.on("disconnect", onClientDisconnect);

    socket.emit('gameData', {
        gameData: gameData
    });
    socket.on('chooseColor', function(data) {
        stateMachine['current_player'] = data.local_player; // local player always starts
        stateMachine['current_round'] = 0;

        if(gameData.gameMode == 'singleplayer') {
            gameData.playerOrder.remove(data.local_player).shuffle().unshift(data.local_player); // move the local player up to the front in the play order
            stateMachine['local_player'] = data.local_player;
            console.log('Local player is ' + stateMachine['local_player'] + ' and we are in round ' + stateMachine.current_round);
        } else {
            gameData.playerOrder.shuffle();
            stateMachine['activePlayers'].push(data.local_player);
            console.log('Client ' + socket.id + ' is ' + data.local_player + ' and we are in round ' + stateMachine.current_round);
            socket.emit('activePlayersUpdate', {
               activePlayers: stateMachine['activePlayers']
            });
        }
    });

    socket.on('placeMaster', function(data) {
        placeMaster(data);
    });

    function placeMaster(data) {
        // Update state machine
        stateMachine['villages']['village_' + data.village_id]['player_' + data.player][data.guildName.substr(0,1)] += 1;
        // Calculate end of turn
        var total = 0;
        for(i=0;i<gameData.villages.length;i++) {
            guildsPlayer = stateMachine['villages']['village_' + i]['player_' + data.player];
            for(guild in guildsPlayer) {
                total += guildsPlayer[guild];
            }
        }
        if(gameData.gameMode == 'singleplayer') {
            if(data.player == stateMachine.local_player) {
                socket.emit('showMessage', {message: 'You have placed ' + total + ' of the 7 masters.'});
            }
            nextSingleplayer();
        } else {
            nextMultiplayer();
        }
    }

    function nextMultiplayer() {
        // not yet
    }

    function nextSingleplayer() {
        if(stateMachine['current_player'] == gameData.playerOrder[gameData.playerOrder.length-1]) {
            stateMachine['current_round'] += 1;
            stateMachine['current_player'] = gameData.playerOrder[0];
            console.log('Current player is ' + stateMachine['current_player'] + ' and we are now in round ' + stateMachine['current_round']);
        } else {
            stateMachine['current_player'] = gameData.playerOrder[gameData.playerOrder.indexOf(stateMachine['current_player'])+1];
            console.log('Current player is ' + stateMachine['current_player'] + ' and we are in round ' + stateMachine['current_round']);
        }
        var localTurn = (stateMachine['current_player'] == stateMachine['local_player']);
        socket.emit('passTurn', {current_player: stateMachine['current_player'], localTurn: localTurn, current_round:stateMachine['current_round']});

        if(stateMachine['current_round'] == gameData.guilds.length) {
            // @TODO set stateMachine data needed for normal play - is there any needed?
        }

        // If the current player is not the local player, do some AI stuff
        if(!localTurn) {
            setTimeout(function() {
                doAITurn();
            }, 1000); // wait a few seconds for the AI to make its move to simulate a local player
        }
    }

    function randomVillage() {
        return Math.floor(Math.random(0,1)*gameData.villages.length);
    }

    function randomGuild() {
        return Math.floor(Math.random(0,1)*gameData.guilds.length);
    }

    function doAITurn() {
        var action = 'placeTile';

        if(action == 'placeTile') {
            canPlaceTile = false;
            do {
                if(gameData.aiDifficulty == 'easy') {
                    // Completely random
                    village_id = randomVillage();
                    guild_id = randomGuild();
                } else if(shangrila.aiDifficulty == 'medium') {
                    //@TODO implement
                    // give a greater probability for the AI to choose a village with > 0 masters randomly
                } else if(shangrila.aiDifficulty == 'hard') {
                    //@TODO implement
                    // first try to place a master in a village with 2 masters, then with 1
                    // maybe also try to pick a village that is not connected to a village where the AI already has masters
                }

                guildName = gameData.guilds[guild_id];

                sum = 0;
                sumForPlayer = 0;
                sumGuildForPlayer = 0;
                specificTileAmount = 0;

                // check whether this specific tile is available
                // check whether the player already has placed this guild somewhere
                // check whether there are less than 3 masters in this village
                // check whether the current player has less than 2 masters in this village
                for(var village in stateMachine['villages']) {
                    for(var player in stateMachine['villages'][village]) {
                        for(var guild in stateMachine['villages'][village][player]) {
                            amount = stateMachine['villages'][village][player][guild];
                            if(village.substr(village.indexOf('_')+1) == village_id) {
                                sum += amount;
                                if(player == stateMachine.current_player) {
                                    sumForPlayer += amount;
                                }
                            }
                            if(player == stateMachine.current_player && guild == guildName.substr(0,1) && amount != 0) {
                                sumGuildForPlayer += amount;
                                console.log('Trying to place a guild that has already been placed!');
                            }
                            if(guild == guildName.substr(0,1) && village.substr(village.indexOf('_')+1) == village_id) {
                                specificTileAmount += amount;
                            }
                        }
                    }
                }
                if(sum < 3 && sumForPlayer < 2 && sumGuildForPlayer == 0 && specificTileAmount == 0) {
                    canPlaceTile = true;
                }
            } while(!canPlaceTile);

            console.log(stateMachine.current_player + ' places a ' + guildName + ' master on village ' + village_id);
            var data = {
                player: stateMachine.current_player,
                guild_id: guild_id,
                guildName: guildName,
                village_id: village_id
            };
            socket.emit('placeMaster', data);
            placeMaster(data);
        }
    }

});