# Chapter 15 - Platformer: teacher notes

## Overview

The second genre chapter where movement *is* the game. Students meet the same platformer three
times, each version a complete game: a single screen of static platforms and coins; a scrolling
Tiled level with a hero that feels good to control, patrolling enemies and hazards; and a
three-level game with moving and one-way platforms, ladders, swooping bats, checkpoints, lives, a
HUD scene and a level select.

The Phaser ideas are **Arcade gravity and `body.blocked.down`**, **acceleration, drag and max
velocity**, **tile properties** (`setCollisionByProperty`, `tile.properties`), **`checkCollision`
and process callbacks** for one-way collisions, and **immovable bodies that carry riders**. The
design ideas are **game feel** (variable jump, coyote time, jump buffering), **small state
machines** (hero, bat), **interfaces** for enemies, **passing a function** instead of an object, and
**data-driven levels**. Almost everything else is revision of Chapters 2-11, used for real.

## Prerequisites

- Chapters 7-11 in particular: sprite sheet animations and the hero state machine (7), colliders,
  overlaps, groups and process callbacks (8), acceleration, drag and gravity (9), tilemaps and
  cameras (10), Tiled maps and object layers (11)
- Chapters 4 and 6 for the advanced version's HUD scene and registry events; Chapter 6 for
  `localStorage`
- Java interfaces (for `Enemy`) and, ideally, a one-method interface or lambda in Java (for
  `LadderFinder`)

## Learning outcomes

Students can:

1. make a hero that runs and jumps with Arcade Physics, jumping only when `body.blocked.down`
2. explain and implement a variable jump height, coyote time and jump buffering, and tune movement
   constants by play-testing
3. build a level from a Tiled map using tile properties for collision and hazards, and place game
   objects from the Objects layer
4. decide between stomp and hurt in an overlap callback, and use a process callback to make tile
   hazards fair
5. make one-way platforms with `checkCollision`, and platforms that carry the hero
6. structure a multi-level game: one data-driven game scene, a HUD scene fed by the registry,
   checkpoints and lives, and progress saved between sessions

## Suggested session plan (2 x 2-hour labs)

**Session 1 - the simple and intermediate versions**

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play `ch15_platformer_simple`. Ask: "what does it feel like?" (stiff; every jump the same). Keep the answers for later |
| 0:10 - 0:30 | Slides 3-5: gravity, the Arcade Sprite and `declare body`, `blocked.down`; then in the code, the animation state machine and collider vs overlap. Live-code the jump (see demos) |
| 0:30 - 0:50 | Challenges 1 and 2 |
| 0:50 - 1:05 | Play `ch15_platformer_intermediate`. Compare with the list from 0:00 |
| 1:05 - 1:25 | Slides 7-9: the Tiled map and its properties, game feel (acceleration and drag in the code, then the jump cut, coyote time, buffering). The coyote demo |
| 1:25 - 1:45 | Slides 10-11: slimes, stomp or hurt, fair hazards |
| 1:45 - 2:00 | Start challenge 4 (wall jump) |

**Session 2 - the advanced version**

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play `ch15_platformer_advanced`, all three levels (unlock them by editing `localStorage` in the dev tools, or play level 1 fast) |
| 0:10 - 0:40 | Slides 13-17: data-driven levels, one-way and moving platforms, ladders and `LadderFinder`, bats, the `Enemy` interface, checkpoints and the HUD |
| 0:40 - 1:00 | Finish challenge 4 |
| 1:00 - 2:00 | Challenges 3, 5 and 6 - or a free "make your own level" exercise in Tiled |

A single 3-hour lab can cover the simple and intermediate versions with challenges 1, 2 and 4, and
leave the advanced version for reading at home.

## Key points to stress

- **`blocked.down` is set by collisions**, and only by a collider or the world bounds. It is the
  question "am I standing on something?", asked of the physics engine rather than worked out from
  positions
- **a jump is a velocity; gravity does the rest.** The height is `speed² / (2 x gravity)`: students
  who want "a jump 3 tiles high" can work out the speed rather than guessing
- **game feel is numbers.** Acceleration, drag, jump speed, gravity, jump cut, coyote time and buffer
  are all constants at the top of `Hero.ts`. Encourage students to change them one at a time and
  play: this is exactly what game designers do
- **remember *when*, not just *whether*** - coyote time and buffering both come from storing a
  timestamp. The same idea gives invulnerability after respawning (`safeUntil`) and the wall-jump
  key lock in challenge 4
- **tiles say what they are.** No tile numbers in the code: properties set once in the tileset
  apply to every tile in every level
- **overlap with a tilemap layer includes empty tiles** - the process callback is not optional
- **the scene decides what a touch means**, not the hero or the enemy. That keeps `Slime`, `Bat`
  and `Hero` independent - and in the advanced version, the `Enemy` interface keeps the scene
  independent of which enemies exist
