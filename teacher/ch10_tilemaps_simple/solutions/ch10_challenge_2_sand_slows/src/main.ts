// main.ts - what the game IS: its size, its settings, and its scenes.
// Everything the game DOES is in the scenes, in src/scenes/.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Array Map",
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

  // Arcade Physics (Chapter 8) - the player's body, and the tiles that block it
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  // pixel art: keep the tiles sharp when the game is scaled
  pixelArt: true,

  scene: [GameScene],
};

new Phaser.Game(config);
