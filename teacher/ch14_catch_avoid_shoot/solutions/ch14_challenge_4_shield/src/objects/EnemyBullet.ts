import Phaser from "phaser";
import { ENEMY_BULLET_KEY } from "../assets.ts";

// EnemyBullet - a bullet fired by an enemy or the boss: pooled, exactly like the player's Bullet,
// but it can fly in any direction - usually straight at the player

const MARGIN = 20;

export class EnemyBullet extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ENEMY_BULLET_KEY);
  }

  // `angle` in radians, as Phaser.Math.Angle.Between gives it: 0 is to the right, PI / 2 is down
  public fire(x: number, y: number, angle: number, speed: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  public kill(): void {
    this.disableBody(true, true);
  }

  preUpdate(_time: number, _delta: number): void {
    const { width, height } = this.scene.scale;
    if (this.y < -MARGIN || this.y > height + MARGIN || this.x < -MARGIN || this.x > width + MARGIN) {
      this.kill();
    }
  }
}
