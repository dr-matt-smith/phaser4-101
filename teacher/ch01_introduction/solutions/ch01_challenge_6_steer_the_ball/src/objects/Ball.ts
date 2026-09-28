import Phaser from "phaser";

// Ball - a ball that moves on its own, and bounces off the edges of the game
//
// Ball EXTENDS one of Phaser's game objects, Image, so every ball already has a picture, a
// position (x, y), a size (width, height), and can be drawn. What Ball adds is MOVING.
//
// Phaser calls preUpdate() on every game object that has one, every frame - so a ball looks after
// its own moving, and the scene that made it does not have to.

export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball.png";

// CHALLENGE 6: the fastest the ball may go, in each direction, in pixels a second
const TOP_SPEED = 600;

export class Ball extends Phaser.GameObjects.Image {
  // how fast the ball moves, in pixels per SECOND - across (x) and down (y)
  private speedX: number;
  private speedY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speedX: number, speedY: number) {
    // Image's constructor sets up the picture and the position
    super(scene, x, y, BALL_KEY);

    this.speedX = speedX;
    this.speedY = speedY;

    // put this ball in the scene, so Phaser draws it - and calls its preUpdate() every frame
    scene.add.existing(this);
  }

  // called by Phaser every frame
  // - time:  how long the game has been running, in milliseconds (not needed here)
  // - delta: how long the LAST frame took, in milliseconds (about 16.7 at 60 frames a second)
  preUpdate(_time: number, delta: number): void {
    const seconds = delta / 1000;

    // move: speed (pixels per second) x time (seconds) = distance (pixels)
    this.x = this.x + this.speedX * seconds;
    this.y = this.y + this.speedY * seconds;

    // x and y are the ball's MIDDLE, so its edges are half its size away
    const radius = this.width / 2;
    const right = this.scene.scale.width - radius;
    const bottom = this.scene.scale.height - radius;

    // hit the left or right edge? turn round across
    if (this.x < radius || this.x > right) {
      this.speedX = -this.speedX;
      this.x = Phaser.Math.Clamp(this.x, radius, right);
    }

    // hit the top or bottom edge? turn round down
    if (this.y < radius || this.y > bottom) {
      this.speedY = -this.speedY;
      this.y = Phaser.Math.Clamp(this.y, radius, bottom);
    }
  }

  // CHALLENGE 6: speed the ball up (or slow it down) - the scene calls this while an arrow is held
  // - amountX and amountY are pixels a second to ADD to the speed; the scene has already
  //   multiplied them by the frame's length, so holding a key longer pushes harder
  // - Clamp keeps each speed between -TOP_SPEED and TOP_SPEED
  public push(amountX: number, amountY: number): void {
    this.speedX = Phaser.Math.Clamp(this.speedX + amountX, -TOP_SPEED, TOP_SPEED);
    this.speedY = Phaser.Math.Clamp(this.speedY + amountY, -TOP_SPEED, TOP_SPEED);
  }

  // CHALLENGE 6: how fast the ball is going overall, in pixels a second (Pythagoras)
  public getSpeed(): number {
    return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
  }
}
