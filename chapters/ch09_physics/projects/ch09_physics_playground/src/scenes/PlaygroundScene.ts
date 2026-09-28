import Phaser from "phaser";
import { Ball, BALL_FILE, BALL_KEY } from "../objects/Ball.ts";
import { Crate, CRATE_FILE, CRATE_KEY } from "../objects/Crate.ts";
import { MovingPlatform, PLATFORM_FILE, PLATFORM_KEY } from "../objects/MovingPlatform.ts";

// PlaygroundScene - a box of balls and crates, and keys that change the laws of physics
//
// Every key changes one setting, for every body at once: gravity (G), ball bounce (B), drag (D), the
// moving platform's friction (F), slow motion (T) and pause (P). Click to drop a ball, C for a
// crate. V shows the bodies Arcade Physics is really using.

const GROUND_KEY = "ground";
const GROUND_FILE = "assets/images/ground.png";

const FLOOR_Y = 536;             // the top of the ground picture: the bottom of the physics world
const START_BALLS = 5;
const START_CRATES = 3;
const LAUNCH_SPEED = 250;        // most sideways speed a new ball is given, pixels per second
const CRATE_MASS = 3;            // a ball has the default mass, 1
const SLOW_MOTION = 3;           // world time scale: 3 = physics runs three times slower
const BOUNCE_SPEED = 30;         // slower than this off a wall is not counted as a bounce

// one choice for a setting: its name on screen and its value
interface Choice {
  name: string;
  value: number;
}

const GRAVITY_CHOICES: Choice[] = [
  { name: "earth", value: 600 },
  { name: "jupiter", value: 1500 },
  { name: "off", value: 0 },
  { name: "moon", value: 100 },
];

const BOUNCE_CHOICES: Choice[] = [
  { name: "a little", value: 0.5 },
  { name: "super", value: 0.9 },
  { name: "perfect", value: 1 },
  { name: "dead", value: 0 },
];

// drag has two modes: linear (take away this many px/s every second) and damping (keep this
// fraction of the speed every second). `damping` says which.
interface DragChoice extends Choice {
  damping: boolean;
}

const DRAG_CHOICES: DragChoice[] = [
  { name: "none", value: 0, damping: false },
  { name: "linear, 150 px/s every second", value: 150, damping: false },
  { name: "damping, keep 30% every second", value: 0.3, damping: true },
];

// Phaser's types say a game object's body might be dynamic, static, a Matter body, or missing.
// Every body this scene asks for is a dynamic Arcade body, so this says so - in one place.
function bodyOf(thing: Phaser.GameObjects.GameObject): Phaser.Physics.Arcade.Body {
  return thing.body as Phaser.Physics.Arcade.Body;
}

export class PlaygroundScene extends Phaser.Scene {
  // Fields set in create() are declared with `!`: "trust me, this will be set before it is
  // used". TypeScript cannot see that create() always runs first.
  private things!: Phaser.Physics.Arcade.Group;
  private platform!: MovingPlatform;
  private hud!: Phaser.GameObjects.Text;

  // which choice each setting is on - reset in init(), because the scene object is reused
  private gravityIndex = 0;
  private bounceIndex = 0;
  private dragIndex = 0;
  private platformFriction = 1;
  private wallBounces = 0;

  constructor() {
    super("PlaygroundScene");
  }

  init(): void {
    this.gravityIndex = 0;
    this.bounceIndex = 0;
    this.dragIndex = 0;
    this.platformFriction = 1;
    this.wallBounces = 0;
  }

  preload(): void {
    this.load.image(BALL_KEY, BALL_FILE);
    this.load.image(CRATE_KEY, CRATE_FILE);
    this.load.image(PLATFORM_KEY, PLATFORM_FILE);
    this.load.image(GROUND_KEY, GROUND_FILE);
  }

