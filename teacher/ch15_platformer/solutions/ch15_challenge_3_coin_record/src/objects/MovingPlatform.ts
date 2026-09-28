import Phaser from "phaser";
import { PLATFORM_KEY } from "../assets.ts";

// MovingPlatform - a one-way platform: the hero can jump up through it from below, and land on
// top. Give it a move (moveX, moveY) and it goes there and back for ever, carrying the hero.
//
// It moves by VELOCITY, so the physics engine moves it - and because the engine knows exactly
// how far it went each step, it moves anything standing on it by the same amount. (A tween
// could slide it about too, with body.setDirectControl(true) so the engine works out a speed
// from the tween's movement; but that is only as exact as the frame rate. Velocity is exact.)

export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  private start: Phaser.Math.Vector2;
  private end: Phaser.Math.Vector2;
  private length: number; // from start to end, in pixels
  private velocity: Phaser.Math.Vector2; // on the way out; the way back is the opposite
  private outward = true;

  // (x, y) is the top-left corner, as Tiled gives it for a rectangle. `duration` is the time
  // in ms for one trip from start to end
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    moveX: number,
    moveY: number,
    duration: number,
  ) {
    super(scene, x, y, PLATFORM_KEY);
    this.setOrigin(0, 0);
    this.setDisplaySize(width, this.height); // stretch the 200-wide picture to the rectangle

    scene.add.existing(this);
    scene.physics.add.existing(this); // after setDisplaySize, so the body is the new size

    this.body.setAllowGravity(false);
    this.body.setImmovable(true); // the hero cannot push it about

    // one-way: only the TOP collides. Jump up through it from underneath, or walk through
    // its ends; land on it from above
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

    this.start = new Phaser.Math.Vector2(x, y);
    this.end = new Phaser.Math.Vector2(x + moveX, y + moveY);
    this.length = this.start.distance(this.end);
    const seconds = duration / 1000;
    this.velocity = seconds > 0 ? new Phaser.Math.Vector2(moveX / seconds, moveY / seconds) : new Phaser.Math.Vector2();
    this.setVelocity(this.velocity.x, this.velocity.y);
  }

  // called every frame (Phaser calls preUpdate on anything added with add.existing that has one)
  protected preUpdate(): void {
    if (this.length === 0) {
      return; // a platform that stays still
    }
    // turn round at each end. Comparing distances from the two FIXED ends means small
    // overshoots never add up, however long the game runs
    if (this.outward && this.start.distance(this) >= this.length) {
      this.outward = false;
      this.setVelocity(-this.velocity.x, -this.velocity.y);
    } else if (!this.outward && this.end.distance(this) >= this.length) {
      this.outward = true;
      this.setVelocity(this.velocity.x, this.velocity.y);
    }
  }
}
