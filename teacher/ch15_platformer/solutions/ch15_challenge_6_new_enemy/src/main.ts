// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Preload -> Menu (level select) -> Game (+ Hud on top) -> Result -> Game or Menu

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { HudScene } from "./scenes/HudScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";
import { ResultScene } from "./scenes/ResultScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Platformer (advanced)",
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

  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false, // true draws every body's outline - try it
    },
  },

  // the HUD is listed after the game, so it is drawn on top of it
  scene: [PreloadScene, MenuScene, GameScene, HudScene, ResultScene],
};

new Phaser.Game(config);
