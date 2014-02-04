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


/* Configure game data object */
var gameData = {};

/* Define the guilds */
gameData.guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

/* Define positions of villages */
gameData.villages = [];
gameData.villages[1] = {top:5,left:8 };
gameData.villages[2] = {top:36, left:14 };
gameData.villages[3] = {top:64, left:6 };
gameData.villages[4] = {top:5, left:43 };
gameData.villages[5] = {top:23, left:33 };
gameData.villages[6] = {top:49, left:36 };
gameData.villages[7] = {top:79, left:28 };
gameData.villages[8] = {top:21, left:59 };
gameData.villages[9] = {top:38, left:56 };
gameData.villages[10] = {top:78, left:74 };
gameData.villages[11] = {top:9, left:73 };
gameData.villages[12] = {top:40, left:77 };
gameData.villages[13] = {top:57, left:70 };
gameData.villageWidth = 0.12;
gameData.villageHeight = 0.12;

/* Define the bridges that connect the villages
 * From and to refers to index key in the gameData.villages object above
 */
gameData.bridges = [];
gameData.bridges[1] = {from:1, to:3};
gameData.bridges[2] = {from:3, to:7};
gameData.bridges[3] = {from:1, to:2};
gameData.bridges[4] = {from:2, to:3};
gameData.bridges[5] = {from:1, to:5};
gameData.bridges[6] = {from:5, to:2};
gameData.bridges[7] = {from:2, to:7};
gameData.bridges[8] = {from:1, to:4};
gameData.bridges[9] = {from:5, to:8};
gameData.bridges[10] = {from:4, to:11};
gameData.bridges[11] = {from:8, to:11};
gameData.bridges[12] = {from:11, to:12};
gameData.bridges[13] = {from:4, to:8};
gameData.bridges[14] = {from:5, to:6};
gameData.bridges[15] = {from:6, to:7};
gameData.bridges[16] = {from:6, to:10};
gameData.bridges[17] = {from:6, to:9};
gameData.bridges[18] = {from:7, to:10};
gameData.bridges[19] = {from:10, to:13};
gameData.bridges[20] = {from:9, to:13};
gameData.bridges[21] = {from:12, to:13};
gameData.bridges[22] = {from:8, to:12};
gameData.bridges[23] = {from:8, to:9};

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

gameData.playerOrder = ['blue','red','yellow','violet'];

gameData.messageHistory = new Array();

/* Configure initial statemachine */
var stateMachine = {};
stateMachine['villages'] = {}; // empty array to hold villages information
stateMachine['current_round'] = null; // keep track of which round we are in
stateMachine['current_player'] = null; // keep track of which player is currently playing
stateMachine['human_player'] = null;
for(i=1;i<=13;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=0;j<4;j++) {
        stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]] = {};
        for(k=0;k<gameData.guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + gameData.playerOrder[j]][gameData.guilds[k].substr(0,1)] = 0;
        }
    }
}

// Listen for events
io.sockets.on('connection', function (socket) {
    socket.emit('gameData', {
        gameData: gameData
    });
    socket.on('chooseColor', function(data) {
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
        stateMachine['villages']['village_' + data.village]['player_' + data.player][data.guild.substr(0,1)] += 1;
        // Log state machine content
        // console.log(require('util').inspect(stateMachine, true, 10));
        // Calculate end of turn
        var total = 0;
        for(i=1;i<=13;i++) {
            guildsPlayer = stateMachine['villages']['village_' + i]['player_' + data.player];
            for(guild in guildsPlayer) {
                total += guildsPlayer[guild];
            }
        }
        if(data.player == stateMachine.human_player) {
            socket.emit('showMessage', {message: 'You have placed ' + total + ' of the 6 masters.'});
        }
        if(total == 6) {

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
        socket.emit('passTurn', {current_player: stateMachine['current_player'], humanTurn: humanTurn});

        // If the current player is not the human player, do some AI stuff
        if(!humanTurn) {
            setTimeout(function() {
                doAITurn();
            }, 4000); // wait a few seconds for the AI to make its move to simulate a human player
        }
    }

    function doAITurn() {
        village_id = Math.floor(Math.random(0,1)*gameData.villages.length-1)+1;
        if(village_id == 0) village_id += 1;
        guildName = 'Dragonbreather';
        guild_id = gameData.guilds.indexOf(guildName)+1;
        console.log(stateMachine.current_player + ' places a ' + guildName + ' master on village ' + village_id);
        socket.emit('placeMaster', {
            player: stateMachine.current_player,
            guild_id: guild_id,
            guildName: guildName,
            village_id: village_id
        });
    }

});