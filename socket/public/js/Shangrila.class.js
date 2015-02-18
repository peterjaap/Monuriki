/* This file is included in the client side and contains all the functions needed to interact with
   the client and to redraw various part of the game board according to the state machine
 */

/* General container function */
function Shangrila() {
    /* Remove previous children from the stage when creating new object */
    stage.removeAllChildren();
    stage.update();
}

/* Set up speech recognition */
Shangrila.prototype.setupSpeechRecognition = function() {
    if (annyang) {
        // Let's define our first command. First the text we expect, and then the function it should call
        var commands = {
            'i want to play with :color': function(color) {
                if(color == 'blue' || color == 'red' || color == 'pink' || color == 'yellow') {
                    shangrila.local_player = color;
                    shangrila.inSplash = false;
                    shangrila.inLobby = true;
                    socket.emit('choseColor', {local_player: shangrila.local_player});
                    shangrila.showMessage('Welcome to the lobby, player ' + shangrila.local_player);
                } else {
                    shangrila.showMessage('The color ' + color + ' does not exist');
                }
            },
            'please start the game': function () {
                socket.emit('__initNewGame');
            }
        };

        // Add our commands to annyang
        annyang.addCommands(commands);

        annyang.addCallback('start', function () {
            mic_status = stage.getChildByName('mic_status');
            lobbyContainer = stage.getChildByName('lobbyContainer');
            if(mic_status) {
                var mic = new createjs.Bitmap(loader.getResult('mic_green'));
                mic.name = mic_status.name;
                mic.scaleX = mic_status.scaleX;
                mic.scaleY = mic_status.scaleY;
                mic.width = mic_status.width;
                mic.height = mic_status.height;
                mic.x = mic_status.x;
                mic.y = mic_status.y;
                stage.addChild(mic);
                stage.removeChild(mic_status);
            }
        });

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();
    }
};

/* Starts game engine & shows 'Choose color' screen */
Shangrila.prototype.splashScreen = function() {
    shangrila.inLobby = false;
    shangrila.inSpash = true;
    if(splashContainer = stage.getChildByName('splashContainer')) {
        stage.removeChild(splashContainer); // remove splash page from stage
    }

    var splashContainer = new createjs.Container();

    var title = new createjs.Text('The Bridges of Shangrila',(stage.canvas.width * 0.06) + 'px Arial','black');
    bounds = title.getBounds();
    title.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    title.y = stage.canvas.height * 0.25;
    splashContainer.addChild(title);

    var chosenColors = [];
    for(var playerClientId in shangrila.activePlayers) {
        chosenColors.push(shangrila.activePlayers[playerClientId]);
    }

    if(chosenColors.length == shangrila.colorNames.length) {
        /* Show game is full notice */
        var fullNotice = new createjs.Text('All colors have been chosen; game is full.',(stage.canvas.width * 0.03) + 'px Arial','black');
        bounds = fullNotice.getBounds();
        fullNotice.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
        fullNotice.y = stage.canvas.height * 0.40;
        splashContainer.addChild(fullNotice);
    } else {
        /* Show choose color notice */
        var subtitle = new createjs.Text('Choose your color',(stage.canvas.width * 0.03) + 'px Arial','black');
        bounds = subtitle.getBounds();
        subtitle.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
        subtitle.y = stage.canvas.height * 0.40;
        splashContainer.addChild(subtitle);

        /* Walk through the colors to display their button */
        for (i = 0; i < shangrila.colorNames.length; i++) {
            var colorName = shangrila.colorNames[i];
            // Skip chosen colors so they can not be selected
            if (chosenColors.indexOf(colorName) > -1) continue;

            // Create button
            var startButton = new createjs.Graphics().beginFill(colorName).rect(
                (stage.canvas.width * 0.08) + ((stage.canvas.width * 0.5) - (((stage.canvas.width * 0.06) + (stage.canvas.width * 0.02)) * i)),
                title.y * 2,
                (stage.canvas.width * 0.06),
                (stage.canvas.width * 0.06)
            );
            // Create shape for button
            var startButtonShape = new createjs.Shape(startButton);
            // Set color and add mouse over effects
            startButtonShape.color = colorName;
            startButtonShape.addEventListener('mouseover', function (event) {
                event.target.alpha = .50;
            });
            startButtonShape.addEventListener('mouseout', function (event) {
                event.target.alpha = 1;

            });
            // Set action to perform when clicked
            startButtonShape.addEventListener('click', function (event) {
                shangrila.local_player = event.target.color;
                shangrila.inSplash = false;
                shangrila.inLobby = true;
                socket.emit('__choseColor', {local_player: shangrila.local_player});
                shangrila.showMessage('Welcome to the lobby, player ' + shangrila.local_player);
            });
            // Add button to the stage
            splashContainer.addChild(startButtonShape);
        }
    }

    splashContainer.name = 'splashContainer';

    /* Add mic image to stage */
    var mic = new createjs.Bitmap('images/mic_red.png');
    bounds = mic.getBounds();
    mic.scaleX = 1;
    mic.name = 'mic_status';
    mic.scaleY = 1;
    mic.width = 48;
    mic.height = 48;
    mic.x = stage.canvas.width - mic.width*1.2;
    mic.y = stage.canvas.height * 0;
    mic.addEventListener('click', function(event) {
        shangrila.setupSpeechRecognition();
    });
    stage.addChild(mic);

    stage.addChild(splashContainer);
};

/* This draws up the lobby and shows which player are waiting, who is the game initiator, etc */
Shangrila.prototype.lobby = function() {
    shangrila.inLobby = true;
    shangrila.inSplash = false;
    if(splashContainer = stage.getChildByName('splashContainer')) {
        stage.removeChild(splashContainer); // remove splash page from stage
    }
    if(lobbyContainer = stage.getChildByName('lobbyContainer')) {
        stage.removeChild(lobbyContainer); // remove splash page from stage
    }
    if(micStatus = stage.getChildByName('mic_status')) {
        stage.removeChild(micStatus);
    }

    var lobbyContainer = new createjs.Container();

    var title = new createjs.Text('The Bridges of Shangrila Lobby',(stage.canvas.width * 0.03) + 'px Arial','black');
    bounds = title.getBounds();
    title.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
    title.y = stage.canvas.height * 0.25;
    lobbyContainer.addChild(title);

    var numberOfPlayers = 0;
    // Walk through the players to show who's in the game
    for(var playerClientId in shangrila.activePlayers) {
        var playerColor = shangrila.activePlayers[playerClientId];
        // Create button
        playerSquareX = (stage.canvas.width * 0.08) + ((stage.canvas.width * 0.5) - (((stage.canvas.width * 0.06)+(stage.canvas.width * 0.02)) * numberOfPlayers));
        playerSquareY = title.y * 2;
        playerSquareWidth = (stage.canvas.width * 0.06);
        playerSquareHeight = (stage.canvas.width * 0.06);
        var playerSquare = new createjs.Graphics().beginFill(playerColor).rect(
            playerSquareX,
            playerSquareY,
            playerSquareWidth,
            playerSquareHeight
        );
        // Create shape for button
        var playerSquareShape = new createjs.Shape(playerSquare);
        // Set bounds
        playerSquareShape.setBounds(playerSquareX,playerSquareY,playerSquareWidth,playerSquareHeight);
        // Set color
        playerSquareShape.color = playerColor;
        // Add button to the stage
        lobbyContainer.addChild(playerSquareShape);
        // Add 'me' text for local player
        if(shangrila.local_player == playerColor) {
            var meText = new createjs.Text('Me',(stage.canvas.width * 0.03) + 'px Arial','white');
            meText.x = playerSquareShape.getBounds().x + (playerSquareShape.getBounds().width - meText.getBounds().width)/2;
            meText.y = playerSquareShape.getBounds().y + (playerSquareShape.getBounds().height - meText.getBounds().height)/2;
            lobbyContainer.addChild(meText);
        }
        numberOfPlayers++;
    }

    if(numberOfPlayers > 2 && shangrila.gameInitiator == shangrila.local_player) {
        buttonWidth = stage.canvas.width * 0.2;
        buttonHeight = buttonWidth * 0.25;
        x = (stage.canvas.width/2)-(buttonWidth/2);
        y = stage.canvas.height * 0.7;

        var buttonText = new createjs.Text('Start game', buttonWidth * 0.15 + 'px Arial','white');

        var startButtonShape = new createjs.Shape();
        startButtonShape.graphics.beginFill('green').rect(
            x,
            y,
            buttonWidth,
            buttonHeight
        );
        buttonText.x = x + (buttonWidth/2) - (buttonText.getBounds().width/2);
        buttonText.y = y + (buttonHeight * 0.1);

        // Set color and add mouse over effects
        startButtonShape.color = shangrila.colorNames[i];
        startButtonShape.addEventListener('mouseover', function(event) {
            event.target.alpha = .50;
        });
        startButtonShape.addEventListener('mouseout', function(event) {
            event.target.alpha = 1;

        });
        // Set action to perform when clicked
        startButtonShape.addEventListener('click', function(event) {
            socket.emit('__initNewGame');
        });

        lobbyContainer.addChild(startButtonShape);
        lobbyContainer.addChild(buttonText);
    } else {
        /* Waiting notices */
        if(shangrila.gameInitiator == shangrila.local_player) {
            waitingText = 'Waiting for other players to join the game';
        } else {
            waitingText = 'Waiting for ' + shangrila.gameInitiator + ' to start the game.';
        }
        var waitingToStartNotice = new createjs.Text(waitingText, (stage.canvas.width * 0.02) + 'px Arial', 'black');
        bounds = waitingToStartNotice.getBounds();
        waitingToStartNotice.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
        waitingToStartNotice.y = stage.canvas.height * 0.40;
        lobbyContainer.addChild(waitingToStartNotice);
    }
    if(shangrila.gameInitiator == shangrila.local_player) {
        var presetStartingPlacements = new createjs.Text('Use preset starting placements', (stage.canvas.width * 0.015) + 'px Arial', 'black');
        bounds = presetStartingPlacements.getBounds();
        presetStartingPlacements.x = (stage.canvas.width * 0.5) - (bounds.width / 2) + stage.canvas.width * 0.01;
        presetStartingPlacements.y = stage.canvas.height * 0.63;
        lobbyContainer.addChild(presetStartingPlacements);

        checkboxX = presetStartingPlacements.x - stage.canvas.width * 0.025;
        checkboxY = presetStartingPlacements.y - presetStartingPlacements.getBounds().height * 0.1;
        checkboxWidth = stage.canvas.width * 0.02;
        checkboxHeight = checkboxWidth;
        checkboxChecked = shangrila.presetStartingPositions;
        fillColor = (checkboxChecked == true ? 'black' : 'white');
        var checkbox = new createjs.Graphics()
            .beginFill(fillColor)
            .beginStroke('black')
            .rect(
                checkboxX,
                checkboxY,
                checkboxWidth,
                checkboxHeight
            )
            .endFill();

        var checkboxShape = new createjs.Shape(checkbox);
        checkboxShape.checked = checkboxChecked;
        checkboxShape.setBounds(100,100,100,100);
        checkboxShape.addEventListener('click', function (event) {
            checkboxShape.checked = !checkboxShape.checked;
            fillColor = (checkboxShape.checked == true ? 'black' : 'white');
            event.target.graphics.beginFill(fillColor).rect(
                checkboxX,
                checkboxY,
                checkboxWidth,
                checkboxHeight
            ).endFill();
        });
        lobbyContainer.addChild(checkboxShape);
    }

    lobbyContainer.name = 'lobbyContainer';
    stage.addChild(lobbyContainer);
};

/* Initializes new game board. Used when game initiator starts the game */
Shangrila.prototype.initNewGame = function() {
    shangrila.inSplash = false;
    shangrila.inLobby = false;
    shangrila.setupRound = true;

    if(lobbyContainer = stage.getChildByName('lobbyContainer')) {
        stage.removeChild(lobbyContainer); // remove splash page from stage
    }

    this.gameboardWidth = stage.canvas.width*0.8;
    this.gameboardHeight = stage.canvas.height;
    this.controldeckWidth = stage.canvas.width*0.2;

    /* Draw background game board */
    var graphicsGamecanvas = new createjs.Graphics().beginFill(this.colors[shangrila.local_player]['gamecanvasBackground']).rect(0, 0, this.gameboardWidth, stage.canvas.height);
    var backgroundGamecanvas = new createjs.Shape(graphicsGamecanvas);
    backgroundGamecanvas.name = 'backgroundGamecanvas';
    stage.addChild(backgroundGamecanvas);

    /* Draw background control deck */
    var graphicsControldeck = new createjs.Graphics().beginFill(this.colors[shangrila.local_player]['controldeckBackground']).rect(this.gameboardWidth, 0, this.controldeckWidth, stage.canvas.height);
    var backgroundControldeck = new createjs.Shape(graphicsControldeck);
    backgroundControldeck.setBounds(this.gameboardWidth, 0, this.controldeckWidth, stage.canvas.height);
    backgroundControldeck.name = 'backgroundControldeck';
    stage.addChild(backgroundControldeck);

    this.drawBridges();
    this.drawVillages();
    this.drawGuildShields();

    shangrila.showMessage('Welcome player ' + shangrila.local_player + '!');
    //shangrila.showMessage('Please place one of your guilds in a village (with a maximum of 3 per village).', 5000);
};

/* Update the current player indicator */
Shangrila.prototype.updateCurrentPlayer = function() {
    if(shangrila.local_player == shangrila.currentPlayer) {
        turnIndicatorText = 'your turn';
        shangrila.showMessage('It is your turn');

        if(shangrila.autoSetupRound && shangrila.setupRound) {
            // Auto setup round enabled for debugging purposes; auto place master - 1 sec delay
            setTimeout(function () {
                socket.emit('__placeMaster', {
                    village_id: 'auto',
                    guild_id: 'auto',
                    guildName: 'auto',
                    player: shangrila.local_player
                });
            }, 1000);
        }
        if(!shangrila.setupRound) {
            shangrila.drawMenu();
        }
    } else {
        turnIndicatorText = shangrila.currentPlayer + '\'s turn';
        shangrila.showMessage('It is player ' + shangrila.currentPlayer + '\'s turn');
    }
    /* Update (or create) turn indicator */
    if(turnIndicator = stage.getChildByName('turnIndicator')) {
        turnIndicator.text = turnIndicatorText;
    } else {
        var turnIndicator = new createjs.Text(turnIndicatorText, '30px Arial','black');
        var backgroundControldeck = stage.getChildByName('backgroundControldeck');
        turnIndicator.x = stage.canvas.width * 0.85;
        turnIndicator.name = 'turnIndicator';
        turnIndicator.y = stage.canvas.height * 0.9;
        stage.addChild(turnIndicator);
    }
};

/* Draws the three turn options for the current player */
Shangrila.prototype.drawMenu = function() {
    var menuScreen = new createjs.Container();
    menuScreen.name = 'menuScreen';

    var menuBackground = new createjs.Graphics().beginFill('black').rect(0, 0, stage.canvas.width, stage.canvas.height);
    var menuBackgroundShape = new createjs.Shape(menuBackground);
    menuBackgroundShape.name = 'menuBackground';
    menuBackgroundShape.alpha = .7;
    menuScreen.addChild(menuBackgroundShape);

    width = stage.canvas.width*0.25;
    height = stage.canvas.width*0.25;
    x = (stage.canvas.width - width) / 2;
    y = (stage.canvas.height - height) / 3;
    var menu = new createjs.Graphics().beginFill('white').rect(x, y, width, height);
    var menuShape = new createjs.Shape(menu);
    menuShape.name = 'menu';
    menuScreen.addChild(menuShape);

    var menuTitle = 'Choose action';
    var titleText = new createjs.Text(menuTitle, '30px Arial','black');
    titleText.x = x + ((width - titleText.getBounds().width) / 2);
    titleText.y = y + titleText.getBounds().height;
    menuScreen.addChild(titleText);

    var menuOptions = ['Place master','Place students','Move students'];
    i = 0;
    for(var menuOption in menuOptions) {
        if (menuOptions.hasOwnProperty(menuOption)) {
            optionText = new createjs.Text(menuOptions[menuOption], '25px Arial', 'grey');
            textWidth = optionText.getBounds().width;
            textHeight = optionText.getBounds().height;
            optionText.x = x + ((width - textWidth) / 2);
            optionText.y = titleText.y + (titleText.getBounds().height * 1.5) + (textHeight * 1.5 * i);
            optionText.hitArea = new createjs.Shape(new createjs.Graphics().beginFill('#000').drawRect(0,0,textWidth,textHeight));

            optionText.on('mouseover', function (e) {
                e.target.color = 'black';
            });

            optionText.on('mouseout', function (e) {
                e.target.color = 'grey';
            });

            if(menuOptions[menuOption] == 'Place master') {
                optionText.on('click', function (e) {
                    alert('Click on an available tile to place your master.');
                    stage.removeChild(stage.getChildByName('menuScreen'));
                });
            } else if(menuOptions[menuOption] == 'Place students') {
                optionText.on('click', function (e) {
                    alert('Click on two of your masters to place two students.');
                });
            } else if(menuOptions[menuOption] == 'Move students') {
                optionText.on('click', function (e) {
                    alert('Choose the village from where you want to move your students, followed by the village where you want them to go.');
                });
            }

            menuScreen.addChild(optionText);
            i++
        }
    }
    stage.addChild(menuScreen);
};

/* Draw the villages on the canvas */
Shangrila.prototype.drawVillages = function() {
    /* Loop through villages */
    for(i=0;i<this.villages.length;i++) {
        /* Get and calculate village positions and edges */
        var x = shangrila.gameboardWidth * (this.villages[i]['left']/100);
        var y = stage.canvas.clientHeight * (this.villages[i]['top']/100);
        var width = shangrila.gameboardWidth * this.villageWidth;
        var height = stage.canvas.clientHeight * this.villageHeight;

        /* Add image to stage */
        var village = new createjs.Bitmap(loader.getResult('village'));
        village.x = x;
        village.y = y;
        bounds = village.getBounds();
        village.scaleX = width / bounds.width;
        village.scaleY = height / bounds.height;
        village.village_id = i;
        village.name = 'village_' + i;
        village.masterTiles = {'blue': 0, 'red': 0, 'yellow': 0, 'violet': 0};
        village.studentTiles = {'blue': 0, 'red': 0, 'yellow': 0, 'violet': 0};

        village.addEventListener('mouseover', function(e) {
            oldWidth = e.target.getBounds().width;
            oldHeight = e.target.getBounds().height;
            e.target.scaleX = e.target.scaleX * 1.1;
            e.target.scaleY = e.target.scaleY * 1.1;
            newWidth = e.target.getBounds().width;
            newHeight = e.target.getBounds().height;
            moveX = (newWidth - oldWidth) / 2;
            moveY = (newHeight - oldHeight) / 2;
            e.target.x += moveX;
            e.target.y += moveY;
        });
        village.addEventListener('mouseout', function(e) {
            oldWidth = e.target.getBounds().width;
            oldHeight = e.target.getBounds().height;
            e.target.scaleX = e.target.scaleX / 1.1;
            e.target.scaleY = e.target.scaleY / 1.1;
            newWidth = e.target.getBounds().width;
            newHeight = e.target.getBounds().height;
            moveX = (newWidth - oldWidth) / 2;
            moveY = (newHeight - oldHeight) / 2;
            e.target.x -= moveX;
            e.target.y -= moveY;
        });

        stage.addChild(village);

        if(identify) {
            var text = new createjs.Text(i,'20px Arial','#ff0000');
            text.x = x+width;
            text.y = y+height/2;
            text.textBaseline = 'alphabetic';
            stage.addChild(text);
        }
    }
}

/* Draw the bridges on the canvas */
Shangrila.prototype.drawBridges = function() {
    /* Loop through bridges */
    for(i=0;i<this.bridges.length;i++) {
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

/* See whether a stone of the wise men needs to be placed in a village */
/* TODO: the recalculation of this should be moved to app.js */
Shangrila.prototype.recalculateStoneOfTheWiseMenPlacings = function() {
    var connected = [];
    for(i=0;i<this.bridges.length;i++) {
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
    for(i=0;i<this.villages.length;i++) {
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
    var noGuildsOnSingleRow = 3;
    var guildWidth = (shangrila.controldeckWidth * 0.6) / (noGuildsOnSingleRow+1);
    var padding = (shangrila.controldeckWidth * 0.05);
    var guildHeight = guildWidth;

    for(i=0;i<this.guilds.length;i++) {
        guildName = this.guilds[i];

        /* Draw guild shield on the control deck */
        if(i > noGuildsOnSingleRow) {
            var y = (shangrila.gameboardHeight * 0.05) + (guildHeight * 1.8);
            j = i-noGuildsOnSingleRow+1;
        } else {
            var y = (shangrila.gameboardHeight * 0.05);
            j = i+1;
        }
        var x = shangrila.gameboardWidth + ((guildWidth + padding) * j) - guildWidth / 2;

        /* Draw guilds on the controldeck */
        /* Set square background for guild shield */
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

        /* Set amount on top of guild shield */
        var guildAmount = new createjs.Graphics().beginFill('grey').rect(
            x,
            y+guildHeight,
            guildWidth,
            guildHeight*0.6
        );
        var guildAmountShape = new createjs.Shape(guildAmount);
        stage.addChild(guildAmountShape);

        /* Set inital (D for Dragonbreather, etc) */
        var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 2) + 'px Arial','#fff');
        initial.x = x+guildWidth*0.30;
        initial.y = y+guildHeight*0.70;
        initial.textBaseline = 'alphabetic';
        initial.name = 'guild_initial_blue_'  + guildName.substr(0,1);
        stage.addChild(initial);

        for (n = 0; n < shangrila.colorNames.length; n++) {
            if(shangrila.colorNames[n] == shangrila.local_player) {
                var amount = new createjs.Text('AMOUNT', (guildWidth / 3) + 'px Arial', '#fff');
                amount.x = x + guildWidth * 0.4;
                amount.y = y + guildHeight * 1.43;
                amount.amount = 6;
                amount.text = amount.amount;
                amount.textBaseline = 'alphabetic';
                amount.name = 'guild_amount_' + shangrila.colorNames[n] + '_' + guildName.substr(0, 1);
                stage.addChild(amount);
            }
        }

        /* Small guilds for on the villages */
        guildWidthSmall = guildWidth * 0.5;
        guildHeightSmall = guildHeight * 0.5;
        paddingSmall = padding * 0.1;

        /* Draw shields for current guild on all villages */
        for(j=0;j<this.villages.length;j++) {
            villageObject = stage.getChildByName('village_' + j);

            y = villageObject.y;
            x = villageObject.x;

            /* Position small shields in grid of 2, 3, 2 over the villages */
            y += guildWidth * .26123302;
            x += (guildWidth * .26123302) / 2;
            if(i <= 1) {

            } else if(i > 1 && i <= 4) {
                y += (guildWidth * .26123302)*2.5;
                x -= guildWidth * 1.880877743;
            } else if(i > 4) {
                y += guildWidth * 1.306165099;
                x -= guildWidth * 3.657262278;
            }

            x += ((i+1) * (guildWidthSmall + (guildWidth * .26123302)));

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
               event.target.graphics.beginFill(shangrila.local_player).rect(
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
                shangrila.placeMaster({village_id: event.target.village_id, guild_id: event.target.guild_id, guildName: event.target.guildName, player: shangrila.local_player }, event);
            });
            stage.addChild(guildShapeSmall);

            var initial = new createjs.Text(guildName.substr(0,1),(guildWidth / 3) + 'px Arial','black');
            initial.x = x + 5;
            initial.y = y + 3;
            initial.name = 'guild_small_initial_blue_'  + guildName.substr(0,1);
            stage.addChild(initial);
        }
    }
};

/* Draws the master on the chosen city for a certain player */
Shangrila.prototype.placeMaster = function(data, event) {
    var village = stage.getChildByName('village_' + data.village_id);
    var guildShapeSmall = stage.getChildByName('guild_shape_small_' + data.guild_id + '_' + data.village_id);
    var amount = stage.getChildByName('guild_amount_' + data.player + '_' + data.guildName.substr(0,1));

    if(data.player == shangrila.currentPlayer) {
        // Set up round
        if (shangrila.setupRound && amount.amount == 6) {
            totalMasterTiles = 0;
            for (var key in village.masterTiles) {
                totalMasterTiles += village.masterTiles[key];
            }
            /* The placing limits are different for a 3 player game than for a 4 player game */
            if(shangrila.activePlayers.length == 3) {
                villageLimit = 2;
                perPlayerLimit = 1;
                pluralSuffix = null;
            } else {
                villageLimit = 3;
                perPlayerLimit = 2;
                pluralSuffix = 's';
            }
            if (totalMasterTiles >= limit) {
                shangrila.showMessage('Sorry, there are already ' + limit + ' masters in this village.');
            } else if (village.masterTiles[data.player] >= perPlayerLimit) {
                shangrila.showMessage('Sorry, you already have ' + perPlayerLimit + ' master' + pluralSuffix + ' in this village.');
            } else {
                socket.emit('__placeMaster', {
                    'village_id': data.village_id,
                    guild_id: data.guild_id,
                    guildName: data.guildName,
                    player: data.player
                });
            }
        } else if (shangrila.setupRound && amount.amount < 6) {
            shangrila.showMessage('Sorry, you have already placed a ' + data.guildName + ' master in a village. This is not allowed in the first round.');
        } else if (!shangrila.setupRound) {
            // Normal game
            // A master can only be placed in a village when the current player has at least one master in that village
            totalGuildsInVillage = 0;
            for(var guild in stateMachine['villages']['village_' + data.village_id]['player_' + data.player]) {
                totalGuildsInVillage += stateMachine['villages']['village_' + data.village_id]['player_' + data.player][guild];
            }
            if(totalGuildsInVillage > 0) {
                socket.emit('__placeMaster', {
                    'village_id': data.village_id,
                    guild_id: data.guild_id,
                    guildName: data.guildName,
                    player: data.player
                });
            } else {
                shangrila.showMessage('You can only place a master in a village where you have at least one other master.');
            }
        }
    } else {
        shangrila.showMessage('It is not your turn! It is ' + shangrila.currentPlayer + '\'s turn!');
    }
};

Shangrila.prototype.updateGuildShield = function(data) {
    if(typeof data.silent == 'undefined') data.silent = false;
    var village = stage.getChildByName('village_' + data.village_id);
    var guildShapeSmall = stage.getChildByName('guild_shape_small_' + data.guild_id + '_' + data.village_id);

    guildShapeSmall.graphics.beginFill(data.player).rect(
        guildShapeSmall.getBounds().x,
        guildShapeSmall.getBounds().y,
        guildShapeSmall.getBounds().width,
        guildShapeSmall.getBounds().height
    ).endFill();

    guildShapeSmall.removeAllEventListeners();

    village.masterTiles[data.player] += 1;
    if(data.player == shangrila.currentPlayer) {
        /* Update amount in sidebar */
        var amount = stage.getChildByName('guild_amount_' + data.player + '_' + data.guildName.substr(0,1));
        if(typeof amount != 'undefined') {
            amount.amount = amount.amount - 1;
            amount.text = amount.amount;
        }
        // Show message
        if(!data.silent) {
            shangrila.showMessage('You have placed a ' + data.guildName + ' master in village ' + data.village_id);
        }
    } else {
        if(!data.silent) {
            shangrila.showMessage(data.player + ' has placed a ' + data.guildName + ' master in village ' + data.village_id);
        }
    }
};

/* Show a message that is pushed from app.js */
Shangrila.prototype.showMessage = function(messageText, duration) {
    if(typeof messageText == 'string') {
        console.log(messageText);
        if (typeof duration == 'undefined') duration = 2000;

        this.messageHistory.push({timestamp: +new Date, message: messageText});

        this.numberOfActiveMessages += 1;

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

        var toPosition = ((this.numberOfActiveMessages - 1) * height) + 0;
        var toPositionMessage = ((this.numberOfActiveMessages - 1) * height) + 5;

        createjs.Tween.get(messageShape).to({y: toPosition}, 500).wait(duration).to({y: height * -1}, 1000).call(function (event) {
            stage.removeChild(event.target);
        });

        var message = new createjs.Text(messageText, '12px Arial', 'white');
        bounds = message.getBounds();
        message.x = (stage.canvas.width * 0.5) - (bounds.width / 2);
        message.y = height * -1;
        createjs.Tween.get(message).to({y: toPositionMessage}, 500).wait(duration).to({y: height * -1}, 1000).call(function (event) {
            stage.removeChild(event.target);
            shangrila.numberOfActiveMessages -= 1;
        });

        stage.addChild(message);
    }

};