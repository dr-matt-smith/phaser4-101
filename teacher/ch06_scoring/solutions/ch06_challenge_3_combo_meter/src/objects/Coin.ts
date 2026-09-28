import Phaser from "phaser";
import { COIN_KEY, GEM_KEY } from "../assets.ts";

// Coin - something to click before it vanishes: a gold coin, or a rarer gem worth more
//
// A coin pops up, waits, starts to blink when its time is nearly up, and then shrinks away. If it
// gets away it tells whoever is listening by sending a COIN_EXPIRED event - the coin does not know
// or care what that costs the player. That is the game scene's business.

// the event a coin sends (on itself) when it vanishes without being clicked
export const COIN_EXPIRED = "expired";

// what kind of pickup a coin is - a plain object describing it
export interface CoinKind {
  texture: string;
  points: number;
  scale: number;
  lifetimeScale: number;   // 1 = the normal lifetime; 0.6 = gone in 60% of the time
}

export const GOLD_COIN: CoinKind = { texture: COIN_KEY, points: 10, scale: 1.75, lifetimeScale: 1 };
export const GEM: CoinKind = { texture: GEM_KEY, points: 50, scale: 1.5, lifetimeScale: 0.6 };

const POP_IN_TIME = 150;
const BLINK_AT = 0.7;       // start blinking when 70% of the lifetime has gone
const BLINK_TIME = 100;

export class Coin extends Phaser.GameObjects.Image {
  public readonly points: number;
  private readonly kind: CoinKind;
  private expireTimer: Phaser.Time.TimerEvent;
  private blinkTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: CoinKind, lifetime: number) {
    super(scene, x, y, kind.texture);
    this.kind = kind;
    this.points = kind.points;
    scene.add.existing(this);

    // pop in: grow from nothing to full size
    this.setScale(0);
    scene.tweens.add({ targets: this, scale: kind.scale, duration: POP_IN_TIME, ease: "Back.easeOut" });

    // two timers on the scene's clock: one to start blinking, one to vanish
    const life = lifetime * kind.lifetimeScale;
    this.blinkTimer = scene.time.delayedCall(life * BLINK_AT, () => this.blink());
    this.expireTimer = scene.time.delayedCall(life, () => this.expire());
  }

  // Clicked in time: stop the timers, and burst away. (The scoring is the scene's job.)
  public collect(): void {
    this.stopTimers();
    this.disableInteractive();
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);
    this.scene.tweens.add({
      targets: this,
      scale: this.kind.scale * 1.8,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }

  private blink(): void {
    this.scene.tweens.add({ targets: this, alpha: 0.3, duration: BLINK_TIME, yoyo: true, repeat: -1 });
  }

  // Not clicked in time: tell the listeners, then shrink away.
  private expire(): void {
    this.disableInteractive();
    this.emit(COIN_EXPIRED, this);
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, scale: 0, duration: 200, onComplete: () => this.destroy() });
  }

  private stopTimers(): void {
    this.blinkTimer.remove();
    this.expireTimer.remove();
  }
}
