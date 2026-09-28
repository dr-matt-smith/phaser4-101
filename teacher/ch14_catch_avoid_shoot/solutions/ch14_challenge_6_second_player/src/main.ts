// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Arcade Physics moves the ship, the bullets and the enemies, and tells the game scene when they
// touch. There is no gravity - this is space.

import Phaser from "phaser";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { StartScene } from "./scenes/StartScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Space Shooter",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b0d1a",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  // start -> game -> game over -> game -> ...
  scene: [StartScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
