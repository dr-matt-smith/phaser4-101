// main.ts - what the game IS: its size, its settings, and its scenes.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Collect and Avoid",
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

  // Turn on Arcade Physics for every scene. Game objects still only get a physics BODY when we
  // ask for one (this.physics.add...). debug: true draws every body's outline and velocity -
  // change it and rebuild to see what the physics engine sees.
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [GameScene],
};

new Phaser.Game(config);
