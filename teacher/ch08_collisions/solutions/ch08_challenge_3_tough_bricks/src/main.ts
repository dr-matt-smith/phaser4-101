// main.ts - what the game IS: its size, its settings, and its scenes.

import Phaser from "phaser";
import { BreakoutScene } from "./scenes/BreakoutScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Breakout",
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

  // Arcade Physics, with no gravity (the default). Set debug to true to see the bodies
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [BreakoutScene],
};

new Phaser.Game(config);
