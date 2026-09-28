import Phaser from "phaser";
import {
  ACTION_MUSIC_KEY,
  ARENA_KEY,
  CLICK_SOUND_KEY,
  COIN_KEY,
  COIN_SOUND_KEY,
  COIN_SPIN_KEY,
  CRATE_KEY,
  ENEMY_KEY,
  EXPLOSION_KEY,
  GAME_MUSIC_KEY,
  GEM_KEY,
  HEART_KEY,
  HERO_KEY,
  LOGO_KEY,
  MENU_MUSIC_KEY,
  PLAYER_KEY,
  ROCK_KEY,
  SKY_KEY,
  SPACE_KEY,
  STAR_KEY,
  TABLE_KEY,
} from "../assets.ts";
import { MENU_SCENE, PRELOAD_SCENE } from "./keys.ts";
import type { MenuData } from "./MenuScene.ts";

// PreloadScene - the loading screen
//
// preload() does three things, in this order:
//   1. draws the loading screen (the logo was loaded by BootScene, so it can be shown already)
//   2. listens to the LOADER's events, to move the bar and show which file is loading
//   3. queues every file the game needs
// Phaser then loads the queue, firing the events as it goes, and calls create() when it is done.

const BAR_WIDTH = 400;
const BAR_HEIGHT = 24;
const BAR_Y = 360;
const BAR_COLOUR = 0xffd166;
const BOX_COLOUR = 0x2b3245;
const BOX_PADDING = 6;          // the gap between the box and the bar inside it
const FINISHED_PAUSE = 500;     // ms to leave the full bar on screen before the menu starts

// Files on your own computer load far too quickly to see a progress bar. So that you can watch it
// work, the game also loads COPIES extra copies of some small pictures, each under its own key.
// A real game would not do this - set it to 0 and the loading screen is gone in a blink.
const COPIES = 150;
const COPY_FILES = ["star.png", "coin.png", "gem.png", "heart.png"];

export class PreloadScene extends Phaser.Scene {
  private startTime = 0;

  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    // performance.now() is the browser's clock, in milliseconds. (The scene's clock, this.time.now,
    // is brought up to date at the start of each frame the scene runs - and preload() comes
    // before this scene's first frame, so here it can be out of date.)
    this.startTime = performance.now();

    const centreX = this.scale.width / 2;
    const barX = centreX - BAR_WIDTH / 2;

    // 1. the loading screen: logo, box, bar, and two lines of text
    this.add.image(centreX, 170, LOGO_KEY);

    this.add.text(centreX, 310, "Loading...", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // the box is drawn once; the bar is redrawn every time the progress changes
    const box = this.add.graphics();
    box.fillStyle(BOX_COLOUR);
    box.fillRect(barX - BOX_PADDING, BAR_Y - BOX_PADDING, BAR_WIDTH + BOX_PADDING * 2, BAR_HEIGHT + BOX_PADDING * 2);

    const bar = this.add.graphics();

    // CHALLENGE 2: the percentage, in the middle of the bar. Made AFTER the bar, so it is drawn
    // on top of it
    const percentText = this.add.text(centreX, BAR_Y + BAR_HEIGHT / 2, "0%", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      stroke: "#1b1f2a",
      strokeThickness: 4,
    }).setOrigin(0.5);

    const fileText = this.add.text(centreX, 420, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    // 2. the loader's events
    // "progress": the whole queue - value goes from 0 (nothing loaded) to 1 (everything loaded)
    this.load.on("progress", (value: number) => {
      bar.clear();
      bar.fillStyle(BAR_COLOUR);
      bar.fillRect(barX, BAR_Y, BAR_WIDTH * value, BAR_HEIGHT);

      // CHALLENGE 2: value is 0 to 1; floor, so it only says 100% when it really is finished
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // "fileprogress": one file is on its way - Phaser passes the File, which knows its key and URL
    this.load.on("fileprogress", (file: Phaser.Loader.File) => {
      fileText.setText(`Loading ${file.src}`);
    });

    // "complete": the queue is empty - every file has loaded (or failed)
    this.load.on("complete", () => {
      fileText.setText("All done!");
    });

    // 3. the queue
    this.queueFiles();
  }

  // Everything below is only ADDED TO THE QUEUE here. Nothing loads until preload() has finished,
  // when Phaser starts the loader for you.
  private queueFiles(): void {
    // setPath() is put in front of every file name that follows, until it is changed again
    this.load.setPath("assets/images/");
    this.load.image(SKY_KEY, "sky.png");
    this.load.image(SPACE_KEY, "space.png");
    this.load.image(TABLE_KEY, "table.png");
    this.load.image(ARENA_KEY, "arena.png");
    this.load.image(STAR_KEY, "star.png");
    this.load.image(COIN_KEY, "coin.png");
    this.load.image(GEM_KEY, "gem.png");
    this.load.image(HEART_KEY, "heart.png");
    this.load.image(PLAYER_KEY, "player.png");
    this.load.image(ENEMY_KEY, "enemy.png");
    this.load.image(CRATE_KEY, "crate.png");
    this.load.image(ROCK_KEY, "rock.png");

    // a sprite sheet is one picture cut into equal frames - Phaser needs the size of a frame
    this.load.setPath("assets/spritesheets/");
    this.load.spritesheet(HERO_KEY, "hero.png", { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet(COIN_SPIN_KEY, "coin_spin.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet(EXPLOSION_KEY, "explosion.png", { frameWidth: 64, frameHeight: 64 });

    this.load.setPath("assets/audio/");
    this.load.audio(COIN_SOUND_KEY, "coin.wav");
    this.load.audio(CLICK_SOUND_KEY, "click.wav");
    this.load.audio(MENU_MUSIC_KEY, "music_menu.wav");
    this.load.audio(GAME_MUSIC_KEY, "music_game.wav");
    this.load.audio(ACTION_MUSIC_KEY, "music_action.wav");

    // the extra copies, only there to slow loading down (see COPIES at the top)
    this.load.setPath("assets/images/");
    for (let i = 0; i < COPIES; i++) {
      const file = COPY_FILES[i % COPY_FILES.length];
      this.load.image(`copy_${i}`, file);
    }

    // back to no path, so a later load in this scene is not caught out by it
    this.load.setPath("");
  }

  // create() runs once the loader's queue is empty
  create(): void {
    const data: MenuData = {
      files: this.load.totalComplete,
      seconds: (performance.now() - this.startTime) / 1000,
    };

    // leave the full bar up for a moment, so the player sees it finish
    this.time.delayedCall(FINISHED_PAUSE, () => {
      this.scene.start(MENU_SCENE, data);
    });
  }
}
