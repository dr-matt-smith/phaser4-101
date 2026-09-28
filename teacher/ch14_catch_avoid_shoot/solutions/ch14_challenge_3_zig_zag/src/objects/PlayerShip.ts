import Phaser from "phaser";
import { SHIP_KEY } from "../assets.ts";

// PlayerShip - the player's ship: slides left and right along the bottom, fires at a limited
// rate, and flashes (and cannot be hurt) for a moment after being hit
//
// It is the catcher's Basket (ch14_catcher_simple) with two new jobs. The scene still decides
// WHEN to move and fire; the ship knows HOW fast, and how often it is allowed to.

const SPEED = 420;                 // pixels per second
const FIRE_DELAY = 180;            // milliseconds between shots: about 5 a second
const INVULNERABLE_TIME = 2000;    // milliseconds of safety after a hit
const FLASH_TIME = 100;            // milliseconds for each fade out, and each fade back in

export class PlayerShip extends Phaser.Physics.Arcade.Image {
  private nextFireTime = 0;        // the clock time (ms) when the next shot is allowed
  private invulnerable = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SHIP_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBodySize(40, 36);      // a little smaller than the picture: near misses feel fair
  }

  // -1 = left, 0 = stop, 1 = right
  public move(direction: number): void {
    this.setVelocityX(direction * SPEED);
  }

  // The fire rate. `time` is the scene's clock. Returns true (and starts the wait for the next
  // shot) if enough time has passed since the last one.
  public tryToFire(time: number): boolean {
    if (time < this.nextFireTime) {
      return false;
    }
    this.nextFireTime = time + FIRE_DELAY;
    return true;
  }

  public isInvulnerable(): boolean {
    return this.invulnerable;
  }

  // Flash for INVULNERABLE_TIME: a tween fades the ship out and back in (yoyo), over and over
  // (repeat). When it finishes, the ship can be hurt again.
  public makeInvulnerable(): void {
    this.invulnerable = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.15,
      duration: FLASH_TIME,
      yoyo: true,
      repeat: INVULNERABLE_TIME / (FLASH_TIME * 2) - 1,
      onComplete: () => {
        this.setAlpha(1);
        this.invulnerable = false;
      },
    });
  }
}
