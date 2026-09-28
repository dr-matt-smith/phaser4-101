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
  JOKER_KEY,
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
    this.makeJoker(); // CHALLENGE 4
    this.scene.start(TITLE_SCENE);
  }

  // CHALLENGE 4: there is no joker in cards.png, so draw one - a cream card with a gold star - and
  // save the drawing as a texture called JOKER_KEY, the same size as the other cards
  private makeJoker(): void {
    const graphics = this.make.graphics({}, false); // false: made, but not added to the scene
    graphics.fillStyle(0xfffdf5);
    graphics.fillRoundedRect(1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2, 6);
    graphics.lineStyle(2, 0x9aa4bd);
    graphics.strokeRoundedRect(1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2, 6);

    // a five-pointed star: ten points, alternately far from and near to the centre
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 32 : 13;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(new Phaser.Math.Vector2(CARD_WIDTH / 2 + Math.cos(angle) * radius, CARD_HEIGHT / 2 + Math.sin(angle) * radius));
    }
    graphics.fillStyle(0xf4a261);
    graphics.fillPoints(points, true);
    graphics.lineStyle(2, 0xe63946);
    graphics.strokePoints(points, true);

    graphics.generateTexture(JOKER_KEY, CARD_WIDTH, CARD_HEIGHT);
    graphics.destroy();
  }
}
