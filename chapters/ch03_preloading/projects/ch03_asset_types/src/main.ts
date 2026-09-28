// main.ts - what the game IS: its size, its settings, and its scenes.
// One scene, which loads one file of each kind and shows them all.

import Phaser from "phaser";
import { AssetTypesScene } from "./scenes/AssetTypesScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Asset Types",
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

  scene: [AssetTypesScene],
};

new Phaser.Game(config);
