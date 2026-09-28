// main.ts - what the game IS: its size, its settings, and its scenes.
//
// One scene: a board of buttons that play sounds, and keys that change how they sound.

import Phaser from "phaser";
import { SoundBoardScene } from "./scenes/SoundBoardScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Sound Board",
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

  scene: [SoundBoardScene],
};

new Phaser.Game(config);
