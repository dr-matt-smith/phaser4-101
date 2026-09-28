import Phaser from "phaser";
import { ENEMY_KEY } from "../assets.ts";

// Enemy - an angry triangle that bounces round the screen (Chapter 1's Ball, in a new shape)

const TOP = 50;          // the HUD bar is above this
const RADIUS = 24;       // half the triangle's width

export class Enemy extends Phaser.GameObjects.Image {
  private speedX: number;
  private speedY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speedX: number, speedY: number) {
    super(scene, x, y, ENEMY_KEY);
    this.speedX = speedX;
    this.speedY = speedY;
    scene.add.existing(this);
  }

  preUpdate(_time: number, delta: number): void {
    const seconds = delta / 1000;
    this.x = this.x + this.speedX * seconds;
    this.y = this.y + this.speedY * seconds;

    const right = this.scene.scale.width - RADIUS;
    const bottom = this.scene.scale.height - RADIUS;

    if (this.x < RADIUS || this.x > right) {
      this.speedX = -this.speedX;
      this.x = Phaser.Math.Clamp(this.x, RADIUS, right);
    }
    if (this.y < TOP + RADIUS || this.y > bottom) {
      this.speedY = -this.speedY;
      this.y = Phaser.Math.Clamp(this.y, TOP + RADIUS, bottom);
    }
  }
}
