import Phaser from "phaser";
import { ENEMY_KEY } from "../assets.ts";

// Boss - the big ship at the end of each level: it takes many hits, sweeps from side to side, and
// flashes white when it is hit
//
// There is only ever one boss, so it is not pooled: the game scene makes it once, switched off,
// and switches it on (appear) at the end of each level.

const BOSS_SCALE = 2.6;
const BOSS_TINT = 0xb388ff;          // tints the enemy picture a darker, meaner red
const BOSS_Y = 150;
const LEFT_X = 140;
const RIGHT_X = 660;
const ENTRY_TIME = 2000;             // milliseconds to fly down into place
const HIT_FLASH_TIME = 60;

export class Boss extends Phaser.Physics.Arcade.Image {
  private health = 0;
  private maxHealth = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, LEFT_X, -100, ENEMY_KEY);
    scene.add.existing(this);
    this.setScale(BOSS_SCALE);       // scale BEFORE adding the body, so the body is big too
    scene.physics.add.existing(this);
    this.setTint(BOSS_TINT);
    this.disableBody(true, true);    // not in the game until appear()
  }

  // Fly in from the top, then sweep from side to side for ever: a yoyo tween that repeats (-1).
  public appear(maxHealth: number, sweepTime: number): void {
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.enableBody(true, LEFT_X, -100, true, true);

    this.scene.tweens.add({
      targets: this,
      y: BOSS_Y,
      duration: ENTRY_TIME,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          x: RIGHT_X,
          duration: sweepTime,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      },
    });
  }

  // One hit. Returns true if that was the last one.
  public damage(): boolean {
    this.health = this.health - 1;

    // Phaser 4: a FILL tint paints the whole picture in the tint colour (here, white)
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(HIT_FLASH_TIME, () => {
      this.setTint(BOSS_TINT).setTintMode(Phaser.TintModes.MULTIPLY);
    });

    return this.health <= 0;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public kill(): void {
    this.scene.tweens.killTweensOf(this);
    this.disableBody(true, true);
  }
}
