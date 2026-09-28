import Phaser from "phaser";
import { GEM_KEY, HEART_KEY, STAR_KEY } from "../assets.ts";

// PowerUp - a pickup that drifts down the screen after an enemy is destroyed
//
// Not pooled: only a few ever exist, so making and destroying them is fine. It is added to a
// physics group in the game scene, which gives it its body and its falling speed.

export type PowerUpKind = "spread" | "rapid" | "life";

// which picture shows which kind - a Record is an object with one entry for every kind, and the
// compiler checks that none is missing
const TEXTURES: Record<PowerUpKind, string> = {
  spread: GEM_KEY,
  rapid: STAR_KEY,
  life: HEART_KEY,
};

const KINDS: PowerUpKind[] = ["spread", "rapid", "life"];

export class PowerUp extends Phaser.Physics.Arcade.Image {
  public readonly kind: PowerUpKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PowerUpKind) {
    super(scene, x, y, TEXTURES[kind]);
    this.kind = kind;
    scene.add.existing(this);

    // pulse, so it catches the eye
    scene.tweens.add({ targets: this, scale: 1.3, duration: 300, yoyo: true, repeat: -1 });
  }

  public static randomKind(): PowerUpKind {
    return Phaser.Utils.Array.GetRandom(KINDS);
  }
}
