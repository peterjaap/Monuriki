# Monukiri HTML5/JS version

Monukiri is a digital board game and is based on The Bridges of Shangrila. This is a board game created by Leo Colovini and published by 999 Games (amongst others). More info is available on [Boardgamegeek.com](http://boardgamegeek.com/boardgame/8190/the-bridges-of-Shangrila).

As a fun exercise and to familiarize myself with building games in HTML5/JS, I've set out to create this game in a digital form pure as a hobby.

# Screenshots
These are obviously screenshots from the devving-in-progress stage.
![screenshot 2015-03-22 14 36 32](https://cloud.githubusercontent.com/assets/431360/6769551/de7c65c4-d0a0-11e4-97dc-bdc6a2cf4493.png)
![in-game](https://cloud.githubusercontent.com/assets/431360/6769013/18e19fda-d089-11e4-9001-8396f1c7e136.png)
# Older screenshots
![screenshot 2015-02-23 23 15 27](https://cloud.githubusercontent.com/assets/431360/6338732/44ef302a-bbb1-11e4-8fe7-304ac6b90ff9.png)
![screenshot 2015-02-23 23 15 39](https://cloud.githubusercontent.com/assets/431360/6338731/44ef0afa-bbb1-11e4-837a-dd8acfb4bf3c.png)
![screenshot 2015-02-23 23 18 10](https://cloud.githubusercontent.com/assets/431360/6338789/a7494aa8-bbb1-11e4-83bb-c1aaf52566d5.png)
![screenshot 2015-02-23 23 18 22](https://cloud.githubusercontent.com/assets/431360/6338791/ab387206-bbb1-11e4-8a31-f2a38877c2bb.png)
![screenshot 2015-02-23 23 15 15](https://cloud.githubusercontent.com/assets/431360/6338733/44f0b2ec-bbb1-11e4-9921-93dd92404762.png)
![screenshot-1](https://cloud.githubusercontent.com/assets/431360/6327781/3dd5d8f8-bb60-11e4-815f-958ad61d9483.jpg)
![screenshot-2](https://cloud.githubusercontent.com/assets/431360/6327783/3f4a81d4-bb60-11e4-929e-87f88bf8104a.jpg)

## Changelog
### 23-02-2015
I had moved development to a local repo, but decided to push to this repo every once in a while. I'm now at the point where a large part of the basic game mechanics work; I have to implement the 'Travel students' game action and after that it's polishing up. So I'd say I'm at about 50% right now. Might rebrand it into another theme, such as pirates or islands. Will revisit! And I know, the code is nasty. Major refactoring needed concerning the server & client side events, the variables being pushed between the client and the server and the places where these variables are stored (now in staticGameData, stateMachine, the Shangrila object and bitmap objects on the stage -- it's a mess).

### 15-01-2014
Found easelJS. Tried it, was convinced. Rewrote custom JS part in easelJS; object handling is awesome, as well as a preloader built in :)
I've added village and bridge identification by adding a boolean to show a number on the object. I've also removed the HTML div for the controldeck and created the guild icons (now just with an initial) through easelJS as well.

For the time being, you can delete the bridges by clicking on it. Once all bridges to a village have been burned, the stone of the wise men is automatically placed on that city.

Next up; placing guild tiles on villages and keeping track of them.

### 11-01-2014
Started building this. Created a HTML5 canvas abstract map version of the Shangrila map with 13 villages and 23 villages, based on relative distances measured from the actual board. I've put in most of the basics, now it's time to look at the nodeJS (or meteorJS?) side of things.