  create(): void {
    this.add.image(400, 600, GROUND_KEY).setOrigin(0.5, 1);
    this.physics.world.drawDebug = false;  // V shows it

    // the physics world starts as big as the game; stop it at the top of the ground instead
    this.physics.world.setBounds(0, 0, 800, FLOOR_Y);

    // a ledge that never moves: a STATIC body. Things bump into it, but gravity, velocity and
    // collisions never move it - and it costs almost nothing to check.
    const ledge = this.physics.add.staticImage(110, 250, PLATFORM_KEY);

    this.platform = new MovingPlatform(this, 400, 400);

    // everything that falls: balls and crates in one physics group
    this.things = this.physics.add.group();

    // colliders: things against each other, the ledge, and the platform
    this.physics.add.collider(this.things, this.things);
    this.physics.add.collider(this.things, ledge);
    this.physics.add.collider(this.things, this.platform);

    for (let i = 0; i < START_BALLS; i++) {
      this.addBall(Phaser.Math.Between(60, 740), Phaser.Math.Between(60, 200));
    }
    for (let i = 0; i < START_CRATES; i++) {
      this.addCrate(Phaser.Math.Between(300, 700), Phaser.Math.Between(60, 200));
    }

    // a body only reports hitting the edge of the world if its onWorldBounds is true (the balls
    // set it). Then the WORLD emits "worldbounds", with the body and which edges it hit.
    this.physics.world.on(
      Phaser.Physics.Arcade.Events.WORLD_BOUNDS,
      (body: Phaser.Physics.Arcade.Body, _up: boolean, down: boolean) => {
        // the floor does not count, and neither does a ball just leaning on a wall (it would
        // "hit" it every step): only a real bounce, that sends the ball back with some speed
        if (!down && body.velocity.length() > BOUNCE_SPEED) {
          this.wallBounces = this.wallBounces + 1;
          this.flash(body.gameObject as Phaser.Physics.Arcade.Image); // only images have onWorldBounds on
        }
      },
    );

    this.setUpKeys();

    this.hud = this.add.text(12, 10, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#1d2433cc",
      padding: { x: 8, y: 6 },
    }).setDepth(10);
  }

  override update(): void {
    // body.blocked says which ways a body is pushed against something that cannot give way: the
    // edge of the world, a static or immovable body - or a body that is itself blocked. It is
    // worked out afresh by every physics step. (body.touching is the same for ANY body.)
    let resting = 0;
    this.things.getChildren().forEach((child) => {
      if (bodyOf(child).blocked.down) {
        resting = resting + 1;
      }
    });

    const world = this.physics.world;
    const gravity = GRAVITY_CHOICES[this.gravityIndex];
    this.hud.setText([
      `G gravity: ${gravity.name} (${gravity.value})    B ball bounce: ${BOUNCE_CHOICES[this.bounceIndex].name}` +
      `    D drag: ${DRAG_CHOICES[this.dragIndex].name}`,
      `F platform friction: ${this.platformFriction}    T slow motion: ${world.timeScale > 1 ? "on" : "off"}` +
      `    P paused: ${world.isPaused ? "yes" : "no"}    V show bodies: ${world.drawDebug ? "on" : "off"}`,
      `bodies: ${this.things.getLength()}    resting (blocked.down): ${resting}    wall bounces: ${this.wallBounces}`,
    ]);
  }

  // ---- making things ----

  private addBall(x: number, y: number): void {
    const ball = new Ball(this, x, y);
    // add to the group FIRST: a physics group resets the bodies it is given to its own defaults
    // (no bounce, no velocity...), so anything set before this line would be lost
    this.things.add(ball);
    bodyOf(ball).onWorldBounds = true;
    ball.setVelocityX(Phaser.Math.Between(-LAUNCH_SPEED, LAUNCH_SPEED));
    this.applySettings(ball);
  }

  private addCrate(x: number, y: number): void {
    const crate = new Crate(this, x, y);
    this.things.add(crate);
    crate.setMass(CRATE_MASS);
    this.applySettings(crate);
  }

  // give one body the current drag and (balls only) bounce. Crates keep the default bounce, 0:
  // a crate that bounced would never sit still on the moving platform long enough to be carried
  private applySettings(thing: Phaser.Physics.Arcade.Image): void {
    const drag = DRAG_CHOICES[this.dragIndex];
    thing.setCollideWorldBounds(true);
    thing.setDamping(drag.damping);
    thing.setDrag(drag.value);
    if (thing instanceof Ball) {
      thing.setBounce(BOUNCE_CHOICES[this.bounceIndex].value);
    }
  }

  private applyToAll(): void {
    this.things.getChildren().forEach((child) => {
      this.applySettings(child as Phaser.Physics.Arcade.Image); // only Balls and Crates are added
    });
  }

  // a quick white flash, so you can see which ball bounced off the wall
  private flash(thing: Phaser.Physics.Arcade.Image): void {
    thing.setTint(0xffffff);
    thing.setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(80, () => {
      thing.clearTint();
    });
  }

  // ---- the keys ----

  private setUpKeys(): void {
    const keyboard = this.input.keyboard!;

    // G: the world's gravity - shared by every body (a body can add its own with setGravityY)
    keyboard.on("keydown-G", () => {
      this.gravityIndex = (this.gravityIndex + 1) % GRAVITY_CHOICES.length;
      this.physics.world.gravity.y = GRAVITY_CHOICES[this.gravityIndex].value;
    });

    keyboard.on("keydown-B", () => {
      this.bounceIndex = (this.bounceIndex + 1) % BOUNCE_CHOICES.length;
      this.applyToAll();
    });

    keyboard.on("keydown-D", () => {
      this.dragIndex = (this.dragIndex + 1) % DRAG_CHOICES.length;
      this.applyToAll();
    });

    // F: friction belongs to the platform - it is how much of ITS movement it passes on
    keyboard.on("keydown-F", () => {
      this.platformFriction = this.platformFriction === 1 ? 0 : 1;
      this.platform.setFriction(this.platformFriction, 0);
    });

    // T: the physics clock runs slower - but the game loop, and everything else, does not
    keyboard.on("keydown-T", () => {
      const world = this.physics.world;
      world.timeScale = world.timeScale === 1 ? SLOW_MOTION : 1;
    });

    // P: freeze the physics world. Nothing moves, no colliders run - but the scene still
    // updates, draws, and listens to keys
    keyboard.on("keydown-P", () => {
      if (this.physics.world.isPaused) {
        this.physics.resume();
      } else {
        this.physics.pause();
      }
    });

    keyboard.on("keydown-V", () => {
      this.toggleDebug();
    });

    keyboard.on("keydown-C", () => {
      const pointer = this.input.activePointer;
      this.addCrate(pointer.worldX, Math.min(pointer.worldY, FLOOR_Y - 30));
    });

    keyboard.on("keydown-R", () => {
      this.scene.restart();
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.addBall(pointer.worldX, Math.min(pointer.worldY, FLOOR_Y - 40));
    });
  }

  // V: debug drawing on and off. The config switches debug on (so Phaser makes the Graphics it
  // draws with, and gets every body ready to be drawn), and create() switches the drawing off.
  private toggleDebug(): void {
    const world = this.physics.world;
    world.drawDebug = !world.drawDebug;
    world.debugGraphic.clear();         // or the last drawing would stay on screen
  }

}
