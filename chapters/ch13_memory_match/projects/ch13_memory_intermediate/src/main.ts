// main.ts - what the game IS: its size, its settings, and its scenes.
//
// start -> game -> win -> game -> win ... (ESC on the win screen goes back to the start)

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { StartScene } from "./scenes/StartScene.ts";
import { WinScene } from "./scenes/WinScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Memory Match Plus",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [StartScene, GameScene, WinScene],
};

new Phaser.Game(config);
