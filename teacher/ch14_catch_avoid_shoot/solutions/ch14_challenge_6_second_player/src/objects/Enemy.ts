import Phaser from "phaser";
import { ENEMY_KEY } from "../assets.ts";

// Enemy - an enemy ship, pooled like the bullets
//
// The enemy knows how to switch itself on and off. How it MOVES - the pattern of its wave - is
// decided by the game scene, with tweens and velocities, when it spawns the wave.

export const ENEMY_POINTS = 100;

export class Enemy extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ENEMY_KEY);
  }

  public spawn(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
  }

  public kill(): void {
    // A pooled object must be switched off COMPLETELY: a tween still moving this enemy would carry
    // on moving it while it waits in the pool, and move it again when it is reused.
    this.scene.tweens.killTweensOf(this);
    this.disableBody(true, true);
  }
}
