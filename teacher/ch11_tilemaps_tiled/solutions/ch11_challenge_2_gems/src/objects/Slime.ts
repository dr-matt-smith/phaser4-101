import Phaser from "phaser";
import { SLIME_KEY } from "../assets.ts";

// Slime - an enemy that walks to and fro along the ground
//
// It turns round when it walks into something, or when the next step would take it off the edge.
// Its speed is not in the code: each slime reads it from its object's "speed" property in Tiled, so a
// level designer can make one slime faster than another without touching the code.

const SQUASH = "slime-squash";

export class Slime extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private direction = -1; // -1 = left, 1 = right
  private ground: Phaser.Tilemaps.TilemapLayer;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number, ground: Phaser.Tilemaps.TilemapLayer) {
    super(scene, x, y, SLIME_KEY, 0);
    this.speed = speed;
    this.ground = ground;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(26, 22);
    this.setOffset(3, 10);

    if (!scene.anims.exists(SQUASH)) {
      scene.anims.create({
        key: SQUASH,
        frames: scene.anims.generateFrameNumbers(SLIME_KEY, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    this.play(SQUASH);
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const body = this.body as Phaser.Physics.Arcade.Body; // a dynamic body: made by physics.add.existing

    if (body.blocked.left) {
      this.direction = 1;
    } else if (body.blocked.right) {
      this.direction = -1;
    } else if (body.blocked.down) {
      // Look at the tile just ahead of the slime's front foot, one pixel below it. No tile there, or
      // a tile the slime would fall through (water, spikes...), means an edge: turn round.
      const aheadX = this.direction < 0 ? body.left - 1 : body.right + 1;
      const tileAhead = this.ground.getTileAtWorldXY(aheadX, body.bottom + 1);
      if (tileAhead === null || !tileAhead.collides) {
        this.direction = -this.direction;
      }
    }

    this.setVelocityX(this.speed * this.direction);
  }
}
