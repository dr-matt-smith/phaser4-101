import Phaser from "phaser";
import { HERO_KEY, HURT_SOUND, JUMP_SOUND } from "../assets.ts";

// Hero - the intermediate version's hero, plus:
//   - climbing ladders (a new "climb" state, with gravity switched off)
//   - coming back to life at a checkpoint, and a moment of flashing invulnerability after
//
// The hero does not know about tilemaps. To find ladders it is given a FUNCTION that answers
// "is there a ladder at this point, and if so, where is its middle?" - so the same Hero would
// work with ladders made any other way.

const MAX_RUN_SPEED = 220;
const RUN_ACCELERATION = 1400;
const RUN_DRAG = 1800;
const MAX_FALL_SPEED = 700;
const JUMP_SPEED = 600;
const JUMP_CUT = 0.4;
const COYOTE_TIME = 100;
const JUMP_BUFFER = 120;
const BOUNCE_SPEED = 420;
const HURT_SPEED = 450;
const CLIMB_SPEED = 140; // pixels per second, up or down a ladder
const SAFE_TIME = 1500; // ms of invulnerability after coming back to life

const BODY_WIDTH = 18;
const BODY_HEIGHT = 42;

const IDLE = "hero-idle";
const RUN = "hero-run";
const JUMP = "hero-jump";
const FALL = "hero-fall";
const HURT = "hero-hurt";
const CLIMB = "hero-climb";

type HeroState = "idle" | "run" | "jump" | "fall" | "climb" | "hurt";

// "is there a ladder at (x, y)?" - the answer is the ladder's centre x, or null for no ladder
export type LadderFinder = (x: number, y: number) => number | null;

