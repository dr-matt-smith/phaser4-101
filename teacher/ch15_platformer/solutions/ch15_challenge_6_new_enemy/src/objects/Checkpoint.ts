import Phaser from "phaser";
import { SIGN_FRAME, TILES_KEY } from "../assets.ts";

// Checkpoint - a signpost. Touch it, and when the hero is hurt it comes back to life here
// instead of at the start of the level.

const REACHED_TINT = 0x80ff80;

export class Checkpoint extends Phaser.Physics.Arcade.Image {
  private reached = false;

  // (x, y) is where it stands
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TILES_KEY, SIGN_FRAME);
    this.setOrigin(0.5, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true: a STATIC body - it never moves
  }

  // true the first time only, so the scene can celebrate once
  public reach(): boolean {
    if (this.reached) {
      return false;
    }
    this.reached = true;
    this.setTint(REACHED_TINT);
    this.scene.tweens.add({ targets: this, scale: 1.4, duration: 150, yoyo: true });
    return true;
  }
}
