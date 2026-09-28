// main.ts - what the game IS: its size, its settings, and its scenes.
//
// PreloadScene runs first: it loads the pictures, makes the hero's animations, then starts
// GameScene.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Hero Animations",
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

  // the hero is pixel art shown at double size: keep its pixels sharp
  pixelArt: true,

  scene: [PreloadScene, GameScene],
};

new Phaser.Game(config);
