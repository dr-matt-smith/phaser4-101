# Chapter 9 - 2D physics: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment. All six were played
with the test harness (key presses, and `eval` to read bodies' velocities, bounces, masses and
angles) as well as type checked and linted.

---

## 1. Gravity switch

**Project:** [solutions/ch09_challenge_1_gravity_switch](solutions/ch09_challenge_1_gravity_switch/)
(from `ch09_physics_playground`)

**Goal:** see that gravity is a vector - a strength *and* a direction - and that the world's
gravity can be changed at any time.

`src/scenes/PlaygroundScene.ts`
```ts
interface Direction {
  name: string;
  x: number;
  y: number;
}

const DOWN: Direction = { name: "down", x: 0, y: 1 };
const UP: Direction = { name: "up", x: 0, y: -1 };
...
keyboard.on("keydown-LEFT", () => {
  this.setGravityDirection(LEFT);
});
...
private applyGravity(): void {
  const strength = GRAVITY_CHOICES[this.gravityIndex].value;
  this.physics.world.gravity.set(this.gravityDirection.x * strength, this.gravityDirection.y * strength);
}
```

The G handler now calls `applyGravity()` too, so a new strength keeps the chosen direction. Tested:
LEFT gives gravity (-600, 0) and everything piles against the left wall; G then gives (-1500, 0);
UP gives (0, -1500), and things pile against the top edge and the underside of the ledge; R
restarts with (0, 600) and "down".

**Look for:**
- **both** components set. The most common bug is `gravity.x = -600` for LEFT without zeroing
  `gravity.y`, so things fall diagonally
- the direction reset in `init()` - but note the world itself is rebuilt on restart, so the world
  gravity goes back to the config's value on its own; only the scene's field needs resetting
- the moving platform is unaffected (`allowGravity` is false) - worth asking students why

---

## 2. Bouncy and dead

**Project:** [solutions/ch09_challenge_2_bouncy_and_dead](solutions/ch09_challenge_2_bouncy_and_dead/)
(from `ch09_physics_playground`)

**Goal:** per-body settings, the group trap again, and a little inheritance.

A new class, `SpecialBall extends Ball`, remembers its own bounce and mass and applies them in
`setUp()`; `Ball`'s constructor gains a default parameter for the picture.

`src/objects/SpecialBall.ts`
```ts
export class SpecialBall extends Ball {
  private readonly ownBounce: number;
  private readonly ownMass: number;

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, bounce: number, mass: number) {
    super(scene, x, y, key);
    this.ownBounce = bounce;
    this.ownMass = mass;
  }

  public setUp(): void {
    this.setBounce(this.ownBounce);
    this.setMass(this.ownMass);
  }
}
```

`src/scenes/PlaygroundScene.ts`
```ts
// CHALLENGE 2: a SpecialBall is a Ball too, so ask about it FIRST - it keeps its own bounce
if (thing instanceof SpecialBall) {
  thing.setUp();
} else if (thing instanceof Ball) {
  thing.setBounce(BOUNCE_CHOICES[this.bounceIndex].value);
}
```

```ts
private addSpecialBall(x: number, y: number, key: string, bounce: number, mass: number, tint: number): void {
  const ball = new SpecialBall(this, x, y, key, bounce, mass);
  ball.setTint(tint);
  this.things.add(ball);     // first - the group resets the body...
  this.applySettings(ball);  // ...then drag, world bounds, and its own bounce and mass
}
```

Tested: after pressing 1, 2 and then B three times, the red balls have bounce 0 (dead), the blue
ball still has bounce 1 and mass 0.5, and the grey ball bounce 0 and mass 5. `ball_blue.png` is
copied into `public/assets/images/` and loaded in `preload()`.

**Look for:**
- the order of the `instanceof` tests. With `Ball` first, the special balls match it and get B's
  bounce - a good discussion of "is-a" and the most specific type first
- `setMass` / `setBounce` called **after** `this.things.add(...)`. Setting them in the constructor
  looks right and silently does nothing - the group wipes them
- simpler answers are fine: a `keepsOwnBounce` flag on `Ball`, or two plain images added to the
  group and set up in the scene. The key test is that B does not change them
