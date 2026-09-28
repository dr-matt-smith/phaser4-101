// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Four scenes. Phaser starts the first; the menu starts the game; the game LAUNCHES the HUD and
// the pause menu to run on top of it. Scenes running at the same time are drawn in the order of
// this list - so the HUD is drawn over the game, and the pause menu over both.

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";
import { HudScene } from "./scenes/HudScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { PauseScene } from "./scenes/PauseScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Pause and HUD",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // CHALLENGE 2: at most 30 frames a second. Everything that moves by delta (the player, the
  // triangles, the coins' fading) moves just as fast as before, in bigger steps.
  fps: {
    target: 60,
    limit: 30,
  },

  scene: [MenuScene, GameScene, HudScene, PauseScene],
};

new Phaser.Game(config);
