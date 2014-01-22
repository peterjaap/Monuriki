function Shangrila() {
    /* Define positions of villages */
    this.villages = [];
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
    this.bridges = [];
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

    this.guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

    /* Define the colors that are used for the various players */
    this.colors = ['blue','red','yellow','violet'];
    this.colors['blue'] = [];
    this.colors['blue']['gamecanvasBackground'] = 'lightblue';
    this.colors['blue']['controldeckBackground'] = '#7ec1d7';

    this.colors['red'] = [];
    this.colors['red']['gamecanvasBackground'] = '#f46d6d';
    this.colors['red']['controldeckBackground'] = '#b80000';

    this.colors['yellow'] = [];
    this.colors['yellow']['gamecanvasBackground'] = '#fffcaa';
    this.colors['yellow']['controldeckBackground'] = '#d8d500';

    this.colors['violet'] = [];
    this.colors['violet']['gamecanvasBackground'] = '#e6aaff';
    this.colors['violet']['controldeckBackground'] = '#58007d';

    this.numberOfMessages = 0;
}

Shangrila.prototype.showMessage = function(messageText, duration) {
    if(typeof duration == 'undefined') duration = 2000;

    this.numberOfMessages += 1;

    height = stage.canvas.height * 0.04;
    var messageGraphic = new createjs.Graphics().beginFill('black').rect(
        stage.canvas.width * 0.25,
        0,
        stage.canvas.width * 0.5,
        height
    );
    var messageShape = new createjs.Shape(messageGraphic);
    messageShape.y = height * -1;
    stage.addChild(messageShape);

    var toPosition = ((this.numberOfMessages-1) * height) + 0;
    var toPositionMessage = ((this.numberOfMessages-1) * height) + 5;

    createjs.Tween.get(messageShape).to({y:toPosition}, 500).wait(duration).to({y:height*-1}, 1000).call(function (event) {stage.removeChild(event.target);});

    var message = new createjs.Text(messageText, '12px Arial','white');
    bounds = message.getBounds();
    message.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    message.y = height * -1;
    createjs.Tween.get(message).to({y:toPositionMessage}, 500).wait(duration).to({y:height*-1}, 1000).call(function (event) {stage.removeChild(event.target); shangrila.numberOfMessages -= 1; });

    stage.addChild(message);

}

/* Starts game engine & shows 'Choose color' screen */
Shangrila.prototype.startGame = function() {
    var title = new createjs.Text('The Bridges of Shangri-la',(stage.canvas.width * 0.06) + 'px Arial','black');
    bounds = title.getBounds();
    title.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    title.y = stage.canvas.height * 0.25;
    stage.addChild(title);

    var subtitle = new createjs.Text('Choose your color',(stage.canvas.width * 0.03) + 'px Arial','black');
    bounds = subtitle.getBounds();
    subtitle.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    subtitle.y = stage.canvas.height * 0.40;
    stage.addChild(subtitle);

    for(i=0;i<this.colors.length;i++) {
        var startButton = new createjs.Graphics().beginFill(this.colors[i]).rect(
            (stage.canvas.width * 0.08) + ((stage.canvas.width * 0.5) - (((stage.canvas.width * 0.06)+(stage.canvas.width * 0.02)) * i)),
            title.y * 2,
            (stage.canvas.width * 0.06),
            (stage.canvas.width * 0.06)
        );
        var startButtonShape = new createjs.Shape(startButton);
        startButtonShape.color = this.colors[i];
        startButtonShape.addEventListener('mouseover', function(event) {
            event.target.alpha = .50;
        });
        startButtonShape.addEventListener('mouseout', function(event) {
            event.target.alpha = 1;

        });
        startButtonShape.addEventListener('click', function(event) {
            shangrila.initNewGame(event.target.color);
        });
        stage.addChild(startButtonShape);
    }
}

/* Initializes new game. Used when player is chosen or when new game needs to be started from beginning */
Shangrila.prototype.initNewGame = function(color) {
    this.setupRound = true;
    this.color = color;

    this.gameboardWidth = stage.canvas.width*0.8;
    this.gameboardHeight = stage.canvas.height;
    this.controldeckWidth = stage.canvas.width*0.2;

    /* Draw background game board */
    var graphicsGamecanvas = new createjs.Graphics().beginFill(this.colors[this.color]['gamecanvasBackground']).rect(0, 0, this.gameboardWidth, stage.canvas.height);
    var backgroundGamecanvas = new createjs.Shape(graphicsGamecanvas);
    stage.addChild(backgroundGamecanvas);

    /* Draw background control deck */
    var graphicsControldeck = new createjs.Graphics().beginFill(this.colors[this.color]['controldeckBackground']).rect(this.gameboardWidth, 0, this.controldeckWidth, stage.canvas.height);
    var backgroundControldeck = new createjs.Shape(graphicsControldeck);
    stage.addChild(backgroundControldeck);

    this.drawBridges();
    this.drawVillages();
    this.drawGuildShields();

    shangrila.showMessage('Welcome player ' + color + '!');
    shangrila.showMessage('Please place one of your guilds in a village (with a maximum of 3 per village).', 5000);
}

/* Draw the villages on the canvas */
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
        village.masterTiles = 0;
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

