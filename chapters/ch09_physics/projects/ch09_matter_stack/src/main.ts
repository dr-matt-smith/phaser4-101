// main.ts - what the game IS: its size, its settings, and its scenes.
//
// This project uses Phaser's OTHER physics engine, Matter.js. Bodies can be any shape, they
// rotate, and they rest on each other properly - so things can be stacked and knocked over.

import Phaser from "phaser";
import { StackScene } from "./scenes/StackScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Matter Stack",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#5aa9e6",

  // the game is always 800 x 600 inside, and is scaled to fit its <div> on the page
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: "matter",
    matter: {
      // Matter's gravity is not in pixels per second: y: 1 is "normal" gravity
      gravity: { x: 0, y: 1 },
      // debug drawing: ON, so that Phaser gets ready to draw every body - but the scene hides
      // it at the start, and V shows it
      debug: true,
    },
  },

  scene: [StackScene],
};

new Phaser.Game(config);
