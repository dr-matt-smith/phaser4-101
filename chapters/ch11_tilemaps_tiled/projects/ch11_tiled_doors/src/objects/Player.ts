import Phaser from "phaser";
import { HERO_KEY } from "../assets.ts";

// Player - the explorer, seen from above: walks in eight directions with the arrow keys
//
// An Arcade Physics sprite that reads the keyboard itself in preUpdate(), and shows the walk
// animation for the way it is going (Chapter 7).

const SPEED = 160; // pixels per second

// topdown_hero.png is 32 x 32 frames, three per direction; the first of each three is "standing"
const FACINGS = {
  down: { walk: "hero-down", stand: 0 },
  left: { walk: "hero-left", stand: 3 },
  right: { walk: "hero-right", stand: 6 },
  up: { walk: "hero-up", stand: 9 },
};
type Facing = keyof typeof FACINGS; // "down" | "left" | "right" | "up"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private facing: Facing = "down";
  private frozen = false;

  // the animations belong to the game, not to one sprite, so they are made once
  public static createAnimations(anims: Phaser.Animations.AnimationManager): void {
    if (anims.exists(FACINGS.down.walk)) {
      return;
    }
    for (const facing of Object.values(FACINGS)) {
      anims.create({
        key: facing.walk,
        frames: anims.generateFrameNumbers(HERO_KEY, { frames: [facing.stand + 1, facing.stand, facing.stand + 2, facing.stand] }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HERO_KEY, FACINGS.down.stand);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // the body covers the feet only, so the hero's head can overlap the wall above - it looks as if
    // they are standing in front of it
    this.setSize(18, 14);
    this.setOffset(7, 17);

    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  protected override preUpdate(time: number, delta: number): void {
    // Sprite's own preUpdate moves its animation on - without this, the animations would freeze
    super.preUpdate(time, delta);
    if (this.frozen) {
      return;
    }

    // -1, 0 or 1 across (x) and down (y)
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown) {
      dx = -1;
    } else if (this.cursors.right.isDown) {
      dx = 1;
    }
    if (this.cursors.up.isDown) {
      dy = -1;
    } else if (this.cursors.down.isDown) {
      dy = 1;
    }

    // normalize() makes the diagonal as fast as straight lines: (1, 1) is about 1.41 long
    const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(SPEED);
    this.setVelocity(velocity.x, velocity.y);

    if (dx === 0 && dy === 0) {
      this.stop();
      this.setFrame(FACINGS[this.facing].stand);
      return;
    }
    // face the way we are going; up/down wins on a diagonal
    if (dy < 0) {
      this.facing = "up";
    } else if (dy > 0) {
      this.facing = "down";
    } else if (dx < 0) {
      this.facing = "left";
    } else {
      this.facing = "right";
    }
    this.play(FACINGS[this.facing].walk, true);
  }

  // stop, and stop listening to the keys - while the room fades out
  public freeze(): void {
    this.frozen = true;
    this.setVelocity(0, 0);
    this.stop();
  }
}
