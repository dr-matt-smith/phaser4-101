// main.ts - what the game IS: its size, its settings, and its scenes.
//
// The level itself is not in the code at all: it was made in Tiled, and GameScene loads it from
// public/assets/maps/level1.tmj.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Tiled Level",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#8ecae6",

  // the game is always 800 x 600 inside, and is scaled to fit its <div> on the page
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Arcade Physics (Chapters 8 and 9), with gravity pulling everything down
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false,
    },
  },

  scene: [GameScene],
};

new Phaser.Game(config);
