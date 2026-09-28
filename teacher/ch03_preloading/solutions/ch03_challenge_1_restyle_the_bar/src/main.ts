// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Three scenes, and Phaser starts the FIRST one in the list:
//   BootScene    - loads the little the loading screen needs (the logo), then starts...
//   PreloadScene - the loading screen: loads everything else, with a progress bar, then starts...
//   MenuScene    - the game's menu, which can use every file the game has

import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Loading Screen",
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

  scene: [BootScene, PreloadScene, MenuScene],
};

new Phaser.Game(config);
