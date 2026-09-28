import Phaser from "phaser";
import {
  BAT_FLAP,
  BAT_SHEET,
  COIN_SHEET,
  COIN_SPIN,
  EXPLODE,
  EXPLOSION_SHEET,
  GHOST_BOB,
  GHOST_SHEET,
  HERO_FALL,
  HERO_HURT,
  HERO_IDLE,
  HERO_JUMP,
  HERO_RUN,
  HERO_SHEET,
  SLIME_SHEET,
  SLIME_SQUASH,
} from "../assets.ts";
import { LAB_SCENE } from "./keys.ts";

// LabScene - a place to try out Phaser's animation controls, and watch what they do
//
// Along the top: one sprite from every sheet, each playing its looping animation. On the left: a
// big hero that the keys control. On the right: what the hero's animation state says, and a log
// of the animation EVENTS it sends. Along the bottom: every frame of the hero's sheet, with the
// one being shown picked out.

const HERO_SCALE = 4;
const SHEET_SCALE = 1.5;
const HERO_FRAMES = 11;          // frames 0-10 in hero.png
const LOG_LINES = 7;
const MIN_TIME_SCALE = 0.25;
const MAX_TIME_SCALE = 4;

const TEXT_STYLE = { fontFamily: "Arial", fontSize: "14px", color: "#a8dadc", align: "center" };
const MONO_STYLE = { fontFamily: "Courier New, monospace", fontSize: "17px", color: "#ffffff" };

export class LabScene extends Phaser.Scene {
  // fields set in create() are declared with "!": "this will have a value before it is used"
  private hero!: Phaser.GameObjects.Sprite;
  private statusText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private frameMarker!: Phaser.GameObjects.Rectangle;
  private frameImages: Phaser.GameObjects.Image[] = [];
  private log: string[] = [];

  constructor() {
    super(LAB_SCENE);
  }

  create(): void {
    this.frameImages = [];
    this.log = [];

    this.add.text(400, 18, "Animation Lab", { ...TEXT_STYLE, fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);

    this.addShowcase();
    this.addPanel();           // before addHero(): the hero's first event goes in the panel's log
    this.addHero();
    this.addFrameStrip();
    this.addKeys();

    this.add.text(
      400,
      584,
      "1 idle  2 run  3 run (keep going)  4 jump  5 fall  6 hurt  C chain  A idle after repeat  " +
        "S stop  P pause  F flip  UP/DOWN speed",
      { ...TEXT_STYLE, fontSize: "13px", color: "#9aa4bd" },
    ).setOrigin(0.5);
  }

  // every frame: show what the hero's animation state says right now
  override update(): void {
    const anims = this.hero.anims;
    const name = anims.currentAnim ? anims.currentAnim.key : "(none)";
    const frame = anims.currentFrame ? anims.currentFrame.textureFrame : this.hero.frame.name;

    this.statusText.setText([
      `currentAnim.key  ${name}`,
      `frame shown      ${frame}`,
      `isPlaying        ${anims.isPlaying}`,
      `isPaused         ${anims.isPaused}`,
      `timeScale        ${anims.timeScale}`,
      `flipX            ${this.hero.flipX}`,
    ]);

    // move the marker to the frame the hero is showing
    const index = Number(frame);
    if (index >= 0 && index < this.frameImages.length) {
      this.frameMarker.x = this.frameImages[index].x;
    }
  }

  // one sprite from every sheet, each playing its looping animation
  private addShowcase(): void {
    const items: [string, string, string][] = [
      [COIN_SHEET, COIN_SPIN, "coin-spin\n10 fps, loop"],
      [SLIME_SHEET, SLIME_SQUASH, "slime-squash\n6 fps, yoyo"],
      [BAT_SHEET, BAT_FLAP, "bat-flap\n12 fps, loop"],
      [GHOST_SHEET, GHOST_BOB, "ghost-bob\n5 fps, yoyo"],
      [EXPLOSION_SHEET, EXPLODE, "explode\n16 fps, 0.8 s gap"],
    ];

    items.forEach(([sheet, anim, label], i) => {
      const x = 100 + i * 150;
      // a Sprite, not an Image: only a Sprite can play an animation
      const sprite = this.add.sprite(x, 72, sheet);
      if (sheet !== EXPLOSION_SHEET) {
        sprite.setScale(2);
      }
      sprite.play(anim);
      this.add.text(x, 112, label, TEXT_STYLE).setOrigin(0.5, 0);
    });
  }

  // the big hero, and a log of every animation event it sends
  private addHero(): void {
    this.hero = this.add.sprite(170, 320, HERO_SHEET, 0).setScale(HERO_SCALE);

    this.add.text(170, 425, "the hero - press the keys below", TEXT_STYLE).setOrigin(0.5, 0);

    // a sprite sends these events as its animation starts, repeats, finishes or is stopped.
    // Every listener is given the animation, the frame, the sprite and the frame's key.
    const events = [
      Phaser.Animations.Events.ANIMATION_START,
      Phaser.Animations.Events.ANIMATION_REPEAT,
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      Phaser.Animations.Events.ANIMATION_STOP,
      Phaser.Animations.Events.ANIMATION_RESTART,
    ];
    for (const eventName of events) {
      this.hero.on(eventName, (animation: Phaser.Animations.Animation) => {
        this.addToLog(`${eventName.padEnd(18)} ${animation.key}`);
      });
    }

    // ANIMATION_COMPLETE_KEY + a key: an event just for when THAT animation completes
    this.hero.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + HERO_HURT, () => {
      this.addToLog("  (hurt is over)");
    });

    // started after the listeners are added, so the log sees it start
    this.hero.play(HERO_IDLE);
  }

  // every frame of hero.png, as Images - an Image shows one frame; it cannot animate
  private addFrameStrip(): void {
    const left = 400 - ((HERO_FRAMES - 1) * 64) / 2;
    this.frameMarker = this.add.rectangle(left, 505, 56, 84).setStrokeStyle(3, 0xffd166);

    for (let frame = 0; frame < HERO_FRAMES; frame++) {
      const x = left + frame * 64;
      this.frameImages.push(this.add.image(x, 505, HERO_SHEET, frame).setScale(SHEET_SCALE));
      this.add.text(x, 551, String(frame), { ...TEXT_STYLE, color: "#ffffff" }).setOrigin(0.5, 0);
    }
  }

  private addPanel(): void {
    this.add.rectangle(560, 305, 450, 290, 0x262c3b);
    this.statusText = this.add.text(350, 172, "", MONO_STYLE);
    this.add.text(350, 300, "events", { ...MONO_STYLE, color: "#ffd166" });
    this.logText = this.add.text(350, 322, "", { ...MONO_STYLE, fontSize: "15px", color: "#a8dadc" });
  }

  private addKeys(): void {
    const keyboard = this.input.keyboard!;

    keyboard.on("keydown-ONE", () => this.hero.play(HERO_IDLE));
    // play() starts the animation again from its first frame - even if it is already playing
    keyboard.on("keydown-TWO", () => this.hero.play(HERO_RUN));
    // play(key, true): "ignore this if that animation is already playing"
    keyboard.on("keydown-THREE", () => this.hero.play(HERO_RUN, true));
    keyboard.on("keydown-FOUR", () => this.hero.play(HERO_JUMP));
    keyboard.on("keydown-FIVE", () => this.hero.play(HERO_FALL));
    keyboard.on("keydown-SIX", () => this.hero.play(HERO_HURT));

    // chain: queue up what plays when this one completes (or is stopped)
    keyboard.on("keydown-C", () => {
      this.hero.play(HERO_HURT);
      this.hero.chain(HERO_IDLE);
    });

    // playAfterRepeat: let the current loop finish, THEN change - no jump in the middle of a stride
    keyboard.on("keydown-A", () => this.hero.anims.playAfterRepeat(HERO_IDLE));

    keyboard.on("keydown-S", () => this.hero.stop());

    keyboard.on("keydown-P", () => {
      if (this.hero.anims.isPaused) {
        this.hero.anims.resume();
      } else {
        this.hero.anims.pause();
      }
    });

    // setFlipX mirrors the picture - one set of frames facing right does for both directions
    keyboard.on("keydown-F", () => this.hero.setFlipX(!this.hero.flipX));

    // timeScale speeds up (2) or slows down (0.5) this sprite's animation, without changing it
    keyboard.on("keydown-UP", () => {
      this.hero.anims.timeScale = Math.min(this.hero.anims.timeScale * 2, MAX_TIME_SCALE);
    });
    keyboard.on("keydown-DOWN", () => {
      this.hero.anims.timeScale = Math.max(this.hero.anims.timeScale / 2, MIN_TIME_SCALE);
    });
  }

  private addToLog(line: string): void {
    const seconds = (this.time.now / 1000).toFixed(1).padStart(5);
    this.log.push(`${seconds}s ${line}`);
    if (this.log.length > LOG_LINES) {
      this.log.shift();
    }
    this.logText.setText(this.log);
  }
}