- heavy on light: a grey ball dropped on a pile of blue ones scatters them; blue ones bounce off a
  grey one that hardly moves. Mass only matters between dynamic bodies

---

## 3. Brakes and reverse

**Project:** [solutions/ch09_challenge_3_brakes_and_reverse](solutions/ch09_challenge_3_brakes_and_reverse/)
(from `ch09_space_ship`)

**Goal:** understand that drag only applies with no acceleration, and that brakes are "just more
damping".

`src/objects/Ship.ts`
```ts
// CHALLENGE 3: power 1 is full thrust forwards, -0.5 half thrust backwards, 0 none
public thrust(power: number): void {
  if (power !== 0) {
    ...
    this.scene.physics.velocityFromRotation(facing, THRUST * power, this.arcadeBody.acceleration);
```

```ts
public brake(on: boolean): void {
  this.setDrag(on ? BRAKE_DAMPING : DAMPING);
}
```

with `BRAKE_DAMPING = 0.0001`: from 350 px/s, about 3.5 px/s is left after half a second
(350 x 0.0001^0.5).

`src/scenes/SpaceScene.ts`
```ts
const braking = this.brakeKey.isDown;
let power = 0;
if (this.cursors.up.isDown) {
  power = 1;
} else if (this.cursors.down.isDown) {
  power = -REVERSE_POWER;
}
this.ship.brake(braking);
this.ship.thrust(braking ? 0 : power);
```

Tested: full speed up (350), SHIFT held for 500 ms leaves 4 px/s; DOWN held for a second from rest
reaches 147 px/s backwards (half thrust, less damping).

**Look for:**
- thrust switched **off** while braking. Students who only change the drag find that braking
  while holding UP does nothing - exactly the rule from the chapter. A great "why?" moment
- brake strength chosen by reasoning about damping (kept fraction per second), not by trial alone
- `addKey(KeyCodes.SHIFT)` or `this.cursors.shift` - both work

---

## 4. Rocks that split

**Project:** [solutions/ch09_challenge_4_rocks_that_split](solutions/ch09_challenge_4_rocks_that_split/)
(from `ch09_space_ship`)

**Goal:** a class with state (`size`), creating bodies inside a collision callback, directions
from a velocity vector, and mass that finally matters.

`src/objects/Rock.ts`
```ts
export const BIG = 3;
export const MEDIUM = 2;
export const SMALL = 1;
const SCALES = [0, 0.7, 1.1, 1.5];        // indexed by size (index 0 is not used)
const SPEED_UP = [0, 1.9, 1.4, 1];        // how much faster than a big rock
const POINTS = [0, 100, 50, 20];
...
public launch(angle: number = Phaser.Math.Between(0, 359)): void {
```

`launch` now takes a direction (a default parameter keeps the old call working), multiplies the
speed by `SPEED_UP[this.size]`, and sets `setMass(this.size * this.size)`.

`src/scenes/SpaceScene.ts`
```ts
if (rock.size > SMALL) {
  const bulletBody = bullet.body as Phaser.Physics.Arcade.Body; // bullets have dynamic bodies
  const heading = Phaser.Math.RadToDeg(bulletBody.velocity.angle());
  for (const turn of [-SPLIT_ANGLE, SPLIT_ANGLE]) {
    // start each piece a little way along its own path, so the two do not overlap
    const nudge = this.physics.velocityFromAngle(heading + turn, SPLIT_GAP);
    const piece = new Rock(this, rock.x + nudge.x, rock.y + nudge.y, rock.size - 1);
    this.rocks.add(piece);          // first: adding to a physics group resets the body...
    piece.launch(heading + turn);   // ...then set it moving
  }
}
```

The existing `countActive() === 0` check still starts the next wave, and now only fires when every
piece is gone (the new pieces are added before the check). Tested: shooting every rock of wave 1
takes 4 + 8 + 16 = 28 shots, scores 4 x 20 + 8 x 50 + 16 x 100 = 2080, and starts wave 2.

**Look for:**
- the pieces added to the group **before** `launch()`
- `velocity.angle()` (radians) converted for `velocityFromAngle` (degrees) - mixing the two units is
  the usual bug, and gives pieces flying off in odd directions
