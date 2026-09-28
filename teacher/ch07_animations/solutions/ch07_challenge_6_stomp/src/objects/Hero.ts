import Phaser from "phaser";
import { HERO_FALL, HERO_HURT, HERO_IDLE, HERO_JUMP, HERO_RUN, HERO_SHEET } from "../assets.ts";

// Hero - a runner and jumper, driven by the arrow keys, with a small STATE MACHINE
//
// The hero is always in exactly one state. Each state has its own animation, and its own rules
// for which state comes next:
//
//   idle  -> run (left/right held)   -> jump (UP pressed)
//   run   -> idle (keys let go)      -> jump (UP pressed)
//   jump  -> fall (starts coming down)
//   fall  -> idle or run (lands)
//   any   -> hurt (hurt() called)    -> idle or fall (when the hurt animation completes)
//
// There is no physics engine here (that is Chapter 8 and 9): the hero moves itself, with a speed
// and a pretend gravity, in preUpdate().

export type HeroState = "idle" | "run" | "jump" | "fall" | "hurt";

// which animation each state plays. Record<HeroState, string> is "an object with one string for
// EVERY HeroState" - leave a state out, and the build says so
const ANIMATIONS: Record<HeroState, string> = {
  idle: HERO_IDLE,
  run: HERO_RUN,
  jump: HERO_JUMP,
  fall: HERO_FALL,
  hurt: HERO_HURT,
};

const SCALE = 2;
const RUN_SPEED = 260;           // pixels per second
const JUMP_SPEED = 700;          // pixels per second, upwards, at the moment of the jump
const GRAVITY = 1800;            // pixels per second, per second
const KNOCKBACK_X = 200;         // how hard being hurt pushes the hero back...
const KNOCKBACK_Y = 350;         // ...and up
const HURT_TINT = 0xff9090;
const STOMP_BOUNCE = 520;        // CHALLENGE 6: upward speed after landing on a slime

export class Hero extends Phaser.GameObjects.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private groundY: number;
  private currentState: HeroState = "idle";
  private velocityX = 0;
  private velocityY = 0;

  // groundY is where the hero's feet rest
  constructor(scene: Phaser.Scene, x: number, groundY: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(scene, x, groundY, HERO_SHEET, 0);

    this.cursors = cursors;
    this.groundY = groundY;

    // (x, y) is the hero's FEET - which makes "standing on the ground" simply y === groundY
    this.setOrigin(0.5, 1);
    this.setScale(SCALE);
    this.play(ANIMATIONS[this.currentState]);

    scene.add.existing(this);
  }

  public getHeroState(): HeroState {
    return this.currentState;
  }

  // CHALLENGE 6: true while coming down from a jump - the only time a slime can be stomped
  public isFalling(): boolean {
    return this.currentState === "fall";
  }

  // CHALLENGE 6: called by the scene after a stomp - spring back up off the slime
  public bounceOff(): void {
    this.velocityY = -STOMP_BOUNCE;
    this.changeState("jump");
  }

  // called by the scene: knocked back, the hurt animation, then back to normal
  // CHALLENGE 6: fromX (optional) is where the hurt came from - the hero is knocked away from it
  public hurt(fromX?: number): void {
    if (this.currentState === "hurt") {
      return;
    }
    this.changeState("hurt");
    this.setTint(HURT_TINT);

    // knocked away from the way the hero is facing, and a little way up
    if (fromX === undefined) {
      this.velocityX = this.flipX ? KNOCKBACK_X : -KNOCKBACK_X;
    } else {
      this.velocityX = this.x < fromX ? -KNOCKBACK_X : KNOCKBACK_X; // CHALLENGE 6
    }
    this.velocityY = -KNOCKBACK_Y;

    // hurt has no repeat, so it completes - and this listener hears it, once
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + HERO_HURT, () => {
      this.clearTint();
      this.changeState(this.isOnGround() ? "idle" : "fall");
    });
  }

  // A Sprite has a preUpdate() of its own - it is what moves the animation on to the next frame.
  // So this one is an override, and it MUST call super.preUpdate(): leave that out and the hero
  // moves about stuck on one frame.
  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const seconds = delta / 1000;
    if (this.currentState !== "hurt") {
      this.readKeys();
    }
    this.move(seconds);
    this.updateState();
  }

  // left/right set the speed across; UP jumps - but only from the ground
  private readKeys(): void {
    this.velocityX = 0;
    if (this.cursors.left.isDown) {
      this.velocityX = -RUN_SPEED;
    } else if (this.cursors.right.isDown) {
      this.velocityX = RUN_SPEED;
    }

    // the frames face right; flipping the picture makes them face left
    if (this.velocityX !== 0) {
      this.setFlipX(this.velocityX < 0);
    }

    // JustDown: true only on the first frame the key is down, so holding UP is one jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.isOnGround()) {
      this.velocityY = -JUMP_SPEED;
      this.changeState("jump");
    }
  }

  // speed x time = distance, and gravity pulls the speed downwards all the time
  private move(seconds: number): void {
    this.velocityY = this.velocityY + GRAVITY * seconds;
    this.x = this.x + this.velocityX * seconds;
    this.y = this.y + this.velocityY * seconds;

    // landed: stand on the ground
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      if (this.currentState === "hurt") {
        this.velocityX = 0;
      }
    }

    // keep the whole hero on the screen
    const halfWidth = this.displayWidth / 2;
    this.x = Phaser.Math.Clamp(this.x, halfWidth, this.scene.scale.width - halfWidth);
  }

  // the state machine: the rules for leaving each state
  private updateState(): void {
    switch (this.currentState) {
      case "idle":
      case "run":
        this.changeState(this.velocityX === 0 ? "idle" : "run");
        break;
      case "jump":
        if (this.velocityY >= 0) {
          this.changeState("fall");
        }
        break;
      case "fall":
        if (this.isOnGround()) {
          this.changeState(this.velocityX === 0 ? "idle" : "run");
        }
        break;
      case "hurt":
        // nothing: the ANIMATION_COMPLETE listener in hurt() ends this state
        break;
    }
  }

  // the one place the state changes - and so the one place an animation is started
  private changeState(next: HeroState): void {
    if (next === this.currentState) {
      return;               // already in that state: do NOT restart its animation
    }
    this.currentState = next;
    this.play(ANIMATIONS[next]);
  }

  private isOnGround(): boolean {
    return this.y >= this.groundY;
  }
}
