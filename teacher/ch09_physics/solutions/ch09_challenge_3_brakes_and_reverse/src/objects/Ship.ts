import Phaser from "phaser";

// Ship - the player's ship: turns, thrusts, drifts, and never goes faster than MAX_SPEED
//
// It never sets its own position or angle. It only sets ACCELERATIONS - "speed up this way" -
// and Arcade Physics works out the velocity, and from that the position, every step.

export const SHIP_KEY = "ship";
export const SHIP_FILE = "assets/images/player_ship.png";

const THRUST = 300;          // acceleration while UP is held, pixels per second per second
const DAMPING = 0.6;         // with no thrust, keep 60% of the speed each second
const MAX_SPEED = 350;       // pixels per second, in any direction
// CHALLENGE 3: braking keeps only a tiny fraction of the speed each second - from top speed,
// about 3 px/s is left after half a second
const BRAKE_DAMPING = 0.0001;

const TURN_ACCELERATION = 1500; // degrees per second per second
const TURN_DRAG = 1500;         // slows the turn when LEFT and RIGHT are let go
const MAX_TURN = 270;           // degrees per second

const BODY_RADIUS = 20;      // the picture is 64 x 48; a circle 40 across covers the ship's middle

export class Ship extends Phaser.Physics.Arcade.Image {
  // Arcade's body for this ship. physics.add.existing() always makes a dynamic body, but the
  // type of `this.body` says it could also be static or missing - so we keep it, cast, here.
  private readonly arcadeBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SHIP_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;

    // Arcade bodies never turn - the picture rotates, the body stays put. A circle looks the
    // same at every angle, so it fits the ship whichever way it points.
    this.arcadeBody.setCircle(BODY_RADIUS, this.width / 2 - BODY_RADIUS, this.height / 2 - BODY_RADIUS);

    // damping: drag as a fraction of the speed kept each second, not pixels per second taken away
    this.setDamping(true);
    this.setDrag(DAMPING);
    // a true speed limit. setMaxVelocity(x, y) limits each axis on its own, so going
    // diagonally you could reach 1.4 times the limit
    this.arcadeBody.setMaxSpeed(MAX_SPEED);

    // turning works just like moving: an angular acceleration, a drag, and a maximum
    this.setAngularDrag(TURN_DRAG);
    this.arcadeBody.maxAngular = MAX_TURN;
  }

  // -1 turns left (anticlockwise), 1 turns right, 0 lets the turn die away
  public turn(direction: number): void {
    this.setAngularAcceleration(direction * TURN_ACCELERATION);
  }

  // CHALLENGE 3: power 1 is full thrust forwards, -0.5 half thrust backwards, 0 none
  public thrust(power: number): void {
    if (power !== 0) {
      // the picture points UP when rotation is 0, but Phaser's angles start pointing RIGHT
      // (0 = right, PI/2 = down). A quarter turn back puts them in line.
      const facing = this.rotation - Math.PI / 2;
      // write the result straight into the body's acceleration - no new vector needed
      // CHALLENGE 3: a negative power points the acceleration backwards
      this.scene.physics.velocityFromRotation(facing, THRUST * power, this.arcadeBody.acceleration);
    } else {
      // no acceleration: now (and only now) drag slows the ship down
      this.setAcceleration(0);
    }
  }

  // CHALLENGE 3: brakes are just much stronger damping. Drag only works with no acceleration, so
  // the scene switches the thrust off while the brakes are on
  public brake(on: boolean): void {
    this.setDrag(on ? BRAKE_DAMPING : DAMPING);
  }

  // how fast the ship is going, in pixels per second
  public get speed(): number {
    return this.arcadeBody.speed;
  }

  // the point at the back of the ship, where the exhaust comes out
  public get exhaustPoint(): Phaser.Math.Vector2 {
    const back = new Phaser.Math.Vector2();
    // 26 pixels from the centre, pointing the opposite way to the nose
    this.scene.physics.velocityFromRotation(this.rotation + Math.PI / 2, 26, back);
    return back.add(this);
  }

  // stop dead in the centre, pointing up - for a new life
  public respawn(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setRotation(0);
    this.setAngularVelocity(0);
    this.setAcceleration(0);
  }
}
