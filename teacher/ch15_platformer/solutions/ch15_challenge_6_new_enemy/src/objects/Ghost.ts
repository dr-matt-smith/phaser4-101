import Phaser from "phaser";
import { GHOST_KEY } from "../assets.ts";
import type { Enemy } from "./Enemy.ts";

// Ghost - CHALLENGE 6: a new enemy. It drifts slowly towards the hero, straight through walls,
// once the hero comes near - and it cannot be stomped: landing on a ghost hurts.

const SPEED = 45; // pixels per second - much slower than the hero, so it can be outrun
const NOTICE_DISTANCE = 450; // how close the hero must be before the ghost gives chase
const BOB = "ghost-bob";

export class Ghost extends Phaser.Physics.Arcade.Sprite implements Enemy {
  declare body: Phaser.Physics.Arcade.Body;

  private target: Phaser.GameObjects.Components.Transform;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Components.Transform) {
    super(scene, x, y, GHOST_KEY, 0);
    this.target = target;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(22, 24);
    this.setAlpha(0.8); // a little see-through
    this.play(BOB);
  }

  public static createAnimations(scene: Phaser.Scene): void {
    scene.anims.create({
      key: BOB,
      frames: scene.anims.generateFrameNumbers(GHOST_KEY, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });
  }

  public canBeStomped(): boolean {
    return false;
  }

  public isSquashed(): boolean {
    return false;
  }

  // the Enemy interface asks for this, but a ghost cannot be squashed - and as canBeStomped()
  // is false, the scene never calls it
  public squash(): void {}

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const distance = Phaser.Math.Distance.BetweenPoints(this, this.target);
    if (distance < NOTICE_DISTANCE) {
      // aim at the hero's middle, not its feet (its origin is at the feet)
      this.scene.physics.moveTo(this, this.target.x, this.target.y - 24, SPEED);
    } else {
      this.setVelocity(0, 0);
    }
    this.setFlipX(this.body.velocity.x > 0);
  }
}
