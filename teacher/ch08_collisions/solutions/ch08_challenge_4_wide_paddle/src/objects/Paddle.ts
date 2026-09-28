import Phaser from "phaser";
import { PADDLE_KEY } from "../assets.ts";

// Paddle - the bat at the bottom, moved with the arrow keys or the mouse
//
// It has a dynamic body (so it can move), made IMMOVABLE: when the ball hits it, the physics engine
// moves only the ball. Chapter 9 has more on immovable bodies.

const SPEED = 500;   // pixels per second, with the keys

export class Paddle extends Phaser.Physics.Arcade.Image {
  // CHALLENGE 4: the timer that puts the paddle back to normal. `?` means it may not be set -
  // there is no timer until the first power-up is caught
  private narrowTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PADDLE_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setCollideWorldBounds(true);
  }

  // arrow keys: set the velocity, and let the physics engine move the paddle
  public moveWithKeys(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (cursors.left.isDown) {
      this.setVelocityX(-SPEED);
    } else if (cursors.right.isDown) {
      this.setVelocityX(SPEED);
    } else {
      this.setVelocityX(0);
    }
  }

  // CHALLENGE 4: stretch the paddle across, for `duration` milliseconds. A dynamic body follows its
  // game object's scale by itself, so the physics size changes too. Catching another power-up
  // while wide starts the time again.
  public widen(factor: number, duration: number): void {
    this.setScale(factor, 1);
    this.narrowTimer?.remove();   // `?.` - only call remove() if there is a timer
    this.narrowTimer = this.scene.time.delayedCall(duration, () => {
      this.setScale(1, 1);
    });
  }

  // the mouse: jump straight to the pointer, keeping the whole paddle on screen
  public moveTo(x: number): void {
    const halfWidth = this.displayWidth / 2;
    this.x = Phaser.Math.Clamp(x, halfWidth, this.scene.scale.width - halfWidth);
  }
}
