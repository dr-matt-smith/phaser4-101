import Phaser from "phaser";
import { BULLET_KEY } from "../assets.ts";

// Bullet - one of the player's bullets, made to be POOLED
//
// The game scene keeps a pool (a physics group) of bullets. Firing asks the pool for a spare one
// and calls fire(); a bullet that leaves the screen, or hits something, is switched off with
// kill() and waits in the pool to be fired again. No bullet is ever destroyed.

const SPEED = 600;              // pixels per second, upwards
const OFF_SCREEN = -20;         // above the top of the screen

export class Bullet extends Phaser.Physics.Arcade.Image {
  // The pool makes new bullets itself, calling `new Bullet(scene, x, y, ...)`. The pool also adds
  // them to the scene and gives them a body, so there is nothing else to do here.
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BULLET_KEY);
  }

  // Switch on: body enabled and reset to (x, y), active (so preUpdate runs), and visible.
  public fire(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(-SPEED);
  }

  // Switch off: body disabled (so it hits nothing), inactive (so preUpdate stops), and hidden.
  // It stays in the pool, ready for next time.
  public kill(): void {
    this.disableBody(true, true);
  }

  // Phaser calls this every frame - but only while the bullet is active
  preUpdate(_time: number, _delta: number): void {
    if (this.y < OFF_SCREEN) {
      this.kill();
    }
  }
}
