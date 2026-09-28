// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Four scenes. The title screen waits for a click (so the browser lets the game make sounds);
// the menu and the credits share one music track; the game has another. The music is not
// owned by any scene - see Music.ts.

import Phaser from "phaser";
import { CreditsScene } from "./scenes/CreditsScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { TitleScene } from "./scenes/TitleScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Music Across Scenes",
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

  // title -> menu <-> credits
  //          menu <-> game
  scene: [TitleScene, MenuScene, CreditsScene, GameScene],
};

new Phaser.Game(config);
