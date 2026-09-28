// main.ts - what the game IS: its size, its settings, and its scenes.
//
// preload -> menu -> game -> level complete -> game (next level, or again) ... -> menu

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Memory Match Deluxe",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [PreloadScene, MenuScene, GameScene, LevelCompleteScene],
};

new Phaser.Game(config);
