import Phaser from "phaser";
import {
  BUTTON_DOWN_FILE,
  BUTTON_DOWN_KEY,
  BUTTON_FILE,
  BUTTON_KEY,
  BUTTON_OVER_FILE,
  BUTTON_OVER_KEY,
  CARD_HEIGHT,
  CARD_WIDTH,
  CARDS_FILE,
  CARDS_KEY,
  CLICK_FILE,
  CLICK_KEY,
  CORRECT_FILE,
  CORRECT_KEY,
  FLIP_FILE,
  FLIP_KEY,
  LOSE_FILE,
  LOSE_KEY,
  PLACE_FILE,
  PLACE_KEY,
  TABLE_FILE,
  TABLE_KEY,
  WIN_FILE,
  WIN_KEY,
  WRONG_FILE,
  WRONG_KEY,
} from "../assets.ts";
import { PRELOAD_SCENE, TITLE_SCENE } from "./keys.ts";

// PreloadScene - loads every picture and sound, with a progress bar, then starts the title screen
// (the pattern from Chapter 3)

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    const bar = this.add.rectangle(200, 300, 0, 24, 0xffd166).setOrigin(0, 0.5);
    this.add.rectangle(400, 300, 404, 28).setStrokeStyle(2, 0xffffff);
    this.load.on("progress", (fraction: number) => {
      bar.width = 400 * fraction;
    });

    this.load.spritesheet(CARDS_KEY, CARDS_FILE, { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT });
    this.load.image(TABLE_KEY, TABLE_FILE);
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(BUTTON_OVER_KEY, BUTTON_OVER_FILE);
    this.load.image(BUTTON_DOWN_KEY, BUTTON_DOWN_FILE);
    this.load.audio(FLIP_KEY, FLIP_FILE);
    this.load.audio(PLACE_KEY, PLACE_FILE);
    this.load.audio(CORRECT_KEY, CORRECT_FILE);
    this.load.audio(WRONG_KEY, WRONG_FILE);
    this.load.audio(WIN_KEY, WIN_FILE);
    this.load.audio(LOSE_KEY, LOSE_FILE);
    this.load.audio(CLICK_KEY, CLICK_FILE);
  }

  create(): void {
    this.scene.start(TITLE_SCENE);
  }
}
