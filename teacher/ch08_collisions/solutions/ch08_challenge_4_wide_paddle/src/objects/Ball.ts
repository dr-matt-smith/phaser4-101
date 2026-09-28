import Phaser from "phaser";
import { BALL_KEY } from "../assets.ts";
import type { Paddle } from "./Paddle.ts";

// Ball - bounces off the walls, the bricks and the paddle
//
// The walls and bricks are handled by the physics engine (bounce 1 = it keeps all its speed). The
// paddle is different: where the ball lands on the paddle decides which way it goes - see bounceOff.

export const BALL_SPEED = 420;         // pixels per second
const MAX_BOUNCE_ANGLE = 60;           // degrees from straight up, at the very end of the paddle
const RADIUS = 12;                     // ball_small.png is 24 x 24

export class Ball extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BALL_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // a round body the size of the picture - so the ball's corners never hit anything
    this.setCircle(RADIUS);
    this.setCollideWorldBounds(true);
    this.setBounce(1);
  }

  // start moving: up, and a little to one side
  public launch(): void {
    this.setDirection(Phaser.Math.Between(-20, 20));
  }

  // Called when the ball hits the paddle. -1 is the paddle's left end, 0 its middle, 1 its right
  // end; the further out the ball lands, the more it is sent sideways. This is what lets the
  // player aim.
  public bounceOff(paddle: Paddle): void {
    const halfWidth = paddle.displayWidth / 2;
    const where = Phaser.Math.Clamp((this.x - paddle.x) / halfWidth, -1, 1);
    this.setDirection(where * MAX_BOUNCE_ANGLE);
  }

  public isFalling(): boolean {
    // body can be null for a game object with no physics body; this ball always has one
    return this.body!.velocity.y > 0;
  }

  // move at BALL_SPEED, at `degrees` from straight up (negative = to the left)
  private setDirection(degrees: number): void {
    const radians = Phaser.Math.DegToRad(degrees);
    this.setVelocity(Math.sin(radians) * BALL_SPEED, -Math.cos(radians) * BALL_SPEED);
  }
}
