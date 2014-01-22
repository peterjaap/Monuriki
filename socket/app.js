var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

io.static.add('/js/game.js', {file: 'js/game.js'});
io.static.add('/js/shangrila.js', {file: 'js/shangrila.js'});
io.static.add('/images/fortress.png', {mime: {
        type: 'image/png',
        encoding: 'utf8',
        gzip: true
    },
    file: 'images/fortress.png'});

app.listen(80);

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

var guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

var stateMachine = {};
stateMachine['villages'] = {};
stateMachine['round'] = 1;
for(i=1;i<=13;i++) {
    stateMachine['villages']['village_' + i] = {};
    for(j=1;j<=4;j++) {
        stateMachine['villages']['village_' + i]['player_' + j] = {};
        for(k=0;k<guilds.length;k++) {
            stateMachine['villages']['village_' + i]['player_' + j][guilds[k].substr(0,1)] = 0;
        }
    }
}

function calculateEndOfTurn(player) {
    var total = 0;
    for(i=1;i<=13;i++) {
        guilds = stateMachine['villages']['village_' + i]['player_' + player];
        for(guild in guilds) {
            total += guilds[guild];
        }
    }
    io.sockets.emit('showMessage', {message: 'You have placed ' + total + ' of the 6 masters.'});
}

io.sockets.on('connection', function (socket) {
    socket.on('placeMaster', function(data) {
        stateMachine['villages']['village_' + data.village]['player_' + data.player][data.guild.substr(0,1)] += 1;
        //console.log(require('util').inspect(stateMachine, true, 10));
        calculateEndOfTurn(data.player);
    });
});