/**
 * Created by peterjaap on 11/1/2014.
 */

var stage;
var queue;
var shangrila;

var identify = true;

var keepAspectRatio = true;
var initialWidth;
var initialHeight;

window.addEventListener('resize', onResize, false);

$(document).ready(function () {
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;

    createjs.Ticker.addEventListener("tick", tick);

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener('complete', initGame);
    queue.loadManifest([{id:'village',src:'images/fortress.png'}]);
});

function initGame() {
    stage = new createjs.Stage('gamecanvas');
    createjs.Touch.enable(stage);
    stage.enableMouseOver(20);

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    shangrila = new Shangrila();
    shangrila.initNewGame();
}

function tick() {
    stage.update();
}

function Shangrila() {
    /* Define positions of villages */
    this.villages = Array();
    this.villages[1] = {top:5,left:8 };
    this.villages[2] = {top:36, left:14 };
    this.villages[3] = {top:64, left:6 };
    this.villages[4] = {top:5, left:43 };
    this.villages[5] = {top:23, left:33 };
    this.villages[6] = {top:49, left:36 };
    this.villages[7] = {top:79, left:28 };
    this.villages[8] = {top:21, left:59 };
    this.villages[9] = {top:38, left:56 };
    this.villages[10] = {top:78, left:74 };
    this.villages[11] = {top:9, left:73 };
    this.villages[12] = {top:40, left:77 };
    this.villages[13] = {top:57, left:70 };
    this.villageWidth = 0.12;
    this.villageHeight = 0.12;

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
}

Shangrila.prototype.initNewGame = function() {
    this.gameboardWidth = stage.canvas.width*0.8;
    this.gameboardHeight = stage.canvas.height;
    this.controldeckWidth = stage.canvas.width*0.2;
    this.controldeckHeight = stage.canvas.height;

    /* Draw background game board */
    var graphicsGamecanvas = new createjs.Graphics().beginFill('lightblue').drawRect(0, 0, this.gameboardWidth, stage.canvas.height);
    var backgroundGamecanvas = new createjs.Shape(graphicsGamecanvas);
    stage.addChild(backgroundGamecanvas);

    /* Draw background control deck */
    var graphicsControldeck = new createjs.Graphics().beginFill('#7ec1d7').drawRect(this.gameboardWidth, 0, this.controldeckWidth, stage.canvas.height);
    var backgroundControldeck = new createjs.Shape(graphicsControldeck);
    stage.addChild(backgroundControldeck);

    this.drawBridges();
    this.drawVillages();
    this.drawGuildShields();
}

Shangrila.prototype.drawVillages = function() {
    /* Loop through villages */
    for(i=1;i<this.villages.length;i++) {
        /* Get and calculate village positions and edges */
        var x = shangrila.gameboardWidth * (this.villages[i]['left']/100);
        var y = stage.canvas.clientHeight * (this.villages[i]['top']/100);
        var width = shangrila.gameboardWidth * this.villageWidth;
        var height = stage.canvas.clientHeight * this.villageHeight;

        /* Add image to stage */
        var village = new createjs.Bitmap(queue.getResult('village'));
        village.x = x;
        village.y = y;
        bounds = village.getBounds();
        village.scaleX = width / bounds.width;
        village.scaleY = height / bounds.height;
        village.village_id = i;
        village.name = 'village_' + i;
        stage.addChild(village);

        if(identify) {
            var text = new createjs.Text(i,'20px Arial','#ff0000');
            text.x = x+width/2;
            text.y = y+height/2;
            text.textBaseline = 'alphabetic';
            stage.addChild(text);
        }
    }
}

Shangrila.prototype.drawBridges = function() {
    /* Loop through bridges */
    for(i=1;i<this.bridges.length;i++) {
        var width = shangrila.gameboardWidth * this.villageWidth;
        var height = stage.canvas.clientHeight * this.villageHeight;

        /* Get x and y positions for source and target villages from villages object */
        from = this.villages[this.bridges[i]['from']];
        to = this.villages[this.bridges[i]['to']];

        var from_x = shangrila.gameboardWidth * (from['left']/100) + width/2;
        var from_y = stage.canvas.clientHeight * (from['top']/100) + height/2;

        var to_x = shangrila.gameboardWidth * (to['left']/100) + width/2;
        var to_y = stage.canvas.clientHeight * (to['top']/100) + height/2;

        /* Draw line */
        var bridge = new createjs.Shape();
        bridge.graphics.setStrokeStyle(5);
        bridge.graphics.beginStroke('#000');

        //console.log('Drawing a line from ' + from_x + 'x' + from_y + ' to ' + to_x + 'x' + to_y);
        bridge.graphics.moveTo(from_x,from_y);
        bridge.graphics.lineTo(to_x,to_y);
        bridge.graphics.endStroke();
        bridge.bridge_id = i;
        bridge.name = 'bridge_' + i;
        bridge.addEventListener('click', function(event) {
            stage.removeChild(event.target);
            shangrila.recalculateStoneOfTheWiseMenPlacings();
        });
        stage.addChild(bridge);

        if(identify) {
            var text = new createjs.Text(i,'20px Arial','#0000ff');
            text.x = from_x+((to_x-from_x)/2);
            text.y = from_y+((to_y-from_y)/2);
            text.textBaseline = 'alphabetic';
            stage.addChild(text);
        }
    }
}

Shangrila.prototype.drawStoneOfTheWiseMen = function(village_id) {
    if(stage.getChildByName('stone_' + village_id)) {
        console.log('Stone is already placed on village ' + village_id);
        return;
    }

    var width = shangrila.gameboardWidth * this.villageWidth;
    var height = stage.canvas.clientHeight * this.villageHeight;

    var x = shangrila.gameboardWidth * (this.villages[village_id]['left']/100) + width/2;
    var y = stage.canvas.clientHeight * (this.villages[village_id]['top']/100) + height/2;

    var stone = new createjs.Shape();
    stone.graphics.beginFill('lightblue').drawCircle(0,0,shangrila.gameboardWidth/90);
    stone.x = x;
    stone.y = y;
    stone.name = 'stone_' + village_id;
    stage.addChild(stone);
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

Shangrila.prototype.recalculateStoneOfTheWiseMenPlacings = function() {
    var connected = new Array();
    for(i=1;i<this.bridges.length;i++) {
        var bridgeObject = stage.getChildByName('bridge_' + i);
        if(bridgeObject) {
            if(this.bridges[bridgeObject.bridge_id]) {
                var from = this.bridges[bridgeObject.bridge_id].from;
                var to = this.bridges[bridgeObject.bridge_id].to;
                if(connected.indexOf(from) == -1) {
                    connected.push(from);
                }
                if(connected.indexOf(to) == -1) {
                    connected.push(to);
                }
            }
        }
    }
    for(i=1;i<this.villages.length;i++) {
        if(connected.indexOf(i) == -1 && stage.getChildByName('stone_' + i) == null) {
            console.log('Village ' + i + ' is not connected anymore; place stone of the wise men!');
            shangrila.drawStoneOfTheWiseMen(i);
        }
    }
    if(connected.length == 0) {
        alert('Game ends!');
    }
}

Shangrila.prototype.drawGuildShields = function() {
    var guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];
    var noGuildsOnSingleRow = 4;
    var guildWidth = (shangrila.controldeckWidth * 0.6) / noGuildsOnSingleRow;
    var padding = (shangrila.controldeckWidth * 0.05);
    var guildHeight = guildWidth;

    for(i=1;i<=guilds.length;i++) {
        if(i > noGuildsOnSingleRow) {
            var y = (shangrila.gameboardHeight * 0.05) + (guildHeight * 1.8);
            j = i-noGuildsOnSingleRow;
        } else {
            var y = (shangrila.gameboardHeight * 0.05);
            j = i;
        }
        var x = shangrila.gameboardWidth + ((guildWidth + padding) * j) - guildWidth / 2;
        var guild = new createjs.Graphics().beginFill('black').drawRect(
            x,
            y,
            guildWidth,
            guildHeight
        );
        var guildShape = new createjs.Shape(guild);
        guildShape.addEventListener('mouseover', function(event) {
            event.target.alpha = .50;
        });
        guildShape.addEventListener('mouseout', function(event) {
            event.target.alpha = 1;
        });
        stage.addChild(guildShape);

        var guildAmount = new createjs.Graphics().beginFill('grey').drawRect(
            x,
            y+guildHeight,
            guildWidth,
            guildHeight*0.6
        );
        var guildAmountShape = new createjs.Shape(guildAmount);
        stage.addChild(guildAmountShape);

        var guildName = guilds[i-1];

        var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 2) + 'px Arial','#fff');
        initial.x = x+guildWidth*0.30;
        initial.y = y+guildHeight*0.70;
        initial.textBaseline = 'alphabetic';
        initial.name = 'guild_initial_p1_'  + guildName.substr(0,1);

        var amount = new createjs.Text('6',(guildWidth / 3) + 'px Arial','#fff');
        amount.x = x+guildWidth*0.4;
        amount.y = y+guildHeight*1.43;
        amount.y = y+guildHeight*1.43;
        amount.textBaseline = 'alphabetic';
        amount.name = 'guild_amount_p1_' + guildName.substr(0,1);

        var guildShield = new createjs.Container();
        guildShield.addChild(initial);
        guildShield.addChild(amount);
        stage.addChild(guildShield);

        /* Small guilds */
        guildWidthSmall = guildWidth * 0.5;
        guildHeightSmall = guildHeight * 0.5;
        paddingSmall = padding * 0.1;
        for(j=1;j<this.villages.length;j++) {
            villageObject = stage.getChildByName('village_' + j);
            y = villageObject.y;
            x = villageObject.x;

            /* Position small shields in grid of 2, 3, 2 over the villages */
            y += 10;
            x += 5;
            if(i <= 2) {

            } else if(i > 2 && i <= 5) {
                y += 25;
                x -= 72;
            } else if(i > 5) {
                y += 50;
                x -= 140;
            }

            x += (i * (guildWidthSmall + 10));

            console.log('guild x; ' + x);
            console.log('guild y; ' + y);

            var guildSmall = new createjs.Graphics().beginStroke('black').setStrokeStyle(1).beginFill('lightgrey').drawRect(
                x,
                y,
                guildWidthSmall,
                guildHeightSmall
            );
            var guildShapeSmall = new createjs.Shape(guildSmall);
            stage.addChild(guildShapeSmall);

            var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 3) + 'px Arial','black');
            initial.x = x + 5;
            initial.y = y + 3;
            initial.name = 'guild_small_initial_p1_'  + guildName.substr(0,1);
            stage.addChild(initial);
        }
    }
}

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