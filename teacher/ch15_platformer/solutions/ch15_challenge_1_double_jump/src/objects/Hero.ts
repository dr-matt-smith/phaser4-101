import Phaser from "phaser";
import { HERO_KEY, JUMP_SOUND } from "../assets.ts";

// Hero - the player: runs, jumps, and chooses its own animation
//
// A Phaser.Physics.Arcade.Sprite is a Sprite (so it can play animations) that can be given an
// Arcade Physics body (so gravity pulls it down and platforms hold it up). Like Chapter 1's Ball,
// the hero looks after itself: every frame, preUpdate() reads the keys and sets its velocity.
// The physics engine then does the moving - and stops it going through platforms.

const RUN_SPEED = 200; // pixels per second
const JUMP_SPEED = 520; // pixels per second, upwards, at the moment of the jump
const AIR_JUMP_SPEED = 420; // CHALLENGE 1: the jump in the air is a little weaker
const AIR_JUMPS = 1; // CHALLENGE 1: how many extra jumps the hero gets in the air

// the picture is 32 x 48 with a little empty space round the hero; a body slightly smaller
// than the picture feels fairer, and fits through gaps the picture looks like it should
const BODY_WIDTH = 18;
const BODY_HEIGHT = 42;

// the animation keys - made once, in createAnimations(), and used by every Hero
const IDLE = "hero-idle";
const RUN = "hero-run";
const JUMP = "hero-jump";
const FALL = "hero-fall";

export class Hero extends Phaser.Physics.Arcade.Sprite {
  // Phaser types `body` as "a dynamic body, a static body, or null", because it cannot know which
  // this sprite will get. It is always a dynamic body (the constructor makes it), and `declare`
  // tells TypeScript so. It adds no code - it only narrows the type.
  declare body: Phaser.Physics.Arcade.Body;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private airJumpsLeft = AIR_JUMPS; // CHALLENGE 1: used up in the air, given back on landing

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HERO_KEY, 0);

    scene.add.existing(this); // draw it, and call its preUpdate() every frame
    scene.physics.add.existing(this); // give it a dynamic Arcade Physics body

    // the body is centred across the picture, and its bottom is the bottom of the feet
    this.body.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.body.setOffset((this.width - BODY_WIDTH) / 2, this.height - BODY_HEIGHT);
    this.setCollideWorldBounds(true);

    // the four arrow keys, plus SPACE and SHIFT, as Key objects we can ask "are you down?"
    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  // Animations belong to the whole game, so they are made once - and only if they do not exist
  // yet, because a scene that restarts would otherwise try to make them again.
  public static createAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists(IDLE)) {
      return;
    }
    scene.anims.create({
      key: IDLE,
      frames: scene.anims.generateFrameNumbers(HERO_KEY, { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });
    scene.anims.create({
      key: RUN,
      frames: scene.anims.generateFrameNumbers(HERO_KEY, { start: 2, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({ key: JUMP, frames: [{ key: HERO_KEY, frame: 8 }] });
    scene.anims.create({ key: FALL, frames: [{ key: HERO_KEY, frame: 9 }] });
  }

  protected override preUpdate(time: number, delta: number): void {
    // a Sprite's own preUpdate() moves its animation on - without this line the hero never animates
    super.preUpdate(time, delta);

    this.run();
    this.jump();
    this.animate();
  }

  // left and right set the speed straight away; no key means stop dead
  private run(): void {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-RUN_SPEED);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(RUN_SPEED);
    } else {
      this.setVelocityX(0);
    }
  }

  // jump only when standing on something. body.blocked.down is true when the physics engine
  // stopped the body moving down this step - it is standing on a platform, or the ground
  private jump(): void {
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space);

    // CHALLENGE 1: standing on something gives the air jumps back
    if (this.body.blocked.down) {
      this.airJumpsLeft = AIR_JUMPS;
    }

    if (jumpPressed && this.body.blocked.down) {
      this.setVelocityY(-JUMP_SPEED); // negative y is UP
      this.scene.sound.play(JUMP_SOUND);
    } else if (jumpPressed && this.airJumpsLeft > 0) {
      // CHALLENGE 1: a second jump, in the air - it REPLACES the speed, so it works the same
      // whether the hero is still rising or already falling
      this.airJumpsLeft = this.airJumpsLeft - 1;
      this.setVelocityY(-AIR_JUMP_SPEED);
      this.scene.sound.play(JUMP_SOUND, { rate: 1.3 }); // a higher-pitched jump sound
    }
  }

  // a tiny state machine: the hero's state is worked out from its body every frame, and each
  // state has one animation. play(key, true) does nothing if that animation is already playing
  private animate(): void {
    const velocity = this.body.velocity;

    if (!this.body.blocked.down) {
      this.play(velocity.y < 0 ? JUMP : FALL, true);
    } else if (velocity.x !== 0) {
      this.play(RUN, true);
    } else {
      this.play(IDLE, true);
    }

    // the picture faces right; flip it when moving left (and keep facing the same way when stopped)
    if (velocity.x < 0) {
      this.setFlipX(true);
    } else if (velocity.x > 0) {
      this.setFlipX(false);
    }
  }
}
