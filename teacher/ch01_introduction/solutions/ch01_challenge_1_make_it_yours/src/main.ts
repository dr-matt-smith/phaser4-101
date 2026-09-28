// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Phaser reads this CONFIG object and builds the game from it: it makes a <canvas>, puts it in
// <div id="game"> on the page, starts the game loop, and starts the first scene in the list.

import Phaser from "phaser";
import { HelloScene } from "./scenes/HelloScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Star Painter",

  // draw with WebGL if the browser has it (it almost always does), or the plain canvas if not
  type: Phaser.AUTO,

  // the id of the <div> in index.html that the game goes in
  parent: "game",

  backgroundColor: "#264653",

  // the game is always 800 x 600 inside - every x and y in the code uses those numbers - and
  // it is stretched or shrunk to FIT its <div>, keeping its shape
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // the scenes - Phaser makes one of each, and starts the first
  scene: [HelloScene],
};

new Phaser.Game(config);
