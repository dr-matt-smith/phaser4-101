import Phaser from "phaser";
import { SLIME_KEY } from "../assets.ts";
import type { Enemy } from "./Enemy.ts";

// Slime - patrols: walks until it meets a wall, the edge of a platform, or a hazard, then turns
// round. The same as in the intermediate version, now saying that it is an Enemy.

const SPEED = 60; // pixels per second
const BODY_WIDTH = 26;
const BODY_HEIGHT = 22;
const WOBBLE = "slime-wobble";

export class Slime extends Phaser.Physics.Arcade.Sprite implements Enemy {
  declare body: Phaser.Physics.Arcade.Body;

  private direction = -1; // -1 = left, 1 = right
  private squashed = false;
  private ground: Phaser.Tilemaps.TilemapLayer;
  private hazards: Phaser.Tilemaps.TilemapLayer;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    ground: Phaser.Tilemaps.TilemapLayer,
    hazards: Phaser.Tilemaps.TilemapLayer,
  ) {
    super(scene, x, y, SLIME_KEY, 0);
    this.ground = ground;
    this.hazards = hazards;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.body.setOffset((this.width - BODY_WIDTH) / 2, this.height - BODY_HEIGHT);
    this.play(WOBBLE);
  }

  public static createAnimations(scene: Phaser.Scene): void {
    scene.anims.create({
      key: WOBBLE,
      frames: scene.anims.generateFrameNumbers(SLIME_KEY, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  // CHALLENGE 6: every enemy must now say whether it can be stomped
  public canBeStomped(): boolean {
    return true;
  }

  public isSquashed(): boolean {
    return this.squashed;
  }

  public squash(): void {
    this.squashed = true;
    this.body.enable = false;
    this.stop();
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      scaleX: 1.4,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.squashed) {
      return;
    }

    if (this.body.blocked.left) {
      this.direction = 1;
    } else if (this.body.blocked.right) {
      this.direction = -1;
    } else if (this.body.blocked.down && this.shouldTurn()) {
      this.direction = -this.direction;
    }
    this.setVelocityX(this.direction * SPEED);
  }

  private shouldTurn(): boolean {
    const aheadX = this.direction < 0 ? this.body.left - 2 : this.body.right + 2;
    const noGround = !this.ground.hasTileAtWorldXY(aheadX, this.body.bottom + 4);
    const hazard = this.hazards.hasTileAtWorldXY(aheadX, this.body.bottom - 4);
    return noGround || hazard;
  }
}
