# Chapter 8 - Collisions: teacher notes

## Overview

Students learn to detect and respond to things touching, in two stages. First **by hand**: shapes
from `Phaser.Geom`, the tests in `Phaser.Geom.Intersects`, bounding boxes from `getBounds()`, and a
circular hit area for clicks - enough to understand what any collision system does underneath, and
why rectangles are unfair to round things. Then **Arcade Physics**: turning it on, giving game
objects bodies, fitting bodies to pictures, and the central choice of the chapter - `collider`
(separate and bounce) or `overlap` (just report) - with groups, callbacks, process callbacks, and
switching collisions and bodies off. The chapter ends with a complete breakout game.

This is the first chapter that uses a physics engine. Keep to *collisions*: velocity is used, and
bounce and immovable bodies are mentioned, but Chapter 9 covers movement physics (acceleration,
drag, gravity, mass) properly. When students ask "how do I make it slide / fall / speed up?", point
them forward.

## Prerequisites

- Chapter 1: game objects, `update()`, speeds in pixels per second
- Chapter 2: `setInteractive`, `pointerdown`, the reused-scene trap and `init()`
- Chapter 7: tweens (used for the player's flashing), and `delayedCall` from earlier chapters
- Java: casts, `instanceof`, `HashSet` - all have close TypeScript equivalents here

## Learning outcomes

Students can:

1. test whether two rectangles, two circles, or a circle and a rectangle overlap with
   `Phaser.Geom.Intersects`, and explain the maths behind the first two
2. explain why bounding rectangles are unfair to round objects, and give a circle a circular hit
   area with `setInteractive({ hitArea, hitAreaCallback })`
3. turn on Arcade Physics, give game objects bodies (`this.physics.add.image/sprite/existing`), and
   use `debug` to see them
4. fit a body to its picture with `setSize`, `setOffset` and `setCircle`
5. choose correctly between `collider` and `overlap`, for single objects and for groups
   (`group`, `staticGroup`), and use the objects passed to the callback (with `as`)
6. use a process callback to decide whether a collision counts; switch collisions off with
   `collider.active`, and bodies with `disableBody` / `enableBody`

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Play `ch08_breakout` for a minute. Ask: "how many different collisions can you name in this game? Which ones bounce, and which ones just make something happen?" |
| 0:05 - 0:20 | Slides 3-7: geometry shapes, the two tests (draw the four rectangle comparisons on the board), `getBounds`, testing every pair, unfair corners, a circular hit area. Demo `ch08_hand_made_collisions` |
| 0:20 - 0:25 | **Live demo**: in the shapes project, arrange two circles corner to corner, then press SPACE. "Would you accept that as a hit in a game?" |
| 0:25 - 0:35 | Slides 8-10: Arcade Physics, bodies, `debug`, `setSize`/`setOffset`/`setCircle`. Turn `debug: true` on in `ch08_collect_and_avoid` and rebuild |
| 0:35 - 0:50 | Slides 11-15: collider vs overlap, groups, callbacks and `as`, switching off. **Live demo**: replace the stars' overlap with `this.physics.add.collider(this.player, this.stars)` - no callback - and play: the player shoves the stars, which slide away across the screen. Then put the callback back on the collider: the star is still collected, after a one-frame bump. Ask why the overlap is still the right choice |
| 0:50 - 1:00 | Slides 16-18: breakout - the process callback and the paddle angle. Slides 19-20: summary and challenges |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:20 | Build and play all three projects. Answer the "What to look at" questions in each README |
| 0:20 - 0:40 | Challenge 1 (debug key) and 2 (hover highlight) |
| 0:40 - 1:20 | Challenges 3 and 4 (tough bricks, wide paddle) |
| 1:20 - 2:00 | Challenges 5 and 6 (glass bricks, fair triangles) for those who are ready; the extension ideas below for the rest |

## Key points to stress

- a collision test is **just geometry**. Arcade Physics does the same tests as Part 1 - it only
  does them for you, efficiently, and responds to them. Students who understand Part 1 debug Part 2
  much faster
- **the body is not the picture**. Every "it hit me but it didn't touch me" bug is a body that
  does not match what the player sees. The first move is always `debug: true`
- **collider or overlap** is a design decision: *should these two push each other apart?* Walls,
  crates, bricks, paddles: yes. Pickups, hazards, trigger zones: no
- colliders are set up **once**, in `create()`, not every frame in `update()`
- an overlap callback fires **every frame** the two things touch - students must design for that
  (invulnerability, disabling the pickup's body, a flag)
- move bodies with **velocity**, not by setting `x`/`y` - otherwise the physics engine cannot stop
  them at walls. (The paddle following the mouse is the exception, and the chapter says why it is
  safe)
- **static bodies do not follow their game objects**: `refreshBody()` after moving or scaling one

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| `TypeError: Cannot read properties of undefined (reading 'add')` at `create`, on `this.physics.add...` | no `physics` section in the game config | add `physics: { default: "arcade", arcade: { debug: false } }` to `main.ts` |
| `TypeError: Cannot read properties of null (reading 'setSize')` in a class that extends `Phaser.Physics.Arcade.Image` | extending the Arcade class does not make a body; `scene.physics.add.existing(this)` is missing (or comes after the `setSize`) | call `scene.physics.add.existing(this)` in the constructor, before any body method |
| `TS2339 [ERROR]: Property 'disableBody' does not exist on type 'Body \| StaticBody \| Tile \| GameObjectWithBody'.` | using a callback parameter directly | cast it: `star as Phaser.Physics.Arcade.Sprite` |
| `TS2531 [ERROR]: Object is possibly 'null'.` on `this.player.body.velocity` | a game object's `body` is typed `... \| null` | `this.player.body!.velocity`, or use the object's own methods (`setVelocity`) |
| The player bumps or pushes a pickup instead of collecting it | `collider` used where `overlap` was meant | use `overlap` for pickups |
| All lives lost at once when touching an enemy | the overlap callback runs every frame they touch | invulnerability: `collider.active = false` for a while, or a process callback |
| The player stops short of a crate, or walks into its edge | a static body scaled or moved without `refreshBody()`, or a body the wrong size | `refreshBody()`; turn on `debug` |
| The body is offset from the sprite in the wrong direction | `setOffset` / `setCircle` offsets measured from the centre by mistake | they are measured from the picture's **top-left** corner |
| A click just outside a circle still picks it up | default rectangular hit area | `hitArea: new Phaser.Geom.Circle(r, r, r), hitAreaCallback: Phaser.Geom.Circle.Contains` - note the centre is `(r, r)`, not `(0, 0)` |
| A process callback seems to do nothing - everything still collides | the callback forgot `return`. Phaser only skips a collision when it gets exactly `false`, and `undefined` is not `false`. TypeScript does not warn: Phaser types the callback as returning `void` | `return` the boolean |
| With debug on, outlines of bricks already knocked out are still drawn (breakout) | the bricks were removed with `disableBody`: a disabled *static* body no longer collides, but the debug drawing still shows it | harmless, but confusing - `destroy()` bricks that will never come back, as the chapter project does |
| After a restart, debug drawing is off again (challenge 1) | each scene start gets a new physics world | expected; store the choice in the registry if it should persist |

## Discussion questions

- The shapes project tests 15 pairs a frame. How many would a bullet-hell game with 500 bullets and
  one player need, if bullets never hit each other? (500 - collisions *between* groups are far
  cheaper than every object against every other.) Why does `collider(enemies, enemies)` cost more
  than `collider(player, enemies)`?
- For each of these, collider or overlap: a door you walk through to change room; a spring that
  launches you; a moving platform; a checkpoint flag; a bullet hitting a wall; a bullet hitting an
  enemy
- The enemy body is smaller than the triangle. Is it fair? Who benefits? Should an enemy bullet's
  body be smaller or bigger than its picture? What about a coin's?
- Stars are disabled and re-enabled; bricks are destroyed. When is each better? (Reuse vs. gone
  for good; Chapter 14 comes back to this as object pools.)
- The paddle sets its `x` directly when following the mouse, but the player never does. Why is it
  safe for the paddle but not for the player?

## Extension ideas

- in the shapes project, add a `Phaser.Geom.Triangle` shape and the three new tests it needs
  (`RectangleToTriangle`, `TriangleToCircle`, `TriangleToTriangle`)
- breakout: a second ball ("multi-ball") - one more collider line per ball, or put the balls in a
  group so the existing colliders just work
- collect and avoid: a bomb pickup that clears every enemy on screen (`this.enemies.clear(true,
  true)`)
- collision **categories** (`this.physics.nextCategory()`, `setCollisionCategory`,
  `setCollidesWith`) as an alternative to choosing which pairs get colliders
- breakout: levels read from an array of strings (`"XX..XX"`), a preview of tilemaps (Chapter 10)

## Assessment ideas

- Practical: "add spikes to `ch08_collect_and_avoid` - a static group of hazards that cost a life
  when touched, but that enemies bounce off"
- Code reading: show a scene with `this.physics.add.collider(...)` inside `update()` and ask what is
  wrong and what happens as the game runs (a new collider every frame - it gets slower and slower,
  and callbacks fire many times)
- Short answer: explain the difference between a collide callback and a process callback, with an
  example of a game rule that needs a process callback
- Paper exercise: given two circles `(100, 100, r 30)` and `(150, 140, r 25)`, do they overlap? Do
  their bounding boxes? (Distance 64.0 > 55, so no; the boxes overlap: yes)

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
