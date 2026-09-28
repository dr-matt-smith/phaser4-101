import Phaser from "phaser";
import { SHIELD_BUBBLE_KEY, SHIP_KEY } from "../assets.ts";   // CHALLENGE 4: SHIELD_BUBBLE_KEY

// PlayerShip - the player's ship: moves, fires at a limited rate, flashes after a hit, and can be
// POWERED UP for a while
//
// The intermediate version's ship, plus power-ups. Each power-up is just a time on the scene's
// clock when it wears off: "spread until 12500 ms", "rapid until 9000 ms". A power-up is active
// while the clock is before that time - so there are no timers to cancel, and picking up the same
// power-up again simply moves the time later.

const SPEED = 420;                 // pixels per second
const FIRE_DELAY = 200;            // milliseconds between shots
const RAPID_FIRE_DELAY = 90;       // ...with the rapid-fire power-up
const POWER_UP_TIME = 8000;        // milliseconds a power-up lasts
const INVULNERABLE_TIME = 2000;
const FLASH_TIME = 100;

export type WeaponPowerUp = "spread" | "rapid";

export class PlayerShip extends Phaser.Physics.Arcade.Image {
  private nextFireTime = 0;
  private invulnerable = false;
  private spreadUntil = 0;         // clock times when each power-up wears off
  private rapidUntil = 0;
  // CHALLENGE 4: a shield takes the next hit. It does not wear off, so it is a flag, not a time.
  private shielded = false;
  private bubble: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SHIP_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBodySize(40, 36);

    // CHALLENGE 4: the bubble is a separate image, drawn over the ship, hidden until needed
    this.bubble = scene.add.image(x, y, SHIELD_BUBBLE_KEY).setVisible(false);
  }

  // CHALLENGE 4: keep the bubble on the ship. (Having a preUpdate means scene.add.existing puts the
  // ship on the update list, so Phaser calls this every frame while the ship is active.)
  preUpdate(_time: number, _delta: number): void {
    this.bubble.setPosition(this.x, this.y);
  }

  // CHALLENGE 4
  public giveShield(): void {
    this.shielded = true;
    this.bubble.setVisible(true);
  }

  // CHALLENGE 4
  public hasShield(): boolean {
    return this.shielded;
  }

  // CHALLENGE 4: the shield takes a hit, and is gone
  public popShield(): void {
    this.shielded = false;
    this.bubble.setVisible(false);
  }

  public move(direction: number): void {
    this.setVelocityX(direction * SPEED);
  }

  public tryToFire(time: number): boolean {
    if (time < this.nextFireTime) {
      return false;
    }
    const delay = time < this.rapidUntil ? RAPID_FIRE_DELAY : FIRE_DELAY;
    this.nextFireTime = time + delay;
    return true;
  }

  public hasSpread(time: number): boolean {
    return time < this.spreadUntil;
  }

  public powerUp(kind: WeaponPowerUp, time: number): void {
    if (kind === "spread") {
      this.spreadUntil = time + POWER_UP_TIME;
    } else {
      this.rapidUntil = time + POWER_UP_TIME;
    }
  }

  // what the HUD shows, e.g. "SPREAD 6  RAPID 2" (whole seconds left), or "" for no power-ups
  public describeWeapon(time: number): string {
    const parts: string[] = [];
    if (time < this.spreadUntil) {
      parts.push(`SPREAD ${Math.ceil((this.spreadUntil - time) / 1000)}`);
    }
    if (time < this.rapidUntil) {
      parts.push(`RAPID ${Math.ceil((this.rapidUntil - time) / 1000)}`);
    }
    if (this.shielded) {
      parts.push("SHIELD");         // CHALLENGE 4
    }
    return parts.join("  ");
  }

  public isInvulnerable(): boolean {
    return this.invulnerable;
  }

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
