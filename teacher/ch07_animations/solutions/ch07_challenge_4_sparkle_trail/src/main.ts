// main.ts - what the game IS: its size, its settings, and its scenes.
//
// PreloadScene loads everything and makes the explosion animation, then starts the playground.
// The playground and the easing gallery start each other.

import Phaser from "phaser";
import { EasingScene } from "./scenes/EasingScene.ts";
import { PlaygroundScene } from "./scenes/PlaygroundScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Tweens and Particles",
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

  scene: [PreloadScene, PlaygroundScene, EasingScene],
};

new Phaser.Game(config);