- pieces made at exactly the same point overlap and are pushed apart by the rocks' collider - it
  works, but looks odd; the nudge is a nicety
- the body follows the scale: `setScale` before `setCircle` in the constructor, radius in the
  picture's own pixels. (The body's size catches up with the scale by the next step)

> **Note for teachers** - in the headless browser used to test these projects, rotated images
> sometimes draw with a wedge missing (a software-rendering quirk). In a normal browser the rocks
> draw whole; if students report "broken rocks", check they are not using a software renderer.

---

## 5. Demolition

**Project:** [solutions/ch09_challenge_5_demolition](solutions/ch09_challenge_5_demolition/)
(from `ch09_matter_stack`)

**Goal:** read the state of Matter bodies (angle, position) every frame to make a game rule.

`src/objects/Crate.ts`
```ts
// CHALLENGE 5: tipped over, or fallen? Matter bodies rotate, so angle (in degrees, -180 to 180)
// tells us how far over it has gone
public get isDown(): boolean {
  return Math.abs(this.angle) > TIP_ANGLE || this.y > this.startY + DROP;
}
```

`src/scenes/StackScene.ts`
```ts
private fire(): void {
  // CHALLENGE 5: only SHOTS cannonballs; after the last, wait for things to settle, then finish
  if (this.shotsLeft === 0) {
    return;
  }
  this.shotsLeft = this.shotsLeft - 1;
  if (this.shotsLeft === 0) {
    this.time.delayedCall(SETTLE_TIME, () => {
      this.finished = true;
    });
  }
```

```ts
const down = this.targets.filter((crate) => crate.isDown).length;
```

`buildTower()` and `buildPyramid()` push each crate into `this.targets`, so crates dropped with
1 do not count; `init()` resets the array, the shots and `finished`, because R restarts the same
scene object. Tested: five shots, then after four seconds "5 of 17 crates down"; R resets to
"0 / 17, Shots left: 5".

**Look for:**
- `Math.abs(angle)` - a crate tipped the other way has a negative angle
- a crate lying on its side has angle 90 (or -90); one that has rolled right over may be back near
  0, which is why the height test is there too
- counting every frame rather than once at the end (the score climbs as things fall - more fun)
- not counting before the stack has settled: Matter's crates wobble a little at the start

---

## 6. Pinball flipper

**Project:** [solutions/ch09_challenge_6_pinball_flipper](solutions/ch09_challenge_6_pinball_flipper/)
(from `ch09_matter_stack`)

**Goal:** a constraint, and driving a Matter body by its angular velocity.

`src/objects/Flipper.ts`
```ts
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
```

```ts
public swing(up: boolean): void {
  const target = up ? UP_ANGLE : DOWN_ANGLE;
  const speed = up ? FLIP_SPEED : RETURN_SPEED;
  const error = Phaser.Math.DegToRad(target - this.angle);
  this.setAngularVelocity(Phaser.Math.Clamp(error, -speed, speed));
}
```

The scene calls `this.flipper.swing(this.flipKey.isDown)` every frame. Because the angular velocity
is never more than the angle still to go, the flipper stops exactly at its limits - the "check of
its angle every frame" from the hint. A static peg just past the tip stops a ball rolling off the
end. Tested: the flipper rests at 20 degrees and flips to -30 while Z is held; a ball dropped just
above it rolls against the peg, and one flick sends it up and right into the tower, tipping four
crates.

**Look for:**
- which way is "up". The tip is on the right, so lifting it is **anticlockwise** - a smaller angle.
  Students who pin the right end must reverse the signs; the ball then flies up and *left*
- Matter's `setAngularVelocity` is radians per step: 0.1 is brisk; 1 flings the ball off the top of
  the world (we tried 0.35 - the ball left the screen)
- `ignoreGravity` on the flipper, or it sags and fights the code; `ignorePointer`, or the mouse
  spring pulls it off its pin
- static stoppers instead of the angle check are a fine answer too - the flipper bounces against
  them a little, which looks quite like a real flipper
- the red ball is bouncy (restitution 0.7): dropped from high up, it bounces off the flipper and
  over the peg. Dropping it just above the flipper, or lowering its restitution, fixes that
