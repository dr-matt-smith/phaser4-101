import Phaser from "phaser";
import { Ball, BALL_FILE, BALL_KEY } from "../objects/Ball.ts";
import { Cannonball } from "../objects/Cannonball.ts";
import { Crate, CRATE_FILE, CRATE_KEY } from "../objects/Crate.ts";
import { Flipper } from "../objects/Flipper.ts";   // CHALLENGE 6
import { Polygon } from "../objects/Polygon.ts";

// StackScene - a tower and a pyramid of crates in a Matter.js world, to knock down and throw about
//
// Drag anything with the mouse. SPACE fires a cannonball at the pointer; 1-4 drop a crate, a
// ball, a hexagon or a triangle at the pointer; V shows the bodies; R builds everything again.

const SKY_KEY = "sky";
const SKY_FILE = "assets/images/sky.png";
const GROUND_KEY = "ground";
const GROUND_FILE = "assets/images/ground.png";
const HIT_KEY = "hit";
const HIT_FILE = "assets/audio/hit.wav";

const FLOOR_Y = 536;             // the top of the ground
const CRATE_SIZE = 48;
const PYRAMID_ROWS = 4;
const PYRAMID_X = 650;           // the middle of the pyramid
const TOWER_HEIGHT = 7;          // crates
const TOWER_X = 440;
const CANNON_X = 60;
const CANNON_Y = 480;
const CANNON_SPEED = 22;         // Matter velocities are pixels per STEP (a 60th of a second)
const HEXAGON_COLOUR = 0x2a9d8f;
const TRIANGLE_COLOUR = 0xf4a261;
const FLIPPER_PIN_X = 130;       // CHALLENGE 6: where the flipper is pinned
const FLIPPER_PIN_Y = 440;

export class StackScene extends Phaser.Scene {
  // Fields set in create() are declared with `!`: "trust me, this will be set before it is
  // used". TypeScript cannot see that create() always runs first.
  private info!: Phaser.GameObjects.Text;
  private flipper!: Flipper;                  // CHALLENGE 6
  private flipKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("StackScene");
  }

  preload(): void {
    this.load.image(SKY_KEY, SKY_FILE);
    this.load.image(GROUND_KEY, GROUND_FILE);
    this.load.image(CRATE_KEY, CRATE_FILE);
    this.load.image(BALL_KEY, BALL_FILE);
    this.load.audio(HIT_KEY, HIT_FILE);
  }

  create(): void {
    this.add.image(0, 0, SKY_KEY).setOrigin(0);
    this.matter.world.drawDebug = false;   // V shows it
    Cannonball.makeTexture(this);

    // the ground: a Matter image whose body is STATIC - it never moves, whatever hits it
    this.matter.add.image(400, 600 - 32, GROUND_KEY, undefined, { isStatic: true });

    // walls at the left and right edges (none at the top or bottom - the ground is the bottom).
    // setBounds(x, y, width, height, thickness, left, right, top, bottom)
    this.matter.world.setBounds(0, -400, 800, 1000, 64, true, true, false, false);

    this.buildPyramid();
    this.buildTower();

    // CHALLENGE 6: the flipper, and the key that flips it
    this.flipper = new Flipper(this, FLIPPER_PIN_X, FLIPPER_PIN_Y);
    this.flipKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // drag any body with the mouse or a finger: a springy "constraint" joins the body to the
    // pointer while the button is held
    this.matter.add.mouseSpring({ stiffness: 0.2 });

    this.setUpKeys();

    this.info = this.add.text(12, 10, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#1d3557cc",
      padding: { x: 8, y: 6 },
    });

    // the cannon's position, so you can see where the cannonballs come from
    this.add.circle(CANNON_X, CANNON_Y, 10, 0x1b1f2a);
  }

  override update(): void {
    this.flipper.swing(this.flipKey.isDown);   // CHALLENGE 6

    const bodies = this.matter.world.getAllBodies().length;
    this.info.setText([
      "drag with the mouse    SPACE fire at the pointer    1 crate  2 ball  3 hexagon  4 triangle",
      `Z flipper    V show bodies    R rebuild    bodies in the world: ${bodies}`,   // CHALLENGE 6
    ]);
  }

  // rows of crates, each row one crate shorter, sitting on the row below
  private buildPyramid(): void {
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      const count = PYRAMID_ROWS - row;
      const y = FLOOR_Y - CRATE_SIZE / 2 - row * CRATE_SIZE;
      const left = PYRAMID_X - (count - 1) * CRATE_SIZE / 2;
      for (let i = 0; i < count; i++) {
        new Crate(this, left + i * CRATE_SIZE, y);
      }
    }
  }

  // crates one on top of another. Placed exactly, touching, they stand - until something hits them
  private buildTower(): void {
    for (let row = 0; row < TOWER_HEIGHT; row++) {
      new Crate(this, TOWER_X, FLOOR_Y - CRATE_SIZE / 2 - row * CRATE_SIZE);
    }
  }

  private fire(): void {
    const pointer = this.input.activePointer;
    const cannonball = new Cannonball(this, CANNON_X, CANNON_Y);

    // aim at the pointer: the angle from the cannon to the pointer, turned into an x and y speed
    const angle = Phaser.Math.Angle.Between(CANNON_X, CANNON_Y, pointer.worldX, pointer.worldY);
    cannonball.setVelocity(Math.cos(angle) * CANNON_SPEED, Math.sin(angle) * CANNON_SPEED);

    // a thud, the first time it hits something
    let hit = false;
    cannonball.setOnCollide(() => {
      if (!hit) {
        hit = true;
        this.sound.play(HIT_KEY, { volume: 0.6 });
      }
    });
  }

  private setUpKeys(): void {
    const keyboard = this.input.keyboard!;

    keyboard.on("keydown-SPACE", () => {
      this.fire();
    });
    keyboard.on("keydown-ONE", () => {
      new Crate(this, this.dropX(), this.dropY());
    });
    keyboard.on("keydown-TWO", () => {
      new Ball(this, this.dropX(), this.dropY());
    });
    keyboard.on("keydown-THREE", () => {
      new Polygon(this, this.dropX(), this.dropY(), 6, HEXAGON_COLOUR);
    });
    keyboard.on("keydown-FOUR", () => {
      new Polygon(this, this.dropX(), this.dropY(), 3, TRIANGLE_COLOUR);
    });
    keyboard.on("keydown-V", () => {
      this.toggleDebug();
    });
    keyboard.on("keydown-R", () => {
      this.scene.restart();
    });
  }

  // where to drop a new body: at the pointer, but never inside the ground or the walls
  private dropX(): number {
    return Phaser.Math.Clamp(this.input.activePointer.worldX, 40, 760);
  }

  private dropY(): number {
    return Math.min(this.input.activePointer.worldY, FLOOR_Y - 40);
  }

  // V: debug drawing on and off. The config switches debug on (so Phaser makes the Graphics it
  // draws with, and gets every body ready to be drawn), and create() switches the drawing off.
  private toggleDebug(): void {
    const world = this.matter.world;
    world.drawDebug = !world.drawDebug;
    world.debugGraphic.clear();         // or the last drawing would stay on screen
  }
}
