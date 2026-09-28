import Phaser from "phaser";
import { SLIME_KEY } from "../assets.ts";

// Slime - an enemy that patrols: it walks until it meets a wall, the edge of a platform, or a
// hazard, then turns round. Jump on it to squash it; walk into it and you are hurt.
//
// It "looks ahead" by asking the tilemap layers what is just in front of its feet.

const SPEED = 60; // pixels per second - slow enough to jump over
const BODY_WIDTH = 26;
const BODY_HEIGHT = 22;
const WOBBLE = "slime-wobble";

export class Slime extends Phaser.Physics.Arcade.Sprite {
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
    this.setOrigin(0.5, 1); // (x, y) is where it sits
    this.body.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.body.setOffset((this.width - BODY_WIDTH) / 2, this.height - BODY_HEIGHT);
    this.play(WOBBLE);
  }

  // made once for the whole game - and only if they do not exist yet, as the title scene that
  // calls this runs again every time the player goes back to it
  public static createAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists(WOBBLE)) {
      return;
    }
    scene.anims.create({
      key: WOBBLE,
      frames: scene.anims.generateFrameNumbers(SLIME_KEY, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  public isSquashed(): boolean {
    return this.squashed;
  }

  // flatten, fade, and go - with its body switched off at once, so it cannot hurt anyone
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

  // look just beyond the leading edge of the body: no ground under that spot, or a hazard in it,
  // means turn round
  private shouldTurn(): boolean {
    const aheadX = this.direction < 0 ? this.body.left - 2 : this.body.right + 2;
    const noGround = !this.ground.hasTileAtWorldXY(aheadX, this.body.bottom + 4);
    const hazard = this.hazards.hasTileAtWorldXY(aheadX, this.body.bottom - 4);
    return noGround || hazard;
  }
}
