import Phaser from "phaser";
import { TILE_SIZE } from "../tiles.ts";

// Player - a top-down hero, moved with the arrow keys, that walks in four directions
//
// CHALLENGE 6: GRID movement. The player is always on a tile, and each move goes one whole tile,
// gliding from the centre of one tile to the centre of the next with a tween. It looks at the next
// tile BEFORE moving, so it needs no physics at all: it is a plain Sprite, not a physics sprite.

export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/topdown_hero.png";
export const HERO_FRAME_SIZE = 32;

const STEP_TIME = 200;      // CHALLENGE 6: milliseconds to move one tile (32 / 0.2 = 160 pixels per second)
const WALK_FRAME_RATE = 8;

type Facing = "down" | "left" | "right" | "up";

// topdown_hero.png has three frames per direction; the first of each three is "standing still"
const FIRST_FRAME: Record<Facing, number> = { down: 0, left: 3, right: 6, up: 9 };

// CHALLENGE 6: a plain Sprite now - no body, no velocity
export class Player extends Phaser.GameObjects.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private facing: Facing = "down";

  // CHALLENGE 6: the map the player walks on, and where on it the player is, in tiles
  private layer: Phaser.Tilemaps.TilemapLayer;
  private column: number;
  private row: number;
  private moving = false;       // true while gliding from one tile to the next

  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.TilemapLayer, column: number, row: number) {
    // CHALLENGE 6: start in the centre of the given tile
    const corner = layer.tileToWorldXY(column, row);
    super(scene, corner.x + TILE_SIZE / 2, corner.y + TILE_SIZE / 2, HERO_KEY, FIRST_FRAME.down);

    this.layer = layer;
    this.column = column;
    this.row = row;

    scene.add.existing(this);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    Player.createAnimations(scene);
  }

  // the four walk animations (Chapter 7). Animations belong to the game, not the scene, so they are
  // only made the first time
  private static createAnimations(scene: Phaser.Scene): void {
    for (const facing of ["down", "left", "right", "up"] as Facing[]) {
      const key = `walk-${facing}`;
      if (!scene.anims.exists(key)) {
        const first = FIRST_FRAME[facing];
        scene.anims.create({
          key: key,
          frames: scene.anims.generateFrameNumbers(HERO_KEY, { start: first, end: first + 2 }),
          frameRate: WALK_FRAME_RATE,
          repeat: -1,
        });
      }
    }
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);    // without this, the animations would not play

    // CHALLENGE 6: no new move until the last one has finished - so no turning halfway
    if (this.moving) {
      return;
    }

    // CHALLENGE 6: one direction at a time - there are no diagonals on a grid
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown) dx = -1;
    else if (this.cursors.right.isDown) dx = 1;
    else if (this.cursors.up.isDown) dy = -1;
    else if (this.cursors.down.isDown) dy = 1;

    if (dx === 0 && dy === 0) {
      this.stand();
      return;
    }

    if (dx < 0) this.facing = "left";
    else if (dx > 0) this.facing = "right";
    else if (dy < 0) this.facing = "up";
    else this.facing = "down";

    // CHALLENGE 6: look at the next tile first. Off the map (null), or a tile that collides (wall or
    // water - the scene's setCollision still says which), and the player turns but stays put
    const next = this.layer.getTileAt(this.column + dx, this.row + dy);
    if (next === null || next.collides) {
      this.stand();
      return;
    }

    // CHALLENGE 6: glide to the centre of the next tile; ignore the keys until it is there
    this.column = this.column + dx;
    this.row = this.row + dy;
    this.moving = true;
    this.anims.play(`walk-${this.facing}`, true);

    const corner = this.layer.tileToWorldXY(this.column, this.row);
    this.scene.tweens.add({
      targets: this,
      x: corner.x + TILE_SIZE / 2,
      y: corner.y + TILE_SIZE / 2,
      duration: STEP_TIME,
      onComplete: () => {
        this.moving = false;     // the next preUpdate moves again if a key is still held
      },
    });
  }

  // CHALLENGE 6: stand still, facing the way we last tried to go
  private stand(): void {
    this.anims.stop();
    this.setFrame(FIRST_FRAME[this.facing]);
  }
}
