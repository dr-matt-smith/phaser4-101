import Phaser from "phaser";
import { BAT_KEY } from "../assets.ts";
import type { Enemy } from "./Enemy.ts";

// Bat - hangs in the air, bobbing, until the hero passes underneath; then it SWOOPS at the
// place the hero was, and flies back home. Bats fly through walls and ignore gravity.
//
// Another small state machine: "hover" -> "swoop" -> "return" -> "hover" ...

const SIGHT_ACROSS = 200; // how far to either side the bat can see (pixels)
const SIGHT_DOWN = 320; // and how far below it
const SWOOP_SPEED = 260; // pixels per second
const SWOOP_TIME = 900; // ms of swooping before it gives up and goes home
const RETURN_SPEED = 120;
const REST_TIME = 1500; // ms at home before it can swoop again
const BOB_SPEED = 30; // up-and-down speed while hovering
const FLAP = "bat-flap";

type BatState = "hover" | "swoop" | "return";

export class Bat extends Phaser.Physics.Arcade.Sprite implements Enemy {
  declare body: Phaser.Physics.Arcade.Body;

  private batState: BatState = "hover";
  private home: Phaser.Math.Vector2;
  private target: Phaser.GameObjects.Components.Transform;
  private stateEnds = 0; // when the swoop ends, or the rest at home ends (ms)
  private squashed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Components.Transform) {
    super(scene, x, y, BAT_KEY, 0);
    this.home = new Phaser.Math.Vector2(x, y);
    this.target = target;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(24, 16);
    this.play(FLAP);
  }

  public static createAnimations(scene: Phaser.Scene): void {
    scene.anims.create({
      key: FLAP,
      frames: scene.anims.generateFrameNumbers(BAT_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  // CHALLENGE 6: every enemy must now say whether it can be stomped
  public canBeStomped(): boolean {
    return true;
  }

  public isSquashed(): boolean {
    return this.squashed;
  }

  // a stomped bat drops out of the sky, spinning
  public squash(): void {
    this.squashed = true;
    this.body.enable = false;
    this.stop();
    this.scene.tweens.add({
      targets: this,
      y: this.y + 200,
      angle: 360,
      alpha: 0,
      duration: 600,
      onComplete: () => this.destroy(),
    });
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.squashed) {
      return;
    }

    if (this.batState === "hover") {
      this.setVelocity(0, Math.cos(time / 250) * BOB_SPEED);
      if (time > this.stateEnds && this.canSeeTarget()) {
        // aim at where the hero is NOW - if the hero keeps moving, the bat misses
        this.batState = "swoop";
        this.stateEnds = time + SWOOP_TIME;
        this.scene.physics.moveToObject(this, this.target, SWOOP_SPEED);
      }
    } else if (this.batState === "swoop") {
      if (time > this.stateEnds) {
        this.batState = "return";
        this.scene.physics.moveTo(this, this.home.x, this.home.y, RETURN_SPEED);
      }
    } else if (Phaser.Math.Distance.BetweenPoints(this, this.home) < 4) {
      // home again: rest before the next swoop
      this.batState = "hover";
      this.setPosition(this.home.x, this.home.y);
      this.stateEnds = time + REST_TIME;
    }

    this.setFlipX(this.body.velocity.x > 0);
  }

  private canSeeTarget(): boolean {
    const across = Math.abs(this.target.x - this.x);
    const down = this.target.y - this.y;
    return across < SIGHT_ACROSS && down > 0 && down < SIGHT_DOWN;
  }
}