/* Draw the bridges on the canvas */
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

        bridge.graphics.moveTo(from_x,from_y);
        bridge.graphics.lineTo(to_x,to_y);
        bridge.graphics.endStroke();
        bridge.bridge_id = i;
        bridge.name = 'bridge_' + i;
        bridge.addEventListener('click', function(event) {
            shangrila.removeBridge({bridge_id: event.target.bridge_id});
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

/* Remove bridges from canvas */
Shangrila.prototype.removeBridge = function(data) {
    stage.removeChild(stage.getChildByName('bridge_' + data.bridge_id));
    shangrila.showMessage('Bridge ' + data.bridge_id + ' has now been burnt!');
    shangrila.recalculateStoneOfTheWiseMenPlacings();
}

/* Function needed for diffing arrays */
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

/* See whether a stone of the wise men needs to be placed in a village */
Shangrila.prototype.recalculateStoneOfTheWiseMenPlacings = function() {
    var connected = [];
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
            shangrila.drawStoneOfTheWiseMen(i);
        }
    }
    if(connected.length == 0) {
        alert('Game ends!');
    }
}


/* Draw stone of the wise men */
Shangrila.prototype.drawStoneOfTheWiseMen = function(village_id) {
    if(stage.getChildByName('stone_' + village_id)) {
        shangrila.showMessage('Stone is already placed in village ' + village_id);
        return;
    }

    shangrila.showMessage('Village ' + village_id + ' is not connected anymore; placing stone of the wise men!');

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

/* Draw guild shields on the control deck and on the villages */
Shangrila.prototype.drawGuildShields = function() {
    var noGuildsOnSingleRow = 4;
    var guildWidth = (shangrila.controldeckWidth * 0.6) / noGuildsOnSingleRow;
    var padding = (shangrila.controldeckWidth * 0.05);
    var guildHeight = guildWidth;

    for(i=1;i<=this.guilds.length;i++) {
        if(i > noGuildsOnSingleRow) {
            var y = (shangrila.gameboardHeight * 0.05) + (guildHeight * 1.8);
            j = i-noGuildsOnSingleRow;
        } else {
            var y = (shangrila.gameboardHeight * 0.05);
            j = i;
        }
        var x = shangrila.gameboardWidth + ((guildWidth + padding) * j) - guildWidth / 2;
        var guild = new createjs.Graphics().beginFill('black').rect(
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

        var guildAmount = new createjs.Graphics().beginFill('grey').rect(
            x,
            y+guildHeight,
            guildWidth,
            guildHeight*0.6
        );
        var guildAmountShape = new createjs.Shape(guildAmount);
        stage.addChild(guildAmountShape);

        guildName = this.guilds[i-1];

        /* Draw guilds on the controldeck */
        var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 2) + 'px Arial','#fff');
        initial.x = x+guildWidth*0.30;
        initial.y = y+guildHeight*0.70;
        initial.textBaseline = 'alphabetic';
        initial.name = 'guild_initial_p1_'  + guildName.substr(0,1);

        var amount = new createjs.Text('AMOUNT',(guildWidth / 3) + 'px Arial','#fff');
        amount.x = x+guildWidth*0.4;
        amount.y = y+guildHeight*1.43;
        amount.y = y+guildHeight*1.43;
        amount.amount = 6;
        amount.text = amount.amount;
        amount.textBaseline = 'alphabetic';
        amount.name = 'guild_amount_p1_' + guildName.substr(0,1);

        stage.addChild(initial);
        stage.addChild(amount);

        /* Small guilds for on the villages */
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

            var guildSmall = new createjs.Graphics().beginStroke('black').setStrokeStyle(1).beginFill('lightgrey').rect(
                x,
                y,
                guildWidthSmall,
                guildHeightSmall
            ).endFill();
            var guildShapeSmall = new createjs.Shape(guildSmall);
            guildShapeSmall.setBounds(x,y,guildWidthSmall,guildHeightSmall);
            guildShapeSmall.name = 'guild_shape_small_' + i + '_' + j;
            guildShapeSmall.guildName = guildName;
            guildShapeSmall.guild_id = i;
            guildShapeSmall.village_id = j;
            guildShapeSmall.addEventListener('mouseover', function(event) {
               event.target.graphics.beginFill(shangrila.color).rect(
                   event.target.getBounds().x,
                   event.target.getBounds().y,
                   event.target.getBounds().width,
                   event.target.getBounds().height
               ).endFill();
            });
            guildShapeSmall.addEventListener('mouseout', function(event) {
                event.target.graphics.beginFill('lightgrey').rect(
                    event.target.getBounds().x,
                    event.target.getBounds().y,
                    event.target.getBounds().width,
                    event.target.getBounds().height
                ).endFill();
            });
            guildShapeSmall.addEventListener('click', function(event) {
                shangrila.placeMaster(event);
            });
            stage.addChild(guildShapeSmall);

            var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 3) + 'px Arial','black');
            initial.x = x + 5;
            initial.y = y + 3;
            initial.name = 'guild_small_initial_p1_'  + guildName.substr(0,1);
            stage.addChild(initial);
        }
    }
}

Shangrila.prototype.placeMaster = function(event) {
    var village = stage.getChildByName('village_' + event.target.village_id);
    var amount = stage.getChildByName('guild_amount_p1_' + event.target.guildName.substr(0,1));
    if(shangrila.setupRound && amount.amount == 6) {
        if(village.masterTiles == 3) {
            shangrila.showMessage('Sorry, there are already 3 masters in this village.');
        } else {
            event.target.removeAllEventListeners();
            village.masterTiles += 1;
            shangrila.showMessage('You have placed a ' + event.target.guildName + ' master in village ' + j);
            amount.amount = amount.amount - 1;
            amount.text = amount.amount;
            socket.emit('placeMaster', {'village':event.target.village_id, amount:amount.amount, guild:event.target.guildName, player: 1});
        }
    } else if(shangrila.setupRound && amount.amount < 6) {
        shangrila.showMessage('Sorry, you have already placed a ' + event.target.guildName + ' master in a village. This is not allowed in the first round.');
    } else if(!shangrila.setupRound) {
        // normal game
        console.log('wut');
    }
}