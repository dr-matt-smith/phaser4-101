// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Three scenes, and Phaser starts the FIRST one in the list. After that, each scene decides
// which scene comes next.

import Phaser from "phaser";
import { PlayScene } from "./scenes/PlayScene.ts";
import { StartScene } from "./scenes/StartScene.ts";
import { WinScene } from "./scenes/WinScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Click the Ball",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // start -> play -> win -> play -> win ...
  scene: [StartScene, PlayScene, WinScene],
};

new Phaser.Game(config);
