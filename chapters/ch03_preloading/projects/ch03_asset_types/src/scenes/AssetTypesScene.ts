import Phaser from "phaser";
import {
  BUTTON_FILE,
  BUTTON_KEY,
  COIN_KEY,
  COIN_SPIN_FILE,
  COIN_SPIN_KEY,
  CRATE_FILE,
  CRATE_KEY,
  GEM_FILE,
  GEM_KEY,
  HEART_KEY,
  HERO_FILE,
  HERO_KEY,
  ITEMS_KEY,
  LEVEL_FILE,
  LEVEL_KEY,
  MISSING_FILE,
  MISSING_KEY,
  NOTES_FILE,
  NOTES_KEY,
  PACK_FILE,
  PACK_KEY,
  PACK_SECTION,
  PLAYER_FILE,
  PLAYER_KEY,
  POP_FILE,
  POP_KEY,
  STAR_KEY,
  WIN_FILE,
  WIN_KEY,
} from "../assets.ts";
import type { LevelData } from "../LevelData.ts";

// AssetTypesScene - loads one file of each kind, and shows each one in a panel of its own
//
//   image  |  spritesheet  |  audio
//   json   |  text         |  asset pack
//
// Every file is queued in preload(). By the time create() runs, each is in its CACHE: pictures in
// the texture manager (this.textures), sounds in this.cache.audio, JSON in this.cache.json, text
// in this.cache.text. The scene reads them back from there by key.

const PANEL_WIDTH = 250;
const PANEL_GAP = 12;
const TOP_ROW_Y = 50;
const TOP_ROW_HEIGHT = 260;
const BOTTOM_ROW_Y = 322;
const BOTTOM_ROW_HEIGHT = 240;
const PANEL_COLOUR = 0x262c3b;
const HERO_FRAME_TIME = 250;    // ms each frame of the hero sheet is shown for

const TITLE_STYLE = { fontFamily: "Arial", fontSize: "20px", color: "#ffd166", fontStyle: "bold" };
const SMALL_STYLE = { fontFamily: "Arial", fontSize: "15px", color: "#e8ecf5" };

export class AssetTypesScene extends Phaser.Scene {
  // set in create(); the ! tells TypeScript "trust me, this will have a value before it is used"
  private hero!: Phaser.GameObjects.Image;
  private heroText!: Phaser.GameObjects.Text;
  private heroFrames = 0;
  private failed: string[] = [];

  constructor() {
    super("AssetTypesScene");
  }

  init(): void {
    this.failed = [];
  }

  preload(): void {
    // "loaderror" fires once for each file that could not be loaded
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      this.failed.push(`${file.key} (${file.src})`);
    });

    // an image: one picture
    this.load.image(CRATE_KEY, CRATE_FILE);
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.image(PLAYER_KEY, PLAYER_FILE);
    this.load.image(MISSING_KEY, MISSING_FILE);

    // a sprite sheet: one picture, cut into frames of the size given
    this.load.spritesheet(HERO_KEY, HERO_FILE, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet(COIN_SPIN_KEY, COIN_SPIN_FILE, { frameWidth: 32, frameHeight: 32 });

    // audio: a sound
    this.load.audio(POP_KEY, POP_FILE);
    this.load.audio(WIN_KEY, WIN_FILE);

    // json: data - here, where things go in a level
    this.load.json(LEVEL_KEY, LEVEL_FILE);

    // text: any plain text file, as one string
    this.load.text(NOTES_KEY, NOTES_FILE);

    // a pack: a JSON file that is a LIST of files to load. Phaser loads the pack, then queues
    // everything in the section named, and loads those too
    this.load.pack(PACK_KEY, PACK_FILE, PACK_SECTION);
  }

  create(): void {
    const left = PANEL_GAP;
    const middle = left + PANEL_WIDTH + PANEL_GAP;
    const right = middle + PANEL_WIDTH + PANEL_GAP;

    this.add.text(this.scale.width / 2, 24, "One of each kind of file", TITLE_STYLE).setOrigin(0.5);

    this.showImages(left, TOP_ROW_Y);
    this.showSpriteSheet(middle, TOP_ROW_Y);
    this.showAudio(right, TOP_ROW_Y);
    this.showJson(left, BOTTOM_ROW_Y);
    this.showText(middle, BOTTOM_ROW_Y);
    this.showPack(right, BOTTOM_ROW_Y);
    this.showStatus();
  }

  // step through the hero's frames, one every HERO_FRAME_TIME ms (Chapter 7 does this properly,
  // with animations)
  override update(time: number, _delta: number): void {
    const frame = Math.floor(time / HERO_FRAME_TIME) % this.heroFrames;
    this.hero.setFrame(frame);
    this.heroText.setText(`frame ${frame} of 0 - ${this.heroFrames - 1}`);
  }

  // a dark box with a title at the top
  private panel(x: number, y: number, height: number, title: string): void {
    const box = this.add.graphics();
    box.fillStyle(PANEL_COLOUR);
    box.fillRoundedRect(x, y, PANEL_WIDTH, height, 8);
    this.add.text(x + 10, y + 8, title, TITLE_STYLE);
  }

  private showImages(x: number, y: number): void {
    this.panel(x, y, TOP_ROW_HEIGHT, "image");

    this.add.image(x + 70, y + 120, CRATE_KEY).setScale(2);
    this.add.text(x + 70, y + 190, "crate.png", SMALL_STYLE).setOrigin(0.5);

    // missing.png failed to load, so "missing" is not in the texture manager. Phaser draws its
    // stand-in "missing texture" instead, and carries on
    this.add.image(x + 180, y + 120, MISSING_KEY).setScale(2);
    this.add.text(x + 180, y + 190, "missing.png\n(failed to load)", { ...SMALL_STYLE, align: "center" })
      .setOrigin(0.5, 0.25);
  }

  private showSpriteSheet(x: number, y: number): void {
    this.panel(x, y, TOP_ROW_HEIGHT, "spritesheet");

    // frameTotal counts every frame, plus one extra, "__BASE" - the whole picture
    this.heroFrames = this.textures.get(HERO_KEY).frameTotal - 1;

    // the fourth argument to add.image is the frame to show
    this.hero = this.add.image(x + 70, y + 110, HERO_KEY, 0).setScale(3);
    this.heroText = this.add.text(x + 130, y + 100, "", SMALL_STYLE);

    // every frame of the coin sheet, side by side, with its number
    const coinFrames = this.textures.get(COIN_SPIN_KEY).frameTotal - 1;
    for (let frame = 0; frame < coinFrames; frame++) {
      const frameX = x + 25 + frame * 40;
      this.add.image(frameX, y + 215, COIN_SPIN_KEY, frame);
      this.add.text(frameX, y + 240, `${frame}`, SMALL_STYLE).setOrigin(0.5);
    }
  }

  private showAudio(x: number, y: number): void {
    this.panel(x, y, TOP_ROW_HEIGHT, "audio");
    this.addSoundButton(x + PANEL_WIDTH / 2, y + 90, POP_KEY);
    this.addSoundButton(x + PANEL_WIDTH / 2, y + 180, WIN_KEY);
  }

  // a button that plays a sound, labelled with the sound's key and length
  private addSoundButton(x: number, y: number, key: string): void {
    // with Web Audio (every modern browser), the audio cache holds a decoded AudioBuffer
    const buffer: AudioBuffer = this.cache.audio.get(key);

    const button = this.add.image(x, y, BUTTON_KEY);
    button.setInteractive({ useHandCursor: true });
    button.on("pointerdown", () => {
      this.sound.play(key);
    });

    this.add.text(x, y, `play "${key}"  (${buffer.duration.toFixed(2)} s)`, {
      ...SMALL_STYLE,
      fontSize: "18px",
      color: "#1b1f2a",
    }).setOrigin(0.5);
  }

  private showJson(x: number, y: number): void {
    this.panel(x, y, BOTTOM_ROW_HEIGHT, "json");

    // cache.json.get gives back whatever the file held - TypeScript cannot know what that is, so
    // we say what we expect: a LevelData (see LevelData.ts)
    const level: LevelData = this.cache.json.get(LEVEL_KEY);

    this.add.text(x + 10, y + 34, `"${level.name}" - ${level.gems.length} gems`, SMALL_STYLE);

    // the positions in the file are inside the panel, below its title
    const originX = x;
    const originY = y + 50;

    this.add.image(originX + level.player.x, originY + level.player.y, PLAYER_KEY).setScale(0.75);
    level.gems.forEach((gem) => {
      this.add.image(originX + gem.x, originY + gem.y, GEM_KEY);
    });
  }

  private showText(x: number, y: number): void {
    this.panel(x, y, BOTTOM_ROW_HEIGHT, "text");

    const notes: string = this.cache.text.get(NOTES_KEY);
    this.add.text(x + 10, y + 40, notes, {
      ...SMALL_STYLE,
      wordWrap: { width: PANEL_WIDTH - 20 },
    });
  }

  private showPack(x: number, y: number): void {
    this.panel(x, y, BOTTOM_ROW_HEIGHT, "asset pack");

    this.add.text(x + 10, y + 34, "pack.json listed these files:", SMALL_STYLE);

    const keys = [HEART_KEY, COIN_KEY, STAR_KEY];
    keys.forEach((key, index) => {
      const keyX = x + 50 + index * 75;
      this.add.image(keyX, y + 90, key);
      this.add.text(keyX, y + 120, key, SMALL_STYLE).setOrigin(0.5);
    });

    // the pack's sprite sheet: eight frames of items
    for (let frame = 0; frame < 8; frame++) {
      this.add.image(x + 22 + frame * 30, y + 175, ITEMS_KEY, frame).setScale(0.85);
    }
    this.add.text(x + PANEL_WIDTH / 2, y + 205, ITEMS_KEY, SMALL_STYLE).setOrigin(0.5);
  }

  // what loaded and what did not, along the bottom
  private showStatus(): void {
    const loaded = this.load.totalComplete;
    let message = `${loaded} files loaded.`;
    if (this.failed.length > 0) {
      message = message + `  Failed: ${this.failed.join(", ")}`;
    }
    this.add.text(this.scale.width / 2, 582, message, { ...SMALL_STYLE, color: "#f4a261" }).setOrigin(0.5);
  }
}
