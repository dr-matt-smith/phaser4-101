import Phaser from "phaser";
import { SHIP_KEY } from "../assets.ts";

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

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SHIP_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBodySize(40, 36);
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
