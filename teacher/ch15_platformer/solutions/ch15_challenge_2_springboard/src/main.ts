// main.ts - what the game IS: its size, its settings, and its scenes.
//
// New for a platformer: Arcade Physics, with GRAVITY. Every dynamic body in the game is pulled
// down at `gravity.y` pixels per second, per second - the hero falls unless something holds it up.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Platformer (simple)",
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
      gravity: { x: 0, y: 900 },
      debug: false, // true draws every body's outline - try it
    },
  },

  scene: [GameScene],
};

new Phaser.Game(config);
