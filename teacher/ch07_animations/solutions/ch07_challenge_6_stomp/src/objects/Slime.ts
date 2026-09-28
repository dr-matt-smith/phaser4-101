import Phaser from "phaser";
import { SLIME_SHEET, SLIME_WALK } from "../assets.ts";

// CHALLENGE 6
// Slime - patrols back and forth along the ground between two x positions, animated
//
// Like the hero, it moves itself in preUpdate() - and, being a Sprite, must call
// super.preUpdate() so that its animation keeps playing.

const SCALE = 1.5;

export class Slime extends Phaser.GameObjects.Sprite {
  private speed: number;           // pixels per second; negative is to the left
  private minX: number;
  private maxX: number;

  constructor(scene: Phaser.Scene, x: number, groundY: number, minX: number, maxX: number, speed: number) {
    super(scene, x, groundY, SLIME_SHEET, 0);
    this.minX = minX;
    this.maxX = maxX;
    this.speed = speed;

    this.setOrigin(0.5, 1);        // (x, y) is the middle of its base, on the ground
    this.setScale(SCALE);
    this.play(SLIME_WALK);

    scene.add.existing(this);
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.x = this.x + this.speed * (delta / 1000);

    // turn round at each end of the patrol
    if (this.x < this.minX) {
      this.x = this.minX;
      this.speed = Math.abs(this.speed);
    } else if (this.x > this.maxX) {
      this.x = this.maxX;
      this.speed = -Math.abs(this.speed);
    }
    this.setFlipX(this.speed < 0);
  }
}