- **the data drives the levels.** Adding a level means a map and a line in `levels.ts`

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| `TS2531 [ERROR]: Object is possibly 'null'.` on every `this.body...` line, and `Property 'acceleration' does not exist on type 'Body \| StaticBody'.` | the `declare body: Phaser.Physics.Arcade.Body;` line is missing from a class extending `Phaser.Physics.Arcade.Sprite` | add it (and discuss why it is safe: the constructor gives the sprite a dynamic body) |
| `TS4114 [ERROR]: This member must have an 'override' modifier because it overrides a member in the base class 'Sprite'.` | `preUpdate` without `override` | add `protected override` |
| The hero never animates, or is stuck on one frame | `super.preUpdate(time, delta)` missing from `preUpdate()`, or `play(key)` without `true` called every frame | call `super.preUpdate`; use `play(key, true)` |
| The hero falls through the level | no collider with the ground layer, or `setCollisionByProperty` missing, or the property not set on the tiles in Tiled | check all three; `debug: true` shows the bodies |
| The hero cannot jump from a platform | the platform is an `overlap`, or a group made with `this.add.group()` without bodies - so `blocked.down` is never set | use `this.physics.add.collider` |
| `Tilemap has no tileset "platform". Its tilesets are ...` (with the list of names) in the console, then (in these projects) `Error: The map has no tileset called "platform"` | the first argument of `addTilesetImage` must be the tileset's name *inside the map*, not the image key | use the name shown in Tiled's Tilesets panel |
| `Invalid Tilemap Layer ID: ground` then `Valid tilelayer names: ...` in the console | a layer name typed with the wrong case | layer names are case-sensitive and must match Tiled exactly |
| `TS2322 [ERROR]: Type 'TilemapLayer \| TilemapGPULayer' is not assignable to type 'TilemapLayer'.` | `createLayer` can return either kind of layer | `as Phaser.Tilemaps.TilemapLayer`, with a comment (the projects' `createLayer` helper) |
| `TS2345 [ERROR]: Argument of type 'Body \| StaticBody \| Tile \| GameObjectWithBody' is not assignable to parameter of type 'Sprite'.` | passing a collider/overlap callback's argument straight to a method | cast it: `coin as Phaser.Physics.Arcade.Sprite` (Chapter 8) |
| Touching the air next to spikes kills the hero, or the hero dies as soon as the level starts | overlap with a tilemap layer calls back for empty tiles too | check `tile.properties.hazard` (or `tile.index !== -1`) in a process callback |
| Every touch of a slime squashes it - even walking into it | the stomp test has no "falling" check, or no margin | `velocity.y > 0` and `bottom <= top + margin` |
| The hero is hurt twice by one slime, or by a slime that was just squashed | the enemy's body is still enabled during its squash tween | `body.enable = false` at the start of `squash()` |
| The hero slides off a moving platform | the platform is moved by a tween (or by setting `x`) | move it by velocity, as `MovingPlatform` does |
| Static objects (the springboard in challenge 2) are hit in the wrong place after `setOrigin` or `setScale` | static bodies do not follow changes to their game object | call `refreshBody()` |

## Suggested demos and live-coding

- **Build the jump live** in the simple version: start with no jump; add `setVelocityY(-JUMP_SPEED)`
  on SPACE with no floor check (infinite flying - students love it); add the `blocked.down` check;
  then print `JUMP_SPEED² / (2 x 900)` and measure the height with `debug: true`
- **Feel, side by side.** Run the simple and intermediate versions next to each other. Then in the
  intermediate version set `COYOTE_TIME` and `JUMP_BUFFER` to 0 and ask students to run off ledges
  and jump just before landing. Put them back. Most will not believe how much difference 100 ms
  makes until they try it
- **The empty-tile surprise.** Replace the hazard process callback with `undefined`: the hero dies
  the moment it goes near anything. Ask why before explaining
- **Tween vs velocity platform.** In `MovingPlatform`, swap the velocity code for a yoyo tween and
  `body.setDirectControl(true)`, and throttle the CPU in the browser's dev tools: the hero slides on
  the tween platform, and not on the velocity one
- **A new level in five minutes.** Open `tiled/level1.tmj` in Tiled, add a row of spikes and a coin,
  save, copy to `public/assets/maps/`, rebuild and play. Nothing in the code changes

## Discussion questions

- Why does the hero need a smaller body than its picture? What would feel unfair if it were bigger?
  If it were much smaller?
- Coyote time lets the player jump when the hero is not on the ground. Is that cheating? Who is it
  for? (It makes the game do what the player *meant*.)
- The slime checks for edges by looking at the tilemap; the hero asks a function for ladders. Which
  design is better? What would you have to change to put a slime on a moving platform?
- `heroMeetsEnemy` lives in the scene, not in `Hero` or `Enemy`. Why? Where else could it go?
- Levels are data. What else in this game could be data rather than code? (Enemy speeds, medal
  times, the hero's constants - then a "moon level" with low gravity is data too.)

## Extension ideas

- a level editor mode: click to place tiles and objects, then print the level as JSON
- slopes (Arcade Physics has none - discuss why Matter.js would handle them, Chapter 9)
- a crumbling platform that falls a moment after the hero lands on it
- parallax with several layers moving at different speeds, or a `tileSprite` background
- a speed-run ghost: record the hero's positions each frame and replay them as a translucent sprite
  on the next attempt

## Assessment ideas

- **Practical:** "Add a fourth level" - a map (in Tiled) and one line in `levels.ts`. Checks Tiled
  skills, tile properties, object types and the data-driven design, with very little code
- **Practical:** add a new hazard tile (water that slows the hero instead of hurting it), using a
  new tile property
- **Code reading:** show `jump()` from the intermediate hero with the two `-1000` lines deleted; ask
  what the player would see and why
- **Short answer:** explain the difference between `collider` and `overlap`, and give one use of each
  from this chapter; explain what a process callback is for, with an example from this chapter

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
