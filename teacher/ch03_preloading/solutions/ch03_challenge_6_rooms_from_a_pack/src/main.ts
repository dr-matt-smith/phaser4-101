// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Two scenes: a menu of rooms, and a room. Each room's files are loaded when it is first chosen.

import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene.ts";
import { RoomScene } from "./scenes/RoomScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Load on Demand",
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

  // menu -> a room -> menu -> another room ...
  scene: [MenuScene, RoomScene],
};

new Phaser.Game(config);
