# Chapter 9 - 2D physics: teacher notes

## Overview

Chapter 8 used Arcade Physics to find out when things touch. This chapter is about the physics
itself: velocity and acceleration, gravity, bounce, drag and damping, mass, friction, the kinds of
body, rotation, speed limits and world wrapping - and, briefly, Matter.js. The big idea to land is
that **a physics body is a set of numbers the engine integrates for you**: students set a velocity or
an acceleration and stop writing `x += speed * delta`. The playground makes every setting something
to press and watch; the space ship shows the same settings adding up to a game; the Matter project
shows what Arcade cannot do.

The chapter's one real trap is new, and silent: **adding a body to a physics group resets it** to
the group's defaults. Expect "my ball doesn't move" in every lab until students have met it.

## Prerequisites

- Chapter 8: bodies, `physics.add.existing`, `setCircle`, `collider` vs `overlap`, groups, callbacks
  cast with `as`, `disableBody` / `enableBody`, process callbacks
- Chapter 7: particles and the explosion animation (used, not taught, in the space ship)
- Chapter 2: scenes are reused, so fields reset in `init()`
- school physics: speed, acceleration, momentum. Worth five minutes of revision for some groups

## Learning outcomes

Students can:

1. explain the difference between velocity and acceleration, and set both on an Arcade body
2. use world and body gravity, bounce, world bounds, linear drag and damping, and explain why drag
   has no effect while a body accelerates
3. choose between dynamic, immovable, non-pushable and static bodies, and say what mass and Arcade
   friction do
4. read `body.blocked` / `body.touching`, and listen for `"worldbounds"`
5. make a ship turn with angular acceleration and fly the way it points with
   `velocityFromRotation`, with a true top speed (`setMaxSpeed`) and wrapping (`world.wrap`)
6. explain the fixed time step, and pause or slow the physics world
7. make a simple Matter.js scene with shaped bodies, and say when Matter is the better choice

## Suggested session plan (2 x 1 hour lab, or 1 hour lecture + 2 hour lab)

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Run `ch09_physics_playground`. Let students press every key for five minutes before any explanation. Ask: "what did D do? why do crates not bounce?" |
| 0:10 - 0:25 | Slides 3-6: the physics step, velocity vs acceleration, gravity and bounce, drag vs damping (draw the two curves on the board before showing the diagram) |
| 0:25 - 0:35 | **Live demo of the group trap** (below). Slide 7 |
| 0:35 - 0:50 | Slides 8-11: kinds of body, friction on the moving platform, `blocked`/`touching`, pause and `timeScale`, the fixed step |
| 0:50 - 1:00 | Challenges 1 and 2 |
| 1:00 - 1:10 | Fly `ch09_space_ship`. Ask: "why does the ship keep going? why does it turn with a little lag?" |
| 1:10 - 1:30 | Slides 12-15: angles and facing, angular acceleration, thrust with `velocityFromRotation`, damping and `setMaxSpeed`, wrap |
| 1:30 - 1:40 | Slides 16-18: Matter.js - drag the tower over, fire cannonballs; Arcade vs Matter |
| 1:40 - 2:00 | Challenges 3 and 4 (5 and 6 for the fast ones, or as homework) |

## Key points to stress

- **physics does the `delta` maths.** Once a game object has a body, move it with the body
  (velocity, acceleration), never by setting `x` and `y` - that teleports it past the collision
  checks. Chapter 8 said this; this chapter shows why the engine can do better
- **acceleration changes velocity; velocity changes position.** Students who confuse the two write
  `setAcceleration` for a walking player and wonder why it never stops
- **drag only works with zero acceleration** on that axis. It is the answer to half the "my ship never
  slows down" questions
- **damping inverts the drag number**: 0.9 is gentle, 0.1 is strong
- **Arcade bodies never rotate.** Rotation only turns the picture. Circles hide this; boxes do not.
  That, and stacking, is the case for Matter
- **the group trap**: add to the group first, then configure the body
- **angles start pointing right.** A picture drawn pointing up needs `rotation - Math.PI / 2`
- **Matter has its own units**: velocities per step, gravity 1, forces around 0.01

## Live demo: the group trap

