import Phaser from "phaser";

// Player - a top-down hero, moved with the arrow keys, that walks in four directions
//
// It is an Arcade Physics sprite (Chapter 8), so it has a body that the tilemap layer can block.
// It only sets its velocity; the physics world moves it, and the collider in the scene stops it
// walking into walls and water.

export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/topdown_hero.png";
export const HERO_FRAME_SIZE = 32;

const SPEED = 160;          // pixels per second
const BODY_SIZE = 20;       // the body is smaller than the 32 x 32 picture, so it fits through doors
const WALK_FRAME_RATE = 8;

type Facing = "down" | "left" | "right" | "up";

// topdown_hero.png has three frames per direction; the first of each three is "standing still"
const FIRST_FRAME: Record<Facing, number> = { down: 0, left: 3, right: 6, up: 9 };

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private facing: Facing = "down";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HERO_KEY, FIRST_FRAME.down);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // a body smaller than the picture, centred on it
    this.setSize(BODY_SIZE, BODY_SIZE);

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

    // -1, 0 or 1 across and down, from the arrow keys
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown) dx = -1;
    else if (this.cursors.right.isDown) dx = 1;
    if (this.cursors.up.isDown) dy = -1;
    else if (this.cursors.down.isDown) dy = 1;

    // normalise, so that walking diagonally is not faster than walking straight
    const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(SPEED);
    this.setVelocity(velocity.x, velocity.y);

    if (dx === 0 && dy === 0) {
      this.anims.stop();
      this.setFrame(FIRST_FRAME[this.facing]);
      return;
    }

    // face the way we are going (left/right wins when moving diagonally)
    if (dx < 0) this.facing = "left";
    else if (dx > 0) this.facing = "right";
    else if (dy < 0) this.facing = "up";
    else this.facing = "down";

    this.anims.play(`walk-${this.facing}`, true);   // true: keep going if it is already playing
  }
}
