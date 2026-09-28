// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Two scenes. Phaser starts GameScene; GameScene LAUNCHES HudScene, so both run at once. Scenes are
// drawn in the order of this list, so the HUD (later in the list) is drawn on top.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { HudScene } from "./scenes/HudScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "HUD Events",
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

  scene: [GameScene, HudScene],
};

new Phaser.Game(config);
