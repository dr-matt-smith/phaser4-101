import Phaser from "phaser";
import { HERO_KEY, JUMP_SOUND } from "../assets.ts";

// Player - the hero: runs with the arrow keys, jumps with UP or SPACE
//
// An Arcade Physics sprite (Chapter 9) that reads the keyboard itself, in preUpdate(), and picks its
// own animation (Chapter 7). The scene only has to make it, and tell it when to go back to the start.

const RUN_SPEED = 200; // pixels per second
const JUMP_SPEED = 470; // pixels per second, upwards - about 3.8 tiles high with gravity 900

// hero.png is 32 x 48 frames: 0-1 idle, 2-7 run, 8 jump, 9 fall
const IDLE = "hero-idle";
const RUN = "hero-run";
const JUMP = "hero-jump";
const FALL = "hero-fall";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  // the animations belong to the game, not to one sprite, so they are made once
  public static createAnimations(anims: Phaser.Animations.AnimationManager): void {
    if (anims.exists(IDLE)) {
      return;
    }
    anims.create({ key: IDLE, frames: anims.generateFrameNumbers(HERO_KEY, { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
    anims.create({ key: RUN, frames: anims.generateFrameNumbers(HERO_KEY, { start: 2, end: 7 }), frameRate: 12, repeat: -1 });
    anims.create({ key: JUMP, frames: [{ key: HERO_KEY, frame: 8 }] });
    anims.create({ key: FALL, frames: [{ key: HERO_KEY, frame: 9 }] });
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HERO_KEY, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // a body a little narrower than the picture, so the hero does not snag on the edges of tiles
    this.setSize(20, 42);
    this.setOffset(6, 6);
    this.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  protected override preUpdate(time: number, delta: number): void {
    // Sprite's own preUpdate moves its animation on - without this, the animations would freeze
    super.preUpdate(time, delta);

    const body = this.body as Phaser.Physics.Arcade.Body; // a dynamic body: made by physics.add.existing
    const onGround = body.blocked.down;

    if (this.cursors.left.isDown) {
      this.setVelocityX(-RUN_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(RUN_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (jumpPressed && onGround) {
      this.setVelocityY(-JUMP_SPEED);
      this.scene.sound.play(JUMP_SOUND);
    }

    if (!onGround) {
      this.play(body.velocity.y < 0 ? JUMP : FALL, true);
    } else if (body.velocity.x !== 0) {
      this.play(RUN, true);
    } else {
      this.play(IDLE, true);
    }
  }

  // back to (x, y), standing still - after touching something nasty
  public respawn(x: number, y: number): void {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.scene.tweens.add({ targets: this, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 });
  }
}
