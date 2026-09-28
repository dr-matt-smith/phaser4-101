import Phaser from "phaser";
import { eventLog } from "../EventLog.ts";
import { SKIP_SUPER } from "../scenes/keys.ts";

// Spinner - a spinning coin that slides from side to side on its own
//
// It is a SPRITE, not an Image: a Sprite can play animations. Sprite already has a preUpdate() of
// its own - the method that moves the animation on to its next frame - so Spinner's preUpdate()
// REPLACES it (hence `override`), and must call super.preUpdate() to keep the animation going.

export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const SPIN_ANIM = "spin";

const SPEED = 120;         // pixels per second
const LEFT_EDGE = 70;
const RIGHT_EDGE = 340;
const SCALE = 3;           // the coin is 32 x 32 - three times bigger is easier to watch

export class Spinner extends Phaser.GameObjects.Sprite {
  private speed = SPEED;

  // set by DemoScene when it wants this frame written to the log in full
  public logNextFrame = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, COIN_KEY);
    this.setScale(SCALE);
    this.play(SPIN_ANIM);

    // add it to the scene - and, because it has a preUpdate(), to the scene's update list
    scene.add.existing(this);
  }

  protected override preUpdate(time: number, delta: number): void {
    if (this.logNextFrame) {
      eventLog.add("  Spinner.preUpdate()", this.scene.game.loop.frame);
      this.logNextFrame = false;
    }

    // Sprite's own preUpdate() plays the animation. Press S in the game to leave it out, and the
    // coin still slides (that is our code, below) but stops spinning.
    if (this.scene.registry.get(SKIP_SUPER) !== true) {
      super.preUpdate(time, delta);
    }

    this.x = this.x + this.speed * delta / 1000;
    if (this.x < LEFT_EDGE || this.x > RIGHT_EDGE) {
      this.speed = -this.speed;
      this.x = Phaser.Math.Clamp(this.x, LEFT_EDGE, RIGHT_EDGE);
    }
  }
}