export class Hero extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private findLadder: LadderFinder;
  private heroState: HeroState = "idle";
  private lastOnFloor = -1000;
  private jumpPressedAt = -1000;
  private safeUntil = 0; // cannot be hurt until this time (ms)

  constructor(scene: Phaser.Scene, x: number, y: number, findLadder: LadderFinder) {
    super(scene, x, y, HERO_KEY, 0);
    this.findLadder = findLadder;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.body.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.body.setOffset((this.width - BODY_WIDTH) / 2, this.height - BODY_HEIGHT);
    this.setCollideWorldBounds(true);
    this.setDragX(RUN_DRAG);
    this.setMaxVelocity(MAX_RUN_SPEED, MAX_FALL_SPEED);

    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  public static createAnimations(scene: Phaser.Scene): void {
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
    scene.anims.create({ key: HURT, frames: [{ key: HERO_KEY, frame: 10 }] });
    // there is no climbing picture, so the jump and fall frames take turns
    scene.anims.create({
      key: CLIMB,
      frames: scene.anims.generateFrameNumbers(HERO_KEY, { frames: [8, 9] }),
      frameRate: 6,
      repeat: -1,
    });
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.heroState === "hurt") {
      return;
    }
    if (this.heroState === "climb") {
      this.climb(time);
      return;
    }
    if (this.tryToStartClimbing()) {
      return;
    }
    this.run();
    this.jump(time);
    this.setHeroState(this.chooseState());
  }

  public isHurt(): boolean {
    return this.heroState === "hurt";
  }

  public isClimbing(): boolean {
    return this.heroState === "climb";
  }

  // hurt, or still flashing after coming back?
  public canBeHurt(): boolean {
    return this.heroState !== "hurt" && this.scene.time.now > this.safeUntil;
  }

  public bounce(): void {
    this.setVelocityY(-BOUNCE_SPEED);
  }

  public hurt(): void {
    if (!this.canBeHurt()) {
      return;
    }
    this.setHeroState("hurt");
    this.scene.sound.play(HURT_SOUND);
    this.body.setAllowGravity(true); // in case it was on a ladder
    this.setAcceleration(0, 0);
    this.setVelocity(0, -HURT_SPEED);
    this.body.checkCollision.none = true;
    this.setCollideWorldBounds(false);
  }

  // back to life at (x, y) - feet first - flashing, and safe for a moment
  public respawn(x: number, y: number): void {
    this.body.reset(x, y); // moves the sprite AND its body, and stops it
    this.body.checkCollision.none = false;
    this.setCollideWorldBounds(true);
    this.setHeroState("idle");

    this.safeUntil = this.scene.time.now + SAFE_TIME;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: SAFE_TIME / 200 - 1,
      onComplete: () => this.setAlpha(1),
    });
  }

  private run(): void {
    if (this.cursors.left.isDown) {
      this.setAccelerationX(-RUN_ACCELERATION);
    } else if (this.cursors.right.isDown) {
      this.setAccelerationX(RUN_ACCELERATION);
    } else {
      this.setAccelerationX(0);
    }
  }

  private jump(time: number): void {
    if (this.body.blocked.down) {
      this.lastOnFloor = time;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.jumpPressedAt = time;
    }

    const recentlyOnFloor = time - this.lastOnFloor <= COYOTE_TIME;
    const recentlyPressed = time - this.jumpPressedAt <= JUMP_BUFFER;

    if (recentlyOnFloor && recentlyPressed) {
      this.setVelocityY(-JUMP_SPEED);
      this.scene.sound.play(JUMP_SOUND);
      this.lastOnFloor = -1000;
      this.jumpPressedAt = -1000;
    }

    const released = Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.space);
    if (released && this.body.velocity.y < 0) {
      this.setVelocityY(this.body.velocity.y * JUMP_CUT);
    }
  }

  // UP with a ladder behind the hero, or DOWN while standing on the top of one, starts a climb
  private tryToStartClimbing(): boolean {
    let ladderX: number | null = null;
    if (this.cursors.up.isDown) {
      ladderX = this.findLadder(this.x, this.body.center.y);
    } else if (this.cursors.down.isDown && this.body.blocked.down) {
      ladderX = this.findLadder(this.x, this.body.bottom + 8);
    }
    if (ladderX === null) {
      return false;
    }

    this.setHeroState("climb");
    this.x = ladderX; // line up with the ladder, so the body fits the hole it goes through
    this.body.setAllowGravity(false);
    this.setAcceleration(0, 0);
    this.setVelocity(0, 0);
    return true;
  }

  private climb(time: number): void {
    const up = this.cursors.up.isDown;
    const down = this.cursors.down.isDown;
    this.setVelocityY(up ? -CLIMB_SPEED : down ? CLIMB_SPEED : 0);

    // only move the climbing animation on while actually moving
    if (up || down) {
      this.anims.resume();
    } else {
      this.anims.pause();
    }

    // leave the ladder: by jumping, by stepping sideways, by climbing off the top, or by
    // reaching the floor at the bottom
    const jumped = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    const sideways = this.cursors.left.isDown || this.cursors.right.isDown;
    const offTheTop = up && this.findLadder(this.x, this.body.bottom - 2) === null;
    const atTheBottom = down && this.body.blocked.down;

    if (jumped || sideways || offTheTop || atTheBottom) {
      this.body.setAllowGravity(true);
      this.anims.resume();
      this.setHeroState(this.chooseState());
      if (jumped) {
        this.lastOnFloor = time; // so jump() treats this as a jump from the ground
        this.jumpPressedAt = time;
        this.jump(time);
      }
    }
  }

  private chooseState(): HeroState {
    const velocity = this.body.velocity;
    if (!this.body.blocked.down) {
      return velocity.y < 0 ? "jump" : "fall";
    }
    return Math.abs(velocity.x) > 10 ? "run" : "idle";
  }

  private setHeroState(next: HeroState): void {
    if (next !== this.heroState) {
      this.heroState = next;
      const animations: Record<HeroState, string> = {
        idle: IDLE,
        run: RUN,
        jump: JUMP,
        fall: FALL,
        climb: CLIMB,
        hurt: HURT,
      };
      this.play(animations[next]);
    }

    if (this.body.acceleration.x < 0) {
      this.setFlipX(true);
    } else if (this.body.acceleration.x > 0) {
      this.setFlipX(false);
    }
  }
}
