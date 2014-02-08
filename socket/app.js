var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

/* Javascript files */
io.static.add('/js/utils.js', {file: 'js/utils.js'});
io.static.add('/js/boot.js', {file: 'js/boot.js'});
io.static.add('/js/client.js', {file: 'js/client.js'});
/* Images */
io.static.add('/images/fortress.png', {mime: {
        type: 'image/png',
        encoding: 'utf8',
        gzip: true
    },
    file: 'images/fortress.png'}
);
io.static.add('/images/loader.gif', {mime: {
        type: 'image/gif',
        encoding: 'utf8',
        gzip: true
    },
        file: 'images/loader.gif'}
);

// Run server
app.listen(80);

// Serve HTML file
function handler (req, res) {
    var htmlFile = 'index.html';
    fs.readFile(__dirname + '/' + htmlFile,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + htmlFile);
            }

            res.writeHead(200);
            res.end(data);
        });
}


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

/* Configure initial statemachine */
var stateMachine = {};
stateMachine['villages'] = {}; // empty array to hold villages information
stateMachine['current_round'] = null; // keep track of which round we are in
stateMachine['current_player'] = null; // keep track of which player is currently playing
stateMachine['human_player'] = null;
for(i=0;i<gameData.villages.length;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=0;j<gameData.colorNames.length;j++) {
        stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]] = {};
        for(k=0;k<gameData.guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]][gameData.guilds[k].substr(0,1)] = 0;
        }
    }
}

//console.log(require('util').inspect(stateMachine, true, 10));

// Listen for events
io.sockets.on('connection', function (socket) {
    socket.emit('gameData', {
        gameData: gameData
    });
    socket.on('chooseColor', function(data) {
        gameData.playerOrder.remove(data.human_player).shuffle().unshift(data.human_player); // move the human player up to the front in the play order
        stateMachine['human_player'] = data.human_player;
        stateMachine['current_player'] = data.human_player; // human player always starts
        stateMachine['current_round'] = 0;
        console.log('Human player is ' + stateMachine['human_player'] + ' and we are in round ' + stateMachine.current_round);
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
        if(data.player == stateMachine.human_player) {
            socket.emit('showMessage', {message: 'You have placed ' + total + ' of the 7 masters.'});
        }
        next();
    }

    function next() {
        if(stateMachine['current_player'] == gameData.playerOrder[gameData.playerOrder.length-1]) {
            stateMachine['current_round'] += 1;
            stateMachine['current_player'] = gameData.playerOrder[0];
            console.log('Current player is ' + stateMachine['current_player'] + ' and we are now in round ' + stateMachine['current_round']);
        } else {
            stateMachine['current_player'] = gameData.playerOrder[gameData.playerOrder.indexOf(stateMachine['current_player'])+1];
            console.log('Current player is ' + stateMachine['current_player'] + ' and we are in round ' + stateMachine['current_round']);
        }
        var humanTurn = (stateMachine['current_player'] == stateMachine['human_player']);
        socket.emit('passTurn', {current_player: stateMachine['current_player'], humanTurn: humanTurn, current_round:stateMachine['current_round']});

        if(stateMachine['current_round'] == gameData.guilds.length) {
            // @TODO set stateMachine data needed for normal play - is there any needed?
        }

        // If the current player is not the human player, do some AI stuff
        if(!humanTurn) {
            setTimeout(function() {
                doAITurn();
            }, 1000); // wait a few seconds for the AI to make its move to simulate a human player
        }
    }

    function doAITurn() {
        var action = 'placeTile';

        if(action == 'placeTile') {
            var canPlaceTile = false;
            do {
                if(gameData.aiDifficulty == 'easy') {
                    // Completely random
                    village_id = Math.floor(Math.random(0,1)*gameData.villages.length);
                    guild_id = Math.floor(Math.random(0,1)*gameData.guilds.length);
                } else if(shangrila.aiDifficulty == 'medium') {
                    //@TODO implement
                    // give a greater probability for the AI to choose a village with > 0 masters randomly
                } else if(shangrila.aiDifficulty == 'hard') {
                    //@TODO implement
                    // first try to place a master in a village with 2 masters, then with 1
                    // maybe also try to pick a village that is not connected to a village where the AI already has masters
                }

                guildName = gameData.guilds[guild_id];

                // Check availability
                if(stateMachine['villages']['village_' + village_id]['player_' + stateMachine.current_player][guildName.substr(0,1)] === 0) {
                    console.log('Tile ' + village_id + ' - ' + guildName.substr(0,1) + ' is available');
                    tileAvailable = true;
                } else {
                    console.log('Tile ' + village_id + ' - ' + guildName.substr(0,1) + ' is not available');
                }

                sum = 0;
                sumForPlayer = 0;
                sumGuild = 0;

                if(tileAvailable) {
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
                                    sumGuild += amount;
                                    console.log('Trying to place a guild that has already been placed!');
                                }
                            }
                        }
                    }

                    if(sum < 3 && sumForPlayer < 2 && sumGuild == 0) {
                        canPlaceTile = true;
                    }
                }

            } while(!canPlaceTile);

            console.log(stateMachine.current_player + ' places a ' + guildName + ' master on village ' + village_id);
            var data = {
                player: stateMachine.current_player,
                guild_id: guild_id,
                guildName: guildName,
                village_id: village_id
            };
            placeMaster(data);
            socket.emit('placeMaster', data);
        }
    }

});