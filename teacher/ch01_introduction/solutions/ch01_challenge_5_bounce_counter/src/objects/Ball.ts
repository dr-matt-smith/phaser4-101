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

export class Ball extends Phaser.GameObjects.Image {
  // how fast the ball moves, in pixels per SECOND - across (x) and down (y)
  private speedX: number;
  private speedY: number;

  // CHALLENGE 5: how many times this ball has hit an edge
  private bounces = 0;

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
      this.bounces = this.bounces + 1;
    }

    // hit the top or bottom edge? turn round down
    if (this.y < radius || this.y > bottom) {
      this.speedY = -this.speedY;
      this.y = Phaser.Math.Clamp(this.y, radius, bottom);
      this.bounces = this.bounces + 1;
    }
  }

  // CHALLENGE 5: the scene asks this - the count itself stays private, so only the ball changes it
  public getBounces(): number {
    return this.bounces;
  }
}
