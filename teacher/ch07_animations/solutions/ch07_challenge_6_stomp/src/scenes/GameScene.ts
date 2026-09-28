import Phaser from "phaser";
import { CLOUD_KEY, EXPLODE, EXPLOSION_SHEET, GROUND_KEY, PARTICLE_KEY, SKY_KEY } from "../assets.ts"; // CHALLENGE 6
import { Hero } from "../objects/Hero.ts";
import { Slime } from "../objects/Slime.ts"; // CHALLENGE 6
import { GAME_SCENE } from "./keys.ts";

// GameScene - the hero on a strip of ground, under a sky with drifting clouds
//
// The scene builds the world and hands the arrow keys to the hero; the hero does the rest (see
// Hero.ts). The text at the top shows the hero's state and animation as they change.

const GROUND_Y = 544;                // where the hero's feet rest - in the grass on ground.png
const CLOUD_DRIFT_TIME = 40000;      // milliseconds for a cloud to cross the screen
const CLOUD_START_X = 900;           // just off the right edge...
const CLOUD_END_X = -100;            // ...to just off the left

// CHALLENGE 6: each slime's [start x, left end of patrol, right end, speed]
const SLIMES: [number, number, number, number][] = [
  [120, 60, 300, 70],
  [650, 500, 760, -90],
  [560, 330, 640, 110],
];
const SPARKS = 30;

export class GameScene extends Phaser.Scene {
  private hero!: Hero;
  private info!: Phaser.GameObjects.Text;
  private slimes: Slime[] = [];                                    // CHALLENGE 6: still alive
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;   // CHALLENGE 6
  private slimeText!: Phaser.GameObjects.Text;                     // CHALLENGE 6

  constructor() {
    super(GAME_SCENE);
  }

  // CHALLENGE 6: start with an empty list every time the scene starts
  init(): void {
    this.slimes = [];
  }

  create(): void {
    this.add.image(400, 300, SKY_KEY);
    this.addCloud(250, 110);
    this.addCloud(650, 180);
    this.add.image(400, 600, GROUND_KEY).setOrigin(0.5, 1);

    const cursors = this.input.keyboard!.createCursorKeys();
    this.hero = new Hero(this, 400, GROUND_Y, cursors);

    // CHALLENGE 6: the slimes, and one particle emitter for every squash
    for (const [x, minX, maxX, speed] of SLIMES) {
      this.slimes.push(new Slime(this, x, GROUND_Y, minX, maxX, speed));
    }
    this.sparks = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 60, max: 260 },
      angle: { min: 200, max: 340 },         // upwards, in a fan
      lifespan: { min: 300, max: 700 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x8ee04f, 0x5fb52b, 0xffffff],  // slime green
      gravityY: 500,
      emitting: false,
    });
    this.sparks.setDepth(1);
    this.slimeText = this.add.text(16, 80, "", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#1d3557",
      fontStyle: "bold",
    });
    this.showSlimesLeft();

    this.input.keyboard!.on("keydown-H", () => {
      this.hero.hurt();
    });

    this.info = this.add.text(16, 14, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#1b1f2a",
    });
    this.add.text(784, 14, "LEFT / RIGHT run    UP jump    H hurt", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#1d3557",
    }).setOrigin(1, 0);
  }

  override update(): void {
    const animation = this.hero.anims.currentAnim ? this.hero.anims.currentAnim.key : "";
    this.info.setText(`state: ${this.hero.getHeroState()}\nanimation: ${animation}`);

    this.checkSlimes(); // CHALLENGE 6
  }

  // CHALLENGE 6: touching a slime - from above (falling) squashes it; any other way hurts. The
  // scene asks the hero what it is doing, and tells it what to do; it never changes its fields.
  private checkSlimes(): void {
    const heroBounds = this.hero.getBounds();
    for (const slime of [...this.slimes]) {         // a copy: squash() removes slimes from the list
      if (!Phaser.Geom.Intersects.RectangleToRectangle(heroBounds, slime.getBounds())) {
        continue;
      }
      if (this.hero.isFalling()) {
        this.squash(slime);
        this.hero.bounceOff();
      } else {
        this.hero.hurt(slime.x);                     // does nothing if already hurt
      }
    }
  }

  // CHALLENGE 6: an explosion animation, a burst of particles, and the slime is gone
  private squash(slime: Slime): void {
    this.slimes = this.slimes.filter((s) => s !== slime);
    const centreY = slime.y - slime.displayHeight / 2;

    const boom = this.add.sprite(slime.x, centreY, EXPLOSION_SHEET);
    boom.play(EXPLODE);
    boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      boom.destroy();
    });
    this.sparks.explode(SPARKS, slime.x, centreY);

    slime.destroy();
    this.showSlimesLeft();
  }

  private showSlimesLeft(): void {
    this.slimeText.setText(this.slimes.length === 0 ? "All squashed!" : `Slimes left: ${this.slimes.length}`);
  }

  // a cloud that drifts from off the right edge to off the left, for ever. A TWEEN changes a value
  // smoothly over time - here, x - and is explained later in the chapter.
  private addCloud(x: number, y: number): void {
    const cloud = this.add.image(x, y, CLOUD_KEY);
    const tween = this.tweens.add({
      targets: cloud,
      x: { from: CLOUD_START_X, to: CLOUD_END_X },
      duration: CLOUD_DRIFT_TIME,
      repeat: -1,
    });
    // skip the tween forward to where x is now, so the cloud starts at x rather than off screen
    tween.seek(((CLOUD_START_X - x) / (CLOUD_START_X - CLOUD_END_X)) * CLOUD_DRIFT_TIME);
  }
}
