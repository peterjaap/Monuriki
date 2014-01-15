/**
 * Created by peterjaap on 11/1/2014.
 */

function Game() {
    this.gameboard = $('#gamecanvas');
    this.ctx = this.gameboard.get(0).getContext('2d');

    /* Define positions of villages */
    this.villages = Array();
    this.villages[1] = {top:5,left:13 };
    this.villages[2] = {top:36, left:19 };
    this.villages[3] = {top:64, left:11 };
    this.villages[4] = {top:5, left:48 };
    this.villages[5] = {top:23, left:38 };
    this.villages[6] = {top:49, left:41 };
    this.villages[7] = {top:79, left:33 };
    this.villages[8] = {top:21, left:64 };
    this.villages[9] = {top:38, left:61 };
    this.villages[10] = {top:78, left:63 };
    this.villages[11] = {top:9, left:78 };
    this.villages[12] = {top:40, left:82 };
    this.villages[13] = {top:57, left:75 };
    this.villageWidth = 0.1;
    this.villageHeight = 0.12;
    this.canvasWidth = this.gameboard.width();
    this.canvasHeight = this.gameboard.height();

    /* Define the bridges that connect the villages
    * From and to refers to index key in the this.villages object above
    */
    this.bridges = Array();
    this.bridges[1] = {from:1, to:3};
    this.bridges[2] = {from:3, to:7};
    this.bridges[3] = {from:1, to:2};
    this.bridges[4] = {from:2, to:3};
    this.bridges[5] = {from:1, to:5};
    this.bridges[6] = {from:5, to:2};
    this.bridges[7] = {from:2, to:7};
    this.bridges[8] = {from:1, to:4};
    this.bridges[9] = {from:5, to:8};
    this.bridges[10] = {from:4, to:11};
    this.bridges[11] = {from:8, to:11};
    this.bridges[12] = {from:11, to:12};
    this.bridges[13] = {from:4, to:8};
    this.bridges[14] = {from:5, to:6};
    this.bridges[15] = {from:6, to:7};
    this.bridges[16] = {from:6, to:10};
    this.bridges[17] = {from:6, to:9};
    this.bridges[18] = {from:7, to:10};
    this.bridges[19] = {from:10, to:13};
    this.bridges[20] = {from:9, to:13};
    this.bridges[21] = {from:12, to:13};
    this.bridges[22] = {from:8, to:12};
    this.bridges[23] = {from:8, to:9};

    window.addEventListener('resize', this.resizeCanvas, false);

}

Game.prototype.drawVillages = function() {
    this.ctx.beginPath();

    var image = new Image();
    image.src = 'socket.io/images/fortress.png';

    for(i=1;i<this.villages.length;i++) {
        /* Get and calculate village positions and edges */
        var x = this.canvasWidth * (this.villages[i]['left']/100);
        var y = this.canvasHeight * (this.villages[i]['top']/100);
        var width = this.canvasWidth * this.villageWidth;
        var height = this.canvasHeight * this.villageHeight;

        //console.log('Village ' + i + '; ' + x + ', ' + y + ', ' + width + ', ' + height);
        /* Draw black rectangle to the canvas */
        //this.ctx.rect(x,y,width,height);
        /* Draw image to the canvas */
        this.ctx.drawImage(image,x,y,width,height);
    }
    this.ctxStye = 'black';
    this.ctx.fill();
}

Game.prototype.drawBridges = function() {
    this.ctx.beginPath();

    /* Loop through bridges */
    for(i=1;i<this.bridges.length;i++) {
        var width = this.canvasWidth * this.villageWidth;
        var height = this.canvasHeight * this.villageHeight;

        /* Get x and y positions for source and target villages from villages object */
        from = this.villages[this.bridges[i]['from']];
        to = this.villages[this.bridges[i]['to']];

        var from_x = this.canvasWidth * (from['left']/100) + height/2;
        var from_y = this.canvasHeight * (from['top']/100) + height/2;

        var to_x = this.canvasWidth * (to['left']/100) + height/2;
        var to_y = this.canvasHeight * (to['top']/100) + height/2;

        /* Draw line */
        this.ctx.moveTo(from_x, from_y);
        this.ctx.lineTo(to_x, to_y);
    }
    this.ctx.stroke();
}

Game.prototype.drawStoneOfTheWiseMen = function(village_id) {
    var width = this.canvasWidth * this.villageWidth;
    var height = this.canvasHeight * this.villageHeight;

    var x = this.canvasWidth * (this.villages[village_id]['left']/100) + height/2;
    var y = this.canvasHeight * (this.villages[village_id]['top']/100) + height/2;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fill();
}

/*Games.prototype.drawGuilds = function() {
    var guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];
    for(i=0;i<=guilds.length;i++) {

    }
}*/

Game.prototype.resizeCanvas = function() {
    var canvas = document.getElementById('gamecanvas'),
        context = canvas.getContext('2d');
    canvas.width = window.innerWidth*0.8;
    canvas.height = window.innerHeight;

    this.drawBridges();
    this.drawVillages();
    //this.drawGuilds();
}

$(document).ready(function () {
    var game = new Game();

    /* Preload game assets
     @TODO add a preloader screen when game gets asset-heavy
     */
    var preloader = html5Preloader();
    preloader.addFiles('socket.io/images/fortress.png');
    /* When preloader is finished, draw bridges & villages */
    preloader.on('finish', function(){
        game.resizeCanvas();
    });
});