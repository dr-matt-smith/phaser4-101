// main.ts - what the game IS: its size, its settings, and its scenes.
//
// PreloadScene runs first: it loads the sprite sheets, makes every animation, then starts LabScene.

import Phaser from "phaser";
import { LabScene } from "./scenes/LabScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Animation Lab",
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

  // the sprite sheets are small pixel art, shown scaled up: pixelArt keeps every pixel a sharp
  // square instead of blurring them together
  pixelArt: true,

  scene: [PreloadScene, LabScene],
};

new Phaser.Game(config);
