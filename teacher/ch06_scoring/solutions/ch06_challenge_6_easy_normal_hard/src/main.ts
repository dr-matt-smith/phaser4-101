// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Five scenes. GameScene and HudScene run AT THE SAME TIME: GameScene launches the HUD when a game
// starts, and stops it when the game ends. Scenes are drawn in the order of this list, so the HUD
// (after GameScene) is drawn on top of the game.

import Phaser from "phaser";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { HudScene } from "./scenes/HudScene.ts";
import { NameEntryScene } from "./scenes/NameEntryScene.ts";
import { TitleScene } from "./scenes/TitleScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "High Score Table",
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

  // title -> game (+ HUD on top) -> name entry (a high score) -> title ...
  //                              -> game over (not a high score) -> game ...
  scene: [TitleScene, GameScene, HudScene, GameOverScene, NameEntryScene],
};

new Phaser.Game(config);
