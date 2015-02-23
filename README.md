# Shangri-la HTML5/JS version

The Bridges of Shangri-la is a board game created by Leo Colovini and published by 999 Games (amongst others). More info is available on [Boardgamegeek.com](http://boardgamegeek.com/boardgame/8190/the-bridges-of-shangri-la).

As a fun exercise and to familiarize myself with building games in HTML5/JS, I've set out to recreate this game in a digital form pure as a hobby.

# Screenshots
These are obviously screenshots from the devving-in-progress stage.
![screenshot-1](https://cloud.githubusercontent.com/assets/431360/6327781/3dd5d8f8-bb60-11e4-815f-958ad61d9483.jpg)
![screenshot-2](https://cloud.githubusercontent.com/assets/431360/6327783/3f4a81d4-bb60-11e4-929e-87f88bf8104a.jpg)

## Changelog
### 23-02-2015
I had moved development to a local repo, but decided to push to this repo every once in a while. I'm now at the point where a large part of the basic game mechanics work; I have to implement the 'Travel students' game action and after that it's polishing up. So I'd say I'm at about 50% right now. Might rebrand it into another theme, such as pirates or islands. Will revisit!

### 15-01-2014
Found easelJS. Tried it, was convinced. Rewrote custom JS part in easelJS; object handling is awesome, as well as a preloader built in :)
I've added village and bridge identification by adding a boolean to show a number on the object. I've also removed the HTML div for the controldeck and created the guild icons (now just with an initial) through easelJS as well.

For the time being, you can delete the bridges by clicking on it. Once all bridges to a village have been burned, the stone of the wise men is automatically placed on that city.

Next up; placing guild tiles on villages and keeping track of them.

### 11-01-2014
Started building this. Created a HTML5 canvas abstract map version of the Shangri-la map with 13 villages and 23 villages, based on relative distances measured from the actual board. I've put in most of the basics, now it's time to look at the nodeJS (or meteorJS?) side of things.
