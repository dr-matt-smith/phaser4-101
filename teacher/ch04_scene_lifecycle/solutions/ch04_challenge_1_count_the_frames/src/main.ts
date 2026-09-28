// main.ts - what the game IS: its size, its settings, and its scenes.
//
// Two scenes. Phaser starts the first, LogScene, which launches DemoScene to run alongside it.
// Scenes are drawn in list order - DemoScene, later in the list, is drawn on top.

import Phaser from "phaser";
import { DemoScene } from "./scenes/DemoScene.ts";
import { LogScene } from "./scenes/LogScene.ts";

const config: Phaser.Types.Core.GameConfig = {
  title: "Lifecycle Logger",
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#1d2433",

  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // How often the game loop runs. `target` is the rate Phaser aims for (60 is the default);
  // `limit` caps it - 0 means "as fast as the screen refreshes". Try limit: 10 and watch the
  // coin: it moves just as fast, in fewer, bigger steps, because it moves by delta. (The fps
  // figure will not drop: it counts the frames the browser offers, not the ones Phaser uses.)
  fps: {
    target: 60,
    limit: 0,
  },

  scene: [LogScene, DemoScene],
};

new Phaser.Game(config);
