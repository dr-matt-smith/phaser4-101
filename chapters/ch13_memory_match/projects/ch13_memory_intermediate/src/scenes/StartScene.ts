import Phaser from "phaser";
import {
  CLICK_FILE,
  CLICK_KEY,
  CORRECT_FILE,
  CORRECT_KEY,
  FLIP_FILE,
  FLIP_KEY,
  STAR_FILE,
  STAR_KEY,
  WIN_FILE,
  WIN_KEY,
  WRONG_FILE,
  WRONG_KEY,
} from "../assets.ts";
import { TILE_SIZE, TILES_FILE, TILES_KEY } from "../objects/Tile.ts";
import { GAME_SCENE, START_SCENE } from "./keys.ts";

// StartScene - the title screen. It runs first, so it loads everything the game needs.
//
// "Click to start" is not just politeness: browsers play no sound until the player has clicked
// or pressed a key (Chapter 5), so the first click here means the game's sounds will work.

const SHOW_FACES = [1, 4, 8, 10, 11, 3];    // the tiles shown across the title screen
const SHOW_GAP = 12;

export class StartScene extends Phaser.Scene {
  constructor() {
    super(START_SCENE);
  }

  preload(): void {
    this.load.spritesheet(TILES_KEY, TILES_FILE, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    this.load.image(STAR_KEY, STAR_FILE);
    this.load.audio(FLIP_KEY, FLIP_FILE);
    this.load.audio(CORRECT_KEY, CORRECT_FILE);
    this.load.audio(WRONG_KEY, WRONG_FILE);
    this.load.audio(WIN_KEY, WIN_FILE);
    this.load.audio(CLICK_KEY, CLICK_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    this.add.text(centreX, 120, "Memory Match", {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    // a row of tiles that drop in one after another: one tween, many targets, and a STAGGER
    // that delays each target a little more than the one before (Chapter 7)
    const rowWidth = SHOW_FACES.length * TILE_SIZE + (SHOW_FACES.length - 1) * SHOW_GAP;
    const left = centreX - rowWidth / 2 + TILE_SIZE / 2;
    const tiles = SHOW_FACES.map((face, index) => {
      return this.add.image(left + index * (TILE_SIZE + SHOW_GAP), 280, TILES_KEY, face).setAlpha(0);
    });
    this.tweens.add({
      targets: tiles,
      alpha: 1,
      y: { from: 220, to: 280 },
      duration: 400,
      ease: "Back.easeOut",
      delay: this.tweens.stagger(100),
    });

    this.add.text(centreX, 410, "Turn over two tiles. Keep them if they match.\nFind every pair in as few moves as you can.", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    this.add.text(centreX, 510, "Click to start", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.sound.play(CLICK_KEY);
      this.scene.start(GAME_SCENE);
    });
  }
}
