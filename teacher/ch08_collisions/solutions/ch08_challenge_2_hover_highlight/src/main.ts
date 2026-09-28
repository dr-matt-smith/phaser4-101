// main.ts - what the game IS: its size, its settings, and its scenes.
//
// No physics here: this project finds out when shapes touch using nothing but geometry.

import Phaser from "phaser";
import { ShapesScene } from "./scenes/ShapesScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Hand-made Collisions",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  // the game is always 800 x 600 inside, and is scaled to fit its <div> on the page
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [ShapesScene],
};

new Phaser.Game(config);
