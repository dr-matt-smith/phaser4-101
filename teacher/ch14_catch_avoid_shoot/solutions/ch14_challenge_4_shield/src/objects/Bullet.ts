import Phaser from "phaser";
import { BULLET_KEY } from "../assets.ts";

// Bullet - one of the player's bullets, pooled (see the intermediate version)
//
// New here: a bullet can fly at an angle, for the spread-shot power-up.

const SPEED = 620;              // pixels per second
const MARGIN = 20;              // how far off screen before it is finished with

export class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BULLET_KEY);
  }

  // `angle` is in degrees away from straight up: 0 is straight up, positive leans right
  public fire(x: number, y: number, angle = 0): void {
    this.enableBody(true, x, y, true, true);
    const radians = Phaser.Math.DegToRad(angle);
    this.setVelocity(Math.sin(radians) * SPEED, -Math.cos(radians) * SPEED);
    this.setAngle(angle);       // turn the picture to match
  }

  public kill(): void {
    this.disableBody(true, true);
  }

  preUpdate(_time: number, _delta: number): void {
    const width = this.scene.scale.width;
    if (this.y < -MARGIN || this.x < -MARGIN || this.x > width + MARGIN) {
      this.kill();
    }
  }
}
