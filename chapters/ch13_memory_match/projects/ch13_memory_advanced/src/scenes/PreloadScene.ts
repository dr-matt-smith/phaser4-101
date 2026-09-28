import Phaser from "phaser";
// every export of assets.ts, as A.STAR_KEY, A.STAR_FILE and so on - there are a lot of them
import * as A from "../assets.ts";
import { THEMES } from "../themes/themes.ts";
import { MENU_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads everything, with a progress bar (Chapter 3), then starts the menu

const BAR_WIDTH = 400;
const BAR_HEIGHT = 24;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    this.add.text(centreX, centreY - 50, "Loading...", { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" })
      .setOrigin(0.5);
    const bar = this.add.graphics();
    this.load.on("progress", (progress: number) => {
      bar.clear();
      bar.fillStyle(0xa8dadc);
      bar.fillRect(centreX - BAR_WIDTH / 2, centreY, BAR_WIDTH * progress, BAR_HEIGHT);
    });

    // every theme's sprite sheet: each theme knows its own file and frame size, so adding a
    // theme to THEMES is enough to have it loaded
    for (const theme of Object.values(THEMES)) {
      this.load.spritesheet(theme.texture, theme.file, { frameWidth: theme.tileWidth, frameHeight: theme.tileHeight });
    }

    this.load.image(A.STAR_KEY, A.STAR_FILE);
    this.load.image(A.BUTTON_KEY, A.BUTTON_FILE);
    this.load.image(A.BUTTON_OVER_KEY, A.BUTTON_OVER_FILE);
    this.load.image(A.BUTTON_DOWN_KEY, A.BUTTON_DOWN_FILE);
    this.load.image(A.TABLE_KEY, A.TABLE_FILE);
    this.load.image(A.PARTICLE_KEY, A.PARTICLE_FILE);

    this.load.audio(A.FLIP_KEY, A.FLIP_FILE);
    this.load.audio(A.CORRECT_KEY, A.CORRECT_FILE);
    this.load.audio(A.WRONG_KEY, A.WRONG_FILE);
    this.load.audio(A.WIN_KEY, A.WIN_FILE);
    this.load.audio(A.CLICK_KEY, A.CLICK_FILE);
    this.load.audio(A.PEEK_KEY, A.PEEK_FILE);
    this.load.audio(A.SHUFFLE_KEY, A.SHUFFLE_FILE);
  }

  create(): void {
    this.scene.start(MENU_SCENE);
  }
}
