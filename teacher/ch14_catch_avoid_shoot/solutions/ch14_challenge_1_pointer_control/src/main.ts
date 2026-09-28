// main.ts - what the game IS: its size, its settings, and its scenes.
//
// The one new setting is `physics`: this game uses Arcade Physics (Chapter 8), so that falling
// things can fall on their own and the scene can ask "is this touching the basket?".

import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Fruit Catcher",
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

  // no world gravity: each falling thing gets its own (see GameScene), so the basket stays put
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  scene: [GameScene],
};

new Phaser.Game(config);
