// main.ts - what the game IS: its size, its settings, and its scenes.
// Everything the game DOES is in the scenes, in src/scenes/.

import Phaser from "phaser";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";
import { TitleScene } from "./scenes/TitleScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Higher or Lower - Advanced",
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

  // preload -> title -> game -> game over -> game (or title) ...
  scene: [PreloadScene, TitleScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
