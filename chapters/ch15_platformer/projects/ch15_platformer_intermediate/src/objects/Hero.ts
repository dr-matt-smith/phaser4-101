import Phaser from "phaser";
import { HERO_KEY, HURT_SOUND, JUMP_SOUND } from "../assets.ts";

// Hero - the player, with a jump that FEELS right
//
// The simple version set the speed straight from the keys. This one adds the small things that
// make a platformer feel good to play:
//   - acceleration and drag, so the hero speeds up and slows down instead of starting and
//     stopping dead
//   - a variable jump: let go of the key early, and the jump is cut short
//   - coyote time: a jump still works for a moment after running off a ledge
//   - jump buffering: a jump pressed just BEFORE landing happens as soon as the hero lands
// and a "hurt" state, which the scene switches on when the hero touches something nasty.

const MAX_RUN_SPEED = 220; // pixels per second
const RUN_ACCELERATION = 1400; // pixels per second, per second, while a key is held
const RUN_DRAG = 1800; // how quickly the hero slows down when no key is held
const MAX_FALL_SPEED = 700; // so a long fall never gets fast enough to go through a floor
const JUMP_SPEED = 600; // upwards, at the moment of the jump
const JUMP_CUT = 0.4; // letting go early keeps this fraction of the upward speed
const COYOTE_TIME = 100; // ms after leaving the ground that a jump still counts
const JUMP_BUFFER = 120; // ms before landing that a jump press is remembered
const BOUNCE_SPEED = 420; // upwards, after stomping on an enemy
const HURT_SPEED = 450; // the little hop the hero does when hurt

const BODY_WIDTH = 18;
const BODY_HEIGHT = 42;

const IDLE = "hero-idle";
const RUN = "hero-run";
const JUMP = "hero-jump";
const FALL = "hero-fall";
const HURT = "hero-hurt";

// what the hero is doing - one animation for each. A union of string literals (Chapter 12) is
// all a small state machine needs
type HeroState = "idle" | "run" | "jump" | "fall" | "hurt";

export class Hero extends Phaser.Physics.Arcade.Sprite {
  // this sprite always has a dynamic body - see the simple version's Hero for why `declare`
  declare body: Phaser.Physics.Arcade.Body;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private heroState: HeroState = "idle";
  private lastOnFloor = -1000; // when the hero was last standing on something (ms)
  private jumpPressedAt = -1000; // when jump was last pressed (ms)

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HERO_KEY, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // (x, y) is where the FEET go - that is how the level marks the start
    this.setOrigin(0.5, 1);
    this.body.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.body.setOffset((this.width - BODY_WIDTH) / 2, this.height - BODY_HEIGHT);
    this.setCollideWorldBounds(true);

    // drag slows the hero only while its acceleration is zero - that is, when no key is held
    this.setDragX(RUN_DRAG);
    this.setMaxVelocity(MAX_RUN_SPEED, MAX_FALL_SPEED);

    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  // made once for the whole game - and only if they do not exist yet, as the title scene that
  // calls this runs again every time the player goes back to it
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
    scene.anims.create({ key: HURT, frames: [{ key: HERO_KEY, frame: 10 }] });
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // once hurt, the keys do nothing: the hero just falls off the screen
    if (this.heroState === "hurt") {
      return;
    }
    this.run();
    this.jump(time);
    this.setHeroState(this.chooseState());
  }

  // the scene asks: can this hero still be hurt, or stomp things?
  public isHurt(): boolean {
    return this.heroState === "hurt";
  }

  // after a stomp: spring up off the enemy's head
  public bounce(): void {
    this.setVelocityY(-BOUNCE_SPEED);
  }

  // the classic platformer "ouch": a hop, then a fall straight through the floor
  public hurt(): void {
    if (this.heroState === "hurt") {
      return;
    }
    this.setHeroState("hurt");
    this.scene.sound.play(HURT_SOUND);

    this.setAcceleration(0, 0);
    this.setVelocity(0, -HURT_SPEED);
    this.body.checkCollision.none = true; // collide with nothing - not even the ground
    this.setCollideWorldBounds(false);
  }

  private run(): void {
    if (this.cursors.left.isDown) {
      this.setAccelerationX(-RUN_ACCELERATION);
    } else if (this.cursors.right.isDown) {
      this.setAccelerationX(RUN_ACCELERATION);
    } else {
      this.setAccelerationX(0); // let drag bring the hero to a stop
    }
  }

  private jump(time: number): void {
    // remember WHEN things happened, rather than only whether they are happening now
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
      // use both up, so one press cannot make two jumps
      this.lastOnFloor = -1000;
      this.jumpPressedAt = -1000;
    }

    // a short tap makes a short hop: letting go while still going up cuts the speed
    const released = Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.space);
    if (released && this.body.velocity.y < 0) {
      this.setVelocityY(this.body.velocity.y * JUMP_CUT);
    }
  }

  // which state the body says the hero is in
  private chooseState(): HeroState {
    const velocity = this.body.velocity;
    if (!this.body.blocked.down) {
      return velocity.y < 0 ? "jump" : "fall";
    }
    // with drag, the speed takes a moment to reach zero - count "nearly stopped" as stopped
    return Math.abs(velocity.x) > 10 ? "run" : "idle";
  }

  // every change of state goes through here, so each state's animation is set in one place
  private setHeroState(next: HeroState): void {
    if (next !== this.heroState) {
      this.heroState = next;
      const animations: Record<HeroState, string> = { idle: IDLE, run: RUN, jump: JUMP, fall: FALL, hurt: HURT };
      this.play(animations[next]);
    }

    // face the way the keys say, even while sliding to a stop
    if (this.body.acceleration.x < 0) {
      this.setFlipX(true);
    } else if (this.body.acceleration.x > 0) {
      this.setFlipX(false);
    }
  }
}
