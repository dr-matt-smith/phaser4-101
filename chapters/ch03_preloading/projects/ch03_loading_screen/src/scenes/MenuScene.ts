import Phaser from "phaser";
import {
  COIN_KEY,
  COIN_SOUND_KEY,
  COIN_SPIN_KEY,
  CRATE_KEY,
  ENEMY_KEY,
  EXPLOSION_KEY,
  GEM_KEY,
  HEART_KEY,
  HERO_KEY,
  LOGO_KEY,
  PLAYER_KEY,
  ROCK_KEY,
  SKY_KEY,
  STAR_KEY,
} from "../assets.ts";
import { BOOT_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - where the game would begin
//
// It has no preload(): everything it shows was loaded by PreloadScene. Loaded files belong to the
// whole game, not to the scene that loaded them.

// what the loading screen tells the menu
export interface MenuData {
  files: number;      // how many files were loaded
  seconds: number;    // and how long it took
}

// a picture to show, and (for a sprite sheet) which frame of it
interface Shown {
  key: string;
  frame: number;
}

const SHOW: Shown[] = [
  { key: STAR_KEY, frame: 0 },
  { key: COIN_KEY, frame: 0 },
  { key: GEM_KEY, frame: 0 },
  { key: HEART_KEY, frame: 0 },
  { key: PLAYER_KEY, frame: 0 },
  { key: ENEMY_KEY, frame: 0 },
  { key: CRATE_KEY, frame: 0 },
  { key: ROCK_KEY, frame: 0 },
  { key: HERO_KEY, frame: 2 },
  { key: COIN_SPIN_KEY, frame: 1 },
  { key: EXPLOSION_KEY, frame: 2 },
];
const SHOW_SPACING = 64;

export class MenuScene extends Phaser.Scene {
  private result!: MenuData;    // the ! promises TypeScript that init() sets it before it is used

  constructor() {
    super(MENU_SCENE);
  }

  init(data: MenuData): void {
    this.result = data;
  }

  create(): void {
    const centreX = this.scale.width / 2;

    // setOrigin(0) puts the picture's top-left corner at (0, 0)
    this.add.image(0, 0, SKY_KEY).setOrigin(0);
    this.add.image(centreX, 110, LOGO_KEY);

    // a few of the loaded pictures, in a row. The third argument to add.image is the FRAME -
    // which part of a sprite sheet to show (plain pictures only have frame 0)
    const firstX = centreX - (SHOW.length - 1) * SHOW_SPACING / 2;
    SHOW.forEach((shown, index) => {
      this.add.image(firstX + index * SHOW_SPACING, 250, shown.key, shown.frame);
    });

    const style = {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#1b1f2a",
      align: "center",
    };

    // this.textures is the game's TEXTURE MANAGER: every picture loaded so far, by key. (Counted
    // before this scene makes any text: each Text object keeps a texture of its own in there too.)
    const textureCount = this.textures.getTextureKeys().length;

    this.add.text(
      centreX,
      360,
      `Loaded ${this.result.files} files in ${this.result.seconds.toFixed(2)} seconds\n` +
        `Pictures in the texture manager: ${textureCount}`,
      style,
    ).setOrigin(0.5);

    this.add.text(centreX, 470, "SPACE - play a sound (it was loaded too)\nR - run the loading screen again", {
      ...style,
      fontSize: "22px",
      color: "#1d3557",
    }).setOrigin(0.5);

    this.input.keyboard!.on("keydown-SPACE", () => {
      this.sound.play(COIN_SOUND_KEY);
    });

    // back to the very start. This time every key is already loaded, so the loader skips them all
    this.input.keyboard!.once("keydown-R", () => {
      this.scene.start(BOOT_SCENE);
    });
  }
}
