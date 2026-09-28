import Phaser from "phaser";

// CHALLENGE 6: Flipper - a pinball flipper: a long thin Matter body, pinned near one end
//
// A world constraint pins a point near the flipper's LEFT end to a point in the world, so the
// only way the flipper can move is to swing round that pin. Every frame, swing() turns it
// towards "up" (while the key is held) or "down", using its angular velocity - and stops it
// when it gets there, so it never swings all the way round. Like the left flipper on a pinball
// table, it sends a ball up and to the right.

export const FLIPPER_KEY = "flipper";

const LENGTH = 150;
const THICKNESS = 20;
const PIN_INSET = 12;          // the pin is this far in from the left end
const PIN_TO_CENTRE = LENGTH / 2 - PIN_INSET;
// the tip is on the right, so turning anticlockwise (a smaller angle) lifts it
const UP_ANGLE = -30;          // degrees: the flipper's tip raised
const DOWN_ANGLE = 20;         // degrees: resting, tip down
const FLIP_SPEED = 0.1;        // radians per step while flipping up
const RETURN_SPEED = 0.05;     // radians per step falling back - gentler
const PEG_DISTANCE = 160;      // a peg this far from the pin, just past the tip, stops the ball
const PEG_RAISE = 22;          // ...and this far above the flipper's middle line
const PEG_RADIUS = 12;

export class Flipper extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, pinX: number, pinY: number) {
    Flipper.makeTexture(scene);

    // start with the centre to the right of the pin, lying flat
    super(scene.matter.world, pinX + PIN_TO_CENTRE, pinY, FLIPPER_KEY, undefined, {
      chamfer: { radius: THICKNESS / 2 },   // rounded ends, like the picture
      density: 0.05,                        // heavy: a ball landing on it hardly moves it
      ignoreGravity: true,                  // it is held up by its pin and our code, not gravity
      ignorePointer: true,                  // the mouse spring cannot drag it off its pin
    });
    scene.add.existing(this);

    // the pin: pointA is a place in the world, pointB a point on the body, measured from its
    // centre (and turning with it). Length 0 and stiffness 1: the two are held exactly together
    scene.matter.add.worldConstraint(this.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: pinX, y: pinY },
      pointB: { x: -PIN_TO_CENTRE, y: 0 },
    });

    this.setAngle(DOWN_ANGLE);   // the pin pulls it back into place within a step or two

    // a static peg just past the tip at rest, level with the flipper's top surface, so a ball
    // rolling down the flipper stops against it instead of rolling off. It is outside the circle
    // the tip sweeps round the pin, so the flipper never hits it
    const angle = Phaser.Math.DegToRad(DOWN_ANGLE);
    const along = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));    // pin to tip
    const above = new Phaser.Math.Vector2(Math.sin(angle), -Math.cos(angle));   // out of the top
    const pegX = pinX + along.x * PEG_DISTANCE + above.x * PEG_RAISE;
    const pegY = pinY + along.y * PEG_DISTANCE + above.y * PEG_RAISE;
    scene.matter.add.circle(pegX, pegY, PEG_RADIUS, { isStatic: true });
    scene.add.circle(pegX, pegY, PEG_RADIUS, 0x1d3557);
  }

  // called every frame by the scene: turn towards up or down, never faster than the speed, and
  // slowing to a stop exactly at the angle (an angular velocity of `error` gets there in one step)
  public swing(up: boolean): void {
    const target = up ? UP_ANGLE : DOWN_ANGLE;
    const speed = up ? FLIP_SPEED : RETURN_SPEED;
    const error = Phaser.Math.DegToRad(target - this.angle);
    this.setAngularVelocity(Phaser.Math.Clamp(error, -speed, speed));
  }

  private static makeTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(FLIPPER_KEY)) {
      return;
    }
    const graphics = scene.make.graphics({}, false);
    graphics.fillStyle(0xe63946);
    graphics.fillRoundedRect(0, 0, LENGTH, THICKNESS, THICKNESS / 2);
    graphics.fillStyle(0xf1faee);
    graphics.fillCircle(PIN_INSET, THICKNESS / 2, 4);   // the pin
    graphics.generateTexture(FLIPPER_KEY, LENGTH, THICKNESS);
    graphics.destroy();
  }
}
