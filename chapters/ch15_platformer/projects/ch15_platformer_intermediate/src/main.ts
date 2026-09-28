// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Title -> Game -> End -> Game ... The GameScene restarts itself when the hero is hurt.

import Phaser from "phaser";
import { EndScene } from "./scenes/EndScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { TitleScene } from "./scenes/TitleScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Platformer (intermediate)",
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

  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false, // true draws every body's outline - try it
    },
  },

  scene: [TitleScene, GameScene, EndScene],
};

new Phaser.Game(config);
