import Phaser from "phaser";

// Ball - a ball that moves on its own, and bounces off the edges of the game
//
// Chapter 1's Ball, plus two things the scene can ask it to do: speed up, and jump somewhere new.

export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball.png";

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

  // multiply the ball's speed - 1.2 is 20% faster
  public speedUp(factor: number): void {
    this.speedX = this.speedX * factor;
    this.speedY = this.speedY * factor;
  }

  // jump to a random place, with the whole ball on screen
  public teleport(): void {
    const radius = this.width / 2;
    this.x = Phaser.Math.Between(radius, this.scene.scale.width - radius);
    this.y = Phaser.Math.Between(radius, this.scene.scale.height - radius);
  }
}
