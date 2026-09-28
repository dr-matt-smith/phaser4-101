// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Arcade Physics with NO gravity: this is space. Everything keeps moving until something
// (drag, a collision, a wrap round the edge) changes it.

import Phaser from "phaser";
import { SpaceScene } from "./scenes/SpaceScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Space Ship",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0d1020",

  // the game is always 800 x 600 inside, and is scaled to fit its <div> on the page
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },

  scene: [SpaceScene],
};

new Phaser.Game(config);
