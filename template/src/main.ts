// main.ts - what the game IS: its size, its settings, and its scenes.
// Everything the game DOES is in the scenes, in src/scenes/.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Phaser Game",
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

  scene: [GameScene],
};

new Phaser.Game(config);
