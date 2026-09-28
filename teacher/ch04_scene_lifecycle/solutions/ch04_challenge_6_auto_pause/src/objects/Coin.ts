import Phaser from "phaser";
import { COIN_KEY, COIN_SPIN_ANIM } from "../assets.ts";

// Coin - a spinning coin that fades away if it is not collected in time
//
// A SPRITE, because it plays an animation. Sprite has a preUpdate() of its own - it is what moves
// the animation on each frame - so Coin's preUpdate() is an `override`, and calls
// super.preUpdate() first. Leave that line out and every coin freezes on its first frame.

const LIFETIME = 4000;   // milliseconds before the coin disappears
const FADE_TIME = 1000;  // it fades out over its last second

export class Coin extends Phaser.GameObjects.Sprite {
  private age = 0;       // milliseconds this coin has been on screen

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, COIN_KEY);
    this.play(COIN_SPIN_ANIM);
    scene.add.existing(this);
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Age by delta, not by the clock: delta only arrives while the scene is running, so a
    // coin's four seconds do not tick away while the game is paused.
    this.age = this.age + delta;

    const timeLeft = LIFETIME - this.age;
    if (timeLeft <= 0) {
      this.destroy();
    } else if (timeLeft < FADE_TIME) {
      this.setAlpha(timeLeft / FADE_TIME);
    }
  }
}
