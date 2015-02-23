/* This file runs client side and is run in the boot process. This controls
   all non-game turn related functions and sets all the socket listeners
 */

var stage = false;
var loader;
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
    socket = io.connect(document.location.hostname + ':' + 8000);

    socket.on('activePlayersUpdate', function(data) {
        shangrila.activePlayers = data;
        if(shangrila.inLobby) {
            shangrila.lobby();
        } else if(shangrila.inSplash) {
            shangrila.splashScreen();
        }
    });

    /* Add ticker to update canvas when necessary */
    createjs.Ticker.addEventListener("tick", tick);

    /* Load assets & run initGame function when assets are loaded*/
    /* Todo; add loading screen */

    loader = new createjs.LoadQueue(false);
    //loader.installPlugin(createjs.Sound); // for sound
    loader.loadManifest(
        [
            {id:'village',src:'images/fortress.png'},
            {id:'loader', src:'images/loader.gif'},
            {id:'mic_red', src:'images/mic_red.png'},
            {id:'mic_green', src:'images/mic_green.png'},
            {id:'sound_on', src:'images/sound_on.png'},
            {id:'sound_off', src:'images/sound_off.png'}
        ]
    );

    /* Initialise stage, socket, preloader, etc */
    initGame();

    /* When loader is finished, show splash screen */
     loader.on('complete', function () { socket.emit('__showSplashScreen'); });
});

/* Initialize stage, set canvas width & height, retrieve game data and insert them into the game object */
function initGame() {
    stage = new createjs.Stage('gamecanvas');
    createjs.Touch.enable(stage);
    stage.enableMouseOver(20);

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    /* Set preloading text */
    var title = new createjs.Text('Loading..',(stage.canvas.width * 0.06) + 'px Arial','black');
    bounds = title.getBounds();
    title.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    title.y = stage.canvas.height * 0.25;
    stage.addChild(title);

    // Set initial game data in session object
    socket.on('_setInitialGameData', function(data) {
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
        shangrila.neighbours = staticGameData.neighbours;
        shangrila.colorNames = staticGameData.colorNames;
        shangrila.colors = staticGameData.colors;
        shangrila.numberOfActiveMessages = staticGameData.numberOfActiveMessages;
        shangrila.messageHistory = staticGameData.messageHistory;
        shangrila.autoSetupRound = staticGameData.autoSetupRound;
        shangrila.presetStartingPositions = staticGameData.presetStartingPositions;

        // Fill state machine data
        stateMachine = data.stateMachine;
        shangrila.activePlayers = stateMachine.activePlayers;
        shangrila.playerOrder = stateMachine.playerOrder;
    });

    socket.on('_updateGameData', function(data) {
        if(typeof data.bridges != 'undefined') {
            shangrila.bridges = data.bridges;
        }
        if(typeof data.villages != 'undefined') {
            shangrila.villages = data.villages;
        }
    });

    // Client functions
    socket.on('_removeBridge', function (data) {
        shangrila.removeBridge(data);
    });

    socket.on('_placeMaster', function (data) {
        shangrila.placeMaster(data);
    });

    socket.on('_updateGuildShield', function (data) {
        shangrila.updateGuildShield(data);
    });

    socket.on('_showSplashScreen', function() {
        shangrila.splashScreen();
    });

    socket.on('_initNewGame', function (){
        shangrila.initNewGame();
    });

    socket.on('_updateStateMachineValue', function(data) {
        for(var index in data) {
            shangrila[index] = data[index];
            console.log('State machine in var shangrila.' + index + ' is set to ' + data[index]);
            if(index == 'currentPlayer') {
                shangrila.updateCurrentPlayer();
            }
            if(index == 'villages' || index == 'neighbours') {
                stateMachine[index] = data[index];
            }
        }
    });

    socket.on('_showMessage', function (data) {
        shangrila.showMessage(data);
    });

    socket.on('message', function(data) {
       shangrila.showMessage(data);
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
//window.onbeforeunload = confirmOnPageExit;