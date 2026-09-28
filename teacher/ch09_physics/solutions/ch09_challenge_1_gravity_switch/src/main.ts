// main.ts - what the game IS: its size, its settings, and its scenes.
//
// The new part is `physics`: it switches on Arcade Physics for every scene, and sets the world's
// gravity. Everything else about the physics is decided in the scene, and can change while the
// game runs.

import Phaser from "phaser";
import { PlaygroundScene } from "./scenes/PlaygroundScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Physics Playground",
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
      // pixels per second, per second: every second, a falling body goes 600 px/s faster
      gravity: { x: 0, y: 600 },
      // physics steps per second (60 is the default - written here so you can see it)
      fps: 60,
      // debug drawing: ON, so that Phaser gets ready to draw every body - but the scene hides
      // it at the start, and V shows it
      debug: true,
    },
  },

  scene: [PlaygroundScene],
};

new Phaser.Game(config);
