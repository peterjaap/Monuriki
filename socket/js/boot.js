var stage = false;
var queue;
var shangrila;

var identify = false;

var keepAspectRatio = true;
var initialWidth;
var initialHeight;

/* Set listener on window to resize canvas when needed */
window.addEventListener('resize', onResize, false);

document.addEventListener('DOMContentLoaded', function(){
    /* Set vars for width & height to allow resizing */
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;

    /* Create socket */
    socket = io.connect('http://localhost');

    // Client functions
    socket.on('removeBridge', function (data) {
        shangrila.removeBridge(data);
    });

    socket.on('showMessage', function (data) {
        shangrila.showMessage(data.message);
    });

    socket.on('placeMaster', function (data) {
        shangrila.placeMaster(data);
    });

    socket.on('passTurn', function(data) {
        shangrila.current_player = data.current_player;
        if(data.humanTurn) {
            if(stage.getChildByName('loadingScreen')) {
                stage.removeChild(stage.getChildByName('loadingScreen'));
            }
            shangrila.showMessage('It is your turn!');
        } else {
            if(!stage.getChildByName('loadingScreen')) {
                var waitingScreen = new createjs.Graphics().beginFill('black').rect(0, 0, stage.canvas.width, stage.canvas.height);
                var waitingScreenShape = new createjs.Shape(waitingScreen);
                waitingScreenShape.alpha = 0.3;
                waitingScreenShape.name = 'loadingScreen';
                stage.addChild(waitingScreenShape);
            }
            /*var loaderImage = new createjs.Bitmap(queue.getResult('loader'));
             loaderImage.x = stage.canvas.width / 2;
             loaderImage.y = stage.canvas.height / 2;
             var container = new createjs.Container();
             container.addChild(waitingScreenShape,loaderImage);
             container.name = 'loadingScreen';
             stage.addChild(container);*/

            shangrila.showMessage('It is ' + data.current_player + '\'s turn!');
        }
    });

    /* Add ticker to update canvas when necessary */
    createjs.Ticker.addEventListener("tick", tick);

    /* Load assets & run initGame function when assets are loaded*/
    /* Todo; add loading screen */

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener('complete', initGame);
    queue.loadManifest([{id:'village',src:'socket.io/images/fortress.png'},{id:'loader', src:'socket.io/images/loader.gif'}]);
});

function initGame() {
    /* Initialize stage, set canvas width & height, retrieve game data and insert them into the game object */
    stage = new createjs.Stage('gamecanvas');
    createjs.Touch.enable(stage);
    stage.enableMouseOver(20);

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    socket.on('gameData', function(data) {
        gameData = data.gameData;
        shangrila = new Shangrila();
        shangrila.guilds = gameData.guilds;
        shangrila.villages = gameData.villages;
        shangrila.villageWidth = gameData.villageWidth;
        shangrila.villageHeight = gameData.villageHeight;
        shangrila.bridges = gameData.bridges;
        shangrila.colorNames = gameData.colorNames;
        shangrila.colors = gameData.colors;
        shangrila.playerOrder = gameData.playerOrder;
        shangrila.numberOfActiveMessages = gameData.numberOfActiveMessages;
        shangrila.messageHistory = gameData.messageHistory;
        shangrila.splashScreen();
    });

}

function tick() {
    if(stage) {
        stage.update();
    }
}