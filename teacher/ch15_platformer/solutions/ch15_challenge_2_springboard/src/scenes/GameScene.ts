import Phaser from "phaser";
import {
  COIN_FILE,
  COIN_FRAME,
  COIN_KEY,
  COIN_SOUND,
  COIN_SOUND_FILE,
  GROUND_FILE,
  GROUND_KEY,
  HERO_FILE,
  HERO_FRAME,
  HERO_KEY,
  JUMP_SOUND,
  JUMP_SOUND_FILE,
  PLATFORM_FILE,
  PLATFORM_KEY,
  SKY_FILE,
  SKY_KEY,
  WIN_SOUND,
  WIN_SOUND_FILE,
} from "../assets.ts";
import { Hero } from "../objects/Hero.ts";

// GameScene - one screen of platforms: collect every coin
//
// The platforms are a STATIC physics group: bodies that never move, and that nothing can push.
// The hero collides with them; the coins only OVERLAP the hero (they are collected, not stood on).

// the centre of each floating platform (each is 200 x 32)
const PLATFORMS = [
  { x: 220, y: 440 },
  { x: 440, y: 350 },
  { x: 700, y: 250 },
  { x: 400, y: 160 },
  { x: 110, y: 250 },
];

// where the coins go: on the ground, and above each platform
const COINS = [
  { x: 300, y: 510 },
  { x: 560, y: 510 },
  { x: 740, y: 510 },
  { x: 180, y: 400 },
  { x: 260, y: 400 },
  { x: 440, y: 310 },
  { x: 700, y: 210 },
  { x: 360, y: 120 },
  { x: 440, y: 120 },
  { x: 110, y: 210 },
];

const COIN_SPIN = "coin-spin"; // the coin's animation

// CHALLENGE 2: the springboard - drawn in code, as there is no picture of one
const SPRING_KEY = "spring";
const SPRING_WIDTH = 48;
const SPRING_HEIGHT = 20;
const SPRING_X = 570; // in the gap between two platforms, so nothing is in the way going up
const SPRING_SPEED = 880; // enough to rise about 430 pixels: from the ground to the top platform

export class GameScene extends Phaser.Scene {
  // fields set in create() are declared with `!`: "this will have a value before it is used"
  private hero!: Hero;
  private scoreText!: Phaser.GameObjects.Text;
  private collected = 0;
  private startTime = 0;
  private finished = false;

  constructor() {
    super("GameScene");
  }

  // the scene is reused when R restarts it (Chapter 2), so the round's numbers are reset here
  init(): void {
    this.collected = 0;
    this.finished = false;
  }

  preload(): void {
    this.load.image(SKY_KEY, SKY_FILE);
    this.load.image(GROUND_KEY, GROUND_FILE);
    this.load.image(PLATFORM_KEY, PLATFORM_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, HERO_FRAME);
    this.load.spritesheet(COIN_KEY, COIN_FILE, COIN_FRAME);
    this.load.audio(JUMP_SOUND, JUMP_SOUND_FILE);
    this.load.audio(COIN_SOUND, COIN_SOUND_FILE);
    this.load.audio(WIN_SOUND, WIN_SOUND_FILE);
  }

  create(): void {
    this.add.image(0, 0, SKY_KEY).setOrigin(0);

    // --- the platforms: a static group. create() makes a sprite AND gives it a static body
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, GROUND_KEY); // the ground strip, 800 x 64, along the bottom
    for (const p of PLATFORMS) {
      platforms.create(p.x, p.y, PLATFORM_KEY);
    }

    // --- the hero, who stands on the platforms
    Hero.createAnimations(this);
    this.hero = new Hero(this, 60, 480);
    this.physics.add.collider(this.hero, platforms);

    this.createSpringboard(); // CHALLENGE 2

    // --- the coins: static too (they never move), spinning, and collected by overlapping
    if (!this.anims.exists(COIN_SPIN)) {
      this.anims.create({
        key: COIN_SPIN,
        frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    const coins = this.physics.add.staticGroup();
    for (const c of COINS) {
      const coin: Phaser.Physics.Arcade.Sprite = coins.create(c.x, c.y, COIN_KEY);
      coin.play(COIN_SPIN);
    }

    // Phaser passes the two objects in the order they were given: hero first, then the coin.
    // Its types cannot know which is which, so the coin is cast with `as`
    this.physics.add.overlap(this.hero, coins, (_hero, coin) => {
      this.collectCoin(coin as Phaser.Physics.Arcade.Sprite);
    });

    this.scoreText = this.add.text(16, 12, "", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#1b1f2a",
      fontStyle: "bold",
    });

    this.input.keyboard!.on("keydown-R", () => {
      this.scene.restart();
    });

    this.startTime = this.time.now;
  }

  override update(time: number): void {
    if (this.finished) {
      return;
    }
    const seconds = (time - this.startTime) / 1000;
    this.scoreText.setText(`Coins: ${this.collected} / ${COINS.length}    Time: ${seconds.toFixed(1)}`);
  }

  // CHALLENGE 2: draw the springboard's picture once, then put one on the ground
  private createSpringboard(): void {
    if (!this.textures.exists(SPRING_KEY)) {
      // make.graphics(..., false) draws off-screen: the Graphics is only used to make a texture
      const g = this.make.graphics({}, false);
      g.fillStyle(0x6c757d);
      g.fillRect(4, 10, SPRING_WIDTH - 8, 6); // the coil, as a grey band
      g.lineStyle(3, 0x495057);
      for (let x = 8; x < SPRING_WIDTH - 8; x += 8) {
        g.lineBetween(x, 8, x + 4, 18);
      }
      g.fillStyle(0xe63946);
      g.fillRoundedRect(0, 0, SPRING_WIDTH, 8, 3); // the red top
      g.fillStyle(0x1d3557);
      g.fillRect(2, SPRING_HEIGHT - 4, SPRING_WIDTH - 4, 4); // the base
      g.generateTexture(SPRING_KEY, SPRING_WIDTH, SPRING_HEIGHT);
      g.destroy();
    }

    // origin (0.5, 1): (x, y) is the bottom middle - here, the top of the ground strip
    const spring = this.physics.add.staticImage(SPRING_X, 536, SPRING_KEY).setOrigin(0.5, 1);
    spring.refreshBody(); // a static body does not follow changes to the image by itself

    this.physics.add.collider(this.hero, spring, () => {
      // only when landing on TOP of it, not walking into its side
      if (this.hero.body.touching.down) {
        this.hero.launch(SPRING_SPEED);
        this.sound.play(JUMP_SOUND, { rate: 0.7 }); // a deeper "boing"
        this.tweens.add({ targets: spring, scaleY: 0.5, duration: 80, yoyo: true });
      }
    });
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
    coin.destroy(); // removes the sprite AND its body, so it cannot be collected twice
    this.collected = this.collected + 1;
    this.sound.play(COIN_SOUND);

    if (this.collected === COINS.length) {
      this.win();
    }
  }

  private win(): void {
    this.finished = true;
    this.sound.play(WIN_SOUND);

    const seconds = (this.time.now - this.startTime) / 1000;
    this.scoreText.setText(`Coins: ${this.collected} / ${COINS.length}    Time: ${seconds.toFixed(1)}`);

    this.add.text(400, 250, `All the coins in ${seconds.toFixed(1)} seconds!\nPress R to play again`, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center",
      stroke: "#1b1f2a",
      strokeThickness: 6,
    }).setOrigin(0.5);
  }
}