In `ch09_physics_playground`, `PlaygroundScene.addBall()`, move `this.things.add(ball);` from the top
to the bottom of the method, build, and drop some balls. They fall straight down with no bounce and
no sideways speed, and any that miss the crates and platforms drop straight through the floor
(world bounds collision was reset too). There is no error. Ask students to find out why before showing slide 7. Put the line back and rebuild.

A second, shorter demo: in `Ship.thrust()`, delete `- Math.PI / 2`. The ship flies sideways.

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| A body added to a group does not move, has no bounce, or ignores world bounds; no error | the group reset it to its defaults when it was added | add it to the group first, then set it up |
| `TS2551 [ERROR]: Property 'setAllowGravity' does not exist on type 'Body \| StaticBody'. Did you mean 'allowGravity'?` | `this.body!.setAllowGravity(false)` - the body's type includes static bodies, which have no gravity | `(this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)` |
| `TS2551 [ERROR]: Property 'setAllowGravity' does not exist on type 'MovingPlatform'. Did you mean 'setGravity'?` | calling a body-only method on the game object | call it on the body, as above |
| The ship never slows down | drag set, but the acceleration is never set back to 0 | `setAcceleration(0)` when the key is released |
| Damping stops everything instantly | `setDrag(0.05)` with damping on means "keep 5%" | use values near 1 (0.6 - 0.95) for gentle damping |
| The ship flies sideways | the picture points up; angle 0 is right | subtract `Math.PI / 2`, or draw pictures pointing right |
| The ship is faster diagonally | `setMaxVelocity` limits x and y separately | `body.setMaxSpeed(...)` |
| Objects vanish at the edge and pop back | `world.wrap` with no padding | pass a padding of about half the object's size |
| Stacked Arcade crates jitter and sink | Arcade cannot really stack | expected - use Matter for stacking |
| `TS2345 [ERROR]: Argument of type 'Scene' is not assignable to parameter of type 'World'.` | `super(scene, ...)` in a class extending `Phaser.Physics.Matter.Image` | Matter game objects take `scene.matter.world` |
| `TypeError: Cannot read properties of undefined (reading 'add')` in `create`, in a Matter game | `this.physics.add...` when the config's default is `"matter"` - there is no Arcade plugin | use `this.matter.add...` (it compiles, because `this.physics` exists on every Scene's type) |
| Matter bodies fly off the screen | Arcade-sized numbers: `setVelocity(300, 0)` | Matter velocities are per step: try 5 - 20 |
| Debug drawing cannot be switched on later in Matter | bodies made while debug was off have no outline style | `debug: true` in the config, and `drawDebug = false` at the start of `create()` (as the projects do) |

## Discussion questions

- Chapter 1's ball moved itself in `preUpdate` with `delta`. What would you have to add to it to
  get gravity? Bounce with a bounce factor? Drag? (A good way to show how much the engine does.)
- Why does drag only apply when there is no acceleration? What would a car game feel like if it
  applied all the time?
- Linear drag or damping - which suits a car? A spaceship? A puck on ice? A ball rolling on grass?
- In Arcade, friction belongs to the platform, not to the crate. Why might the designers have
  chosen that? What can Arcade friction not do?
- Why is the physics step fixed, when frames are not? What goes wrong in a game that moves by
  `delta` per frame when the computer is slow?
- When is Matter worth its cost? Name a game for each engine.

## Extension ideas

- give the playground a wind: a key that sets `world.gravity.x` to a small value
- show the velocity of the ship as an arrow drawn with `Graphics` every frame
- use `this.physics.accelerateToObject` to make a homing missile that follows the ship
- set `fps: 30` in the playground config, turn gravity up to jupiter and watch collisions get
  rougher; then try `fps: 120`. Ask what it costs
- in Matter, build a chain or a pendulum with `this.matter.add.constraint`, or a Newton's cradle
  with `this.matter.add.newtonsCradle`

## Assessment ideas

- Practical: "make a lunar lander: gravity 50, UP thrusts the way the lander points, land gently
  (`blocked.down` with a small `velocity.y`) or crash"
- Code reading: show `addBall()` with the group line moved to the end, and ask what the player
  will see and why
- Short answer: the difference between velocity and acceleration, and between linear drag and
  damping, with a sketch of speed against time for each
- Short answer: two reasons to choose Arcade over Matter, and one game where Matter is the right
  choice

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
