/* This file runs client side and is run in the boot process. This controls
   all non-game turn related functions and sets all the socket listeners
 */

var stage = false;
var queue;
var shangrila;

var identify = true;
var keepAspectRatio = true;
var initialWidth;
var initialHeight;

/* Set listener on window to resize canvas when needed */
window.addEventListener('resize', onResize, false);

/* Set all listener functions for game */
document.addEventListener('DOMContentLoaded', function(){
    /* Set vars for width & height to allow resizing */
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;

    /* Create socket */
    socket = io.connect(document.location.origin);

    // Client functions
    socket.on('removeBridge', function (data) {
        shangrila.removeBridge(data);
    });

    socket.on('showMessage', function (data) {
        shangrila.showMessage(data.message);
    });

    socket.on('message', function(message) {
        shangrila.showMessage(message);
    });

    socket.on('placeMaster', function (data) {
        shangrila.placeMaster(data);
    });

    socket.on('activePlayersUpdate', function(data) {
        shangrila.activePlayers = data;
        if(shangrila.inLobby) {
            shangrila.lobby();
        } else if(shangrila.inSplash) {
            shangrila.splashScreen();
        }
    });

    socket.on('passTurn', function(data) {
        shangrila.currentPlayer = data.currentPlayer;
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

            shangrila.showMessage('It is ' + data.currentPlayer + '\'s turn!');
        }
    });

    /* Add ticker to update canvas when necessary */
    createjs.Ticker.addEventListener("tick", tick);

    /* Load assets & run initGame function when assets are loaded*/
    /* Todo; add loading screen */

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    //queue.addEventListener('complete', initGame);
    queue.loadManifest([{id:'village',src:'images/fortress.png'},{id:'loader', src:'images/loader.gif'}]);
    initGame();
});

/* Initialize stage, set canvas width & height, retrieve game data and insert them into the game object */
function initGame() {
    stage = new createjs.Stage('gamecanvas');
    createjs.Touch.enable(stage);
    stage.enableMouseOver(20);

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    // Set initial game data in session object
    socket.on('setInitialGameData', function(data) {
        // Fill static game data
        staticGameData = data.staticGameData;
        shangrila = new Shangrila();
        shangrila.inLobby = false;
        shangrila.inSplash = true;
        shangrila.guilds = staticGameData.guilds;
        shangrila.villages = staticGameData.villages;
        shangrila.villageWidth = staticGameData.villageWidth;
        shangrila.villageHeight = staticGameData.villageHeight;
        shangrila.bridges = staticGameData.bridges;
        shangrila.colorNames = staticGameData.colorNames;
        shangrila.colors = staticGameData.colors;
        shangrila.numberOfActiveMessages = staticGameData.numberOfActiveMessages;
        shangrila.messageHistory = staticGameData.messageHistory;

        // Fill state machine data
        stateMachine = data.stateMachine;
        shangrila.activePlayers = stateMachine.activePlayers;
        shangrila.playerOrder = stateMachine.playerOrder;
    });

    socket.on('showSplashScreen', function(show) {
        // Show splash screen to start the game
        shangrila.splashScreen();
    });

    socket.on('initNewGame', function (){
        shangrila.initNewGame();
    });

    socket.on('updateStateMachineValue', function(data) {
        for(var index in data) {
            shangrila[index] = data[index];
            console.log('State machine in var shangrila.' + index + ' is set to ' + data[index]);
            if(index == 'currentPlayer') {
                shangrila.updateCurrentPlayer();
            }
        }
    });
}

/* General tick function to update canvas */
function tick() {
    if(stage) {
        stage.update();
    }
}

/* Set confirmation on page exit */
var confirmOnPageExit = function (e)  {
    e = e || window.event;
    var message = 'By refreshing or closing this screen you will stop the game!';
    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }

    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
};
window.onbeforeunload = confirmOnPageExit;