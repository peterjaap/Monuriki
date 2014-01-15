var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

io.static.add('/js/preloader.js', {file: 'js/preloader.js'});
io.static.add('/js/game.js', {file: 'js/game.js'});
io.static.add('/images/fortress.png', {mime: {
        type: 'image/png',
        encoding: 'utf8',
        gzip: true
    },
    file: 'images/fortress.png'});

app.listen(80);

function handler (req, res) {
    fs.readFile(__dirname + '/test.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading test.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});