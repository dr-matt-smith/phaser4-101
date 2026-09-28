import Phaser from "phaser";

// Ball - a ball that moves on its own, and bounces off the edges of the game
//
// The same Ball as Chapter 1: an Image that moves itself in preUpdate(), at a speed in pixels
// per second. It does not know it can be clicked - the scene that makes it sets that up.

// CHALLENGE 1: the blue ball
export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball_blue.png";

export class Ball extends Phaser.GameObjects.Image {
  // how fast the ball moves, in pixels per second, across (x) and down (y)
  private speedX: number;
  private speedY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speedX: number, speedY: number) {
    super(scene, x, y, BALL_KEY);

    this.speedX = speedX;
    this.speedY = speedY;

    scene.add.existing(this);
  }

  preUpdate(_time: number, delta: number): void {
    const seconds = delta / 1000;
    this.x = this.x + this.speedX * seconds;
    this.y = this.y + this.speedY * seconds;

    // x and y are the middle of the ball, so its edges are one radius away
    const radius = this.width / 2;
    const right = this.scene.scale.width - radius;
    const bottom = this.scene.scale.height - radius;

    if (this.x < radius || this.x > right) {
      this.speedX = -this.speedX;
      this.x = Phaser.Math.Clamp(this.x, radius, right);
    }
    if (this.y < radius || this.y > bottom) {
      this.speedY = -this.speedY;
      this.y = Phaser.Math.Clamp(this.y, radius, bottom);
    }
  }
}
