// main.ts - what the game IS: its size, its settings, and its scenes.
//
// There is only one scene, RoomScene. It shows ONE room - one Tiled map - and when the player goes
// through a door, it restarts itself with the next room's map.

import Phaser from "phaser";
import { RoomScene } from "./scenes/RoomScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Tiled Doors",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b0b12",

  // the game is always 800 x 600 inside, and is scaled to fit its <div> on the page
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Arcade Physics, seen from above: no gravity
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },

  scene: [RoomScene],
};

new Phaser.Game(config);
