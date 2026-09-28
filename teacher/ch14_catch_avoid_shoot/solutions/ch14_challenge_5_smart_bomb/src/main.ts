// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Five scenes. PreloadScene runs first and hands over to the menu. GameScene LAUNCHES HudScene to
// run on top of it (Chapter 4), so the score and health bar are drawn by a scene of their own.

import Phaser from "phaser";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { HudScene } from "./scenes/HudScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Space Shooter Deluxe",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b0d1a",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  // HudScene is listed AFTER GameScene, so when both run it is drawn on top
  scene: [PreloadScene, MenuScene, GameScene, HudScene, GameOverScene],
};

new Phaser.Game(config);
