/**
 * Created by peterjaap on 11/1/2014.
 * Todo; set colors for players;
 *  - Red (Ro-Tarya)
 *  - Blue (Ba-Lao)
 *  - Yellow (Gyl-Den)
 *  - Violet (Li-Lamas)
 *
 *
 */

var stage = false;
var queue;
var shangrila;

var identify = false;

var keepAspectRatio = true;
var initialWidth;
var initialHeight;

/* Set listener on window to resize canvas when needed */
window.addEventListener('resize', onResize, false);

$(document).ready(function () {
    /* Set vars for width & height to allow resizing */
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;

    /* Socket & socket event functions */
    /* Todo; define functions for game engine */
    socket = io.connect('http://localhost');

    /*
     [x] removeBridge
     [x] drawStoneOfTheWiseMen
     [x] placeMaster(player, village, guild)
     [ ] recruitStudents(player)
     [ ] recruitStudent(player, village, guild)
     [ ] travel(from_village, to_village)
     [ ] assignTurn(player)
     [ ] countPoints()
     */

    socket.on('removeBridge', function (data) {
        shangrila.removeBridge(data);
    });

    socket.on('showMessage', function (data) {
        shangrila.showMessage(data.message);
    });

    /* Add ticker to update canvas when necessary */
    createjs.Ticker.addEventListener("tick", tick);

    /* Load assets & run initGame function when assets are loaded*/
    /* Todo; add loading screen */

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener('complete', initGame);
    queue.loadManifest([{id:'village',src:'socket.io/images/fortress.png'}]);
});

function initGame() {
    stage = new createjs.Stage('gamecanvas');
    createjs.Touch.enable(stage);
    stage.enableMouseOver(20);

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    shangrila = new Shangrila();
    shangrila.startGame();
}

function tick() {
    if(stage) {
        stage.update();
    }
}

/* This function is run when the screen is resized */
function onResize() {
    // browser viewport size
    var w = window.innerWidth;
    var h = window.innerHeight;

    // stage dimensions
    var ow = initialWidth;
    var oh = initialHeight;

    if (keepAspectRatio)
    {
        // keep aspect ratio
        var scale = Math.min(w / ow, h / oh);
        stage.scaleX = scale;
        stage.scaleY = scale;

        // adjust canvas size
        stage.canvas.width = ow * scale;
        stage.canvas.height = oh * scale;
    }
    else
    {
        // scale to exact fit
        stage.scaleX = w / ow;
        stage.scaleY = h / oh;

        // adjust canvas size
        stage.canvas.width = ow * stage.scaleX;
        stage.canvas.height = oh * stage.scaleY;
    }

    // update the stage
    stage.update()
}
