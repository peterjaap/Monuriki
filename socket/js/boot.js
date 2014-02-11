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
            stage.enableMouseOver(20);

             if(data.current_round == shangrila.guilds.length) { // we need as much rounds as there are guilds in setup phase
                 shangrila.setupRound = false;

                 shangrila.drawMenu();

                 shangrila.showMessage('You can now perform 1 of 3 actions; place a master, recruit students or travel.', 6000);

                 /*
                 @TODO set new onclick actions on the small guilds

                 When clicked on the guild, a popup should appear with three options;
                 - place a master on this guild
                    - if it is available
                 - recruit a student for this guild
                     - if there already is a master
                     - if less than 2 students have been placed in this round)
                 - begin the journey of the students
                     - choose which city to travel to
                     - AND BATTLE!!
                 */

            } else if(data.current_round < 7) {
                shangrila.showMessage('It is your turn!');
            } else if(data.current_round > 7) {
                shangrila.showMessage('It is your turn!');
            }
        } else {
            if(!stage.getChildByName('loadingScreen')) {
                var waitingScreen = new createjs.Graphics().beginFill('black').rect(0, 0, stage.canvas.width, stage.canvas.height);
                var waitingScreenShape = new createjs.Shape(waitingScreen);
                waitingScreenShape.alpha = 0.3;
                waitingScreenShape.name = 'loadingScreen';
                stage.addChild(waitingScreenShape);
            }
            stage.enableMouseOver(0);

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