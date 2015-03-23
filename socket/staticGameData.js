/* Configure game data object */
var staticGameData = {};

/* Define the guilds */
staticGameData.guilds = ['Healer','Dragonbreather','Firekeeper','Priest','Rainmaker','Astrologer','Yeti-whisperer'];

/* Define positions of villages */
staticGameData.villagePositions = [];
staticGameData.villagePositions[0] = {top:14,left:22 };
staticGameData.villagePositions[1] = {top:34, left:12 };
staticGameData.villagePositions[2] = {top:60, left:18 };
staticGameData.villagePositions[3] = {top:16, left:43 };
staticGameData.villagePositions[4] = {top:30, left:33 };
staticGameData.villagePositions[5] = {top:49, left:36 };
staticGameData.villagePositions[6] = {top:70, left:36 };
staticGameData.villagePositions[7] = {top:21, left:59 };
staticGameData.villagePositions[8] = {top:38, left:56 };
staticGameData.villagePositions[9] = {top:60, left:54 };
staticGameData.villagePositions[10] = {top:65, left:70 };
staticGameData.villagePositions[11] = {top:50, left:75 };
staticGameData.villagePositions[12] = {top:30, left:73 };

staticGameData.villageWidth = 0.12;
staticGameData.villageHeight = 0.12;

/* Define the bridges that connect the villages
 * From and to refers to index key in the staticGameData.villages object above
 */
staticGameData.bridgePositions = [];
staticGameData.bridgePositions[0] = {from:0, to:2};
staticGameData.bridgePositions[1] = {from:2, to:6};
staticGameData.bridgePositions[2] = {from:0, to:1};
staticGameData.bridgePositions[3] = {from:1, to:2};
staticGameData.bridgePositions[4] = {from:0, to:4};
staticGameData.bridgePositions[5] = {from:4, to:1};
staticGameData.bridgePositions[6] = {from:1, to:6};
staticGameData.bridgePositions[7] = {from:0, to:3};
staticGameData.bridgePositions[8] = {from:4, to:7};
staticGameData.bridgePositions[9] = {from:3, to:7};
staticGameData.bridgePositions[10] = {from:4, to:5};
staticGameData.bridgePositions[11] = {from:5, to:6};
staticGameData.bridgePositions[12] = {from:5, to:9};
staticGameData.bridgePositions[13] = {from:5, to:8};
staticGameData.bridgePositions[14] = {from:6, to:9};
staticGameData.bridgePositions[15] = {from:9, to:10};
staticGameData.bridgePositions[16] = {from:8, to:10};
staticGameData.bridgePositions[17] = {from:11, to:10};
staticGameData.bridgePositions[18] = {from:7, to:11};
staticGameData.bridgePositions[19] = {from:7, to:8};
staticGameData.bridgePositions[20] = {from:3, to:12};
staticGameData.bridgePositions[21] = {from:7, to:12};
staticGameData.bridgePositions[22] = {from:12, to:11};

staticGameData.neighbours = [];
staticGameData.neighbours[0] = [1,2,3,4];
staticGameData.neighbours[1] = [0,2,4,6];
staticGameData.neighbours[2] = [0,1,6];
staticGameData.neighbours[3] = [0,7,12];
staticGameData.neighbours[4] = [0,1,5,7];
staticGameData.neighbours[5] = [4,6,8,9];
staticGameData.neighbours[6] = [1,2,5,9];
staticGameData.neighbours[7] = [3,4,8,11,12];
staticGameData.neighbours[8] = [5,7,10];
staticGameData.neighbours[9] = [5,6,10];
staticGameData.neighbours[10] = [8,9,11];
staticGameData.neighbours[11] = [7,10,12];
staticGameData.neighbours[12] = [3,7,11];

/* Define the colors that are used for the various players */
/**
 *  - Red (Ro-Tarya)
 *  - Blue (Ba-Lao)
 *  - Yellow (Gyl-Den)
 *  - Violet (Li-Lamas)
 */
staticGameData.colorNames = ['violet','green','red','blue'];
staticGameData.colors = {};
staticGameData.colors['blue'] = {};
staticGameData.colors['blue']['gamecanvasBackground'] = 'lightblue';
staticGameData.colors['blue']['controldeckBackground'] = '#7ec1d7';

staticGameData.colors['red'] = {};
staticGameData.colors['red']['gamecanvasBackground'] = '#f46d6d';
staticGameData.colors['red']['controldeckBackground'] = '#b80000';

staticGameData.colors['green'] = {};
staticGameData.colors['green']['gamecanvasBackground'] = '#AEDB92';
staticGameData.colors['green']['controldeckBackground'] = '#676E11';

staticGameData.colors['violet'] = {};
staticGameData.colors['violet']['gamecanvasBackground'] = '#e6aaff';
staticGameData.colors['violet']['controldeckBackground'] = '#58007d';

/* Preset starting placements for 3 players */
staticGameData.startingPlacements = [];
staticGameData.startingPlacements[3] = {};
staticGameData.startingPlacements[3].villages = {};
staticGameData.startingPlacements[3].villages['village_0'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_0']['player_blue']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_0']['player_red']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_1'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_1']['player_blue']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_1']['player_red']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_2'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_2']['player_blue']['P'] = 1;
staticGameData.startingPlacements[3].villages['village_2']['player_green']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_4'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_4']['player_blue']['Y'] = 1;
staticGameData.startingPlacements[3].villages['village_4']['player_red']['P'] = 1;
staticGameData.startingPlacements[3].villages['village_5'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_5']['player_green']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_5']['player_red']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_6'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_6']['player_green']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_6']['player_red']['R'] = 1;
staticGameData.startingPlacements[3].villages['village_7'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_7']['player_green']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_7']['player_blue']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_8'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_8']['player_green']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_8']['player_blue']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_9'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_blue'] = {};
staticGameData.startingPlacements[3].villages['village_9']['player_red']['H'] = 1;
staticGameData.startingPlacements[3].villages['village_9']['player_blue']['F'] = 1;
staticGameData.startingPlacements[3].villages['village_10'] = {};
staticGameData.startingPlacements[3].villages['village_10']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_10']['player_green']['A'] = 1;
staticGameData.startingPlacements[3].villages['village_11'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_red'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_green'] = {};
staticGameData.startingPlacements[3].villages['village_11']['player_red']['D'] = 1;
staticGameData.startingPlacements[3].villages['village_11']['player_green']['P'] = 1;

/* Preset starting placements for 4 players */
staticGameData.startingPlacements[4] = {};
staticGameData.startingPlacements[4].villages = {};
staticGameData.startingPlacements[4].villages['village_0'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_0']['player_violet']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_0']['player_violet']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_0']['player_red']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_2'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_2']['player_blue']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_2']['player_green']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_2']['player_red']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_3'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_3']['player_red']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_3']['player_green']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_4'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_4']['player_red']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_4']['player_blue']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_5'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_5']['player_red']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_5']['player_green']['A'] = 1;
staticGameData.startingPlacements[4].villages['village_5']['player_violet']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_7'] = {};
staticGameData.startingPlacements[4].villages['village_7']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_7']['player_blue']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_7']['player_blue']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_8'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_8']['player_green']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_8']['player_blue']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_8']['player_green']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_9'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_9']['player_violet']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_9']['player_green']['F'] = 1;
staticGameData.startingPlacements[4].villages['village_9']['player_violet']['H'] = 1;
staticGameData.startingPlacements[4].villages['village_10'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_blue'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_green'] = {};
staticGameData.startingPlacements[4].villages['village_10']['player_blue']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_10']['player_blue']['P'] = 1;
staticGameData.startingPlacements[4].villages['village_10']['player_green']['Y'] = 1;
staticGameData.startingPlacements[4].villages['village_11'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_violet'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_red'] = {};
staticGameData.startingPlacements[4].villages['village_11']['player_violet']['R'] = 1;
staticGameData.startingPlacements[4].villages['village_11']['player_red']['D'] = 1;
staticGameData.startingPlacements[4].villages['village_11']['player_red']['Y'] = 1;

/* Misc */
staticGameData.numberOfActiveMessages = 0;
staticGameData.messageHistory = [];
staticGameData.autoSetupRound = false;
staticGameData.presetStartingPositions = true;