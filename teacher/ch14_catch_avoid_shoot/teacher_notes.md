# Chapter 14 - Catch, avoid and shoot: teacher notes

## Overview

The first action-game chapter. Students meet one genre three times - a fruit catcher, a space
shooter, and a space shooter with levels, bosses and power-ups - and see how each version grows from
the last. The Phaser ideas are **spawn timers** (`this.time.addEvent`), **object pools** (a physics
group with `classType` and `maxSize`, `get()`, `enableBody`/`disableBody`), **waves** built from
tweens, timers and a curved path, a **fire rate**, **invulnerability**, particles, a `TileSprite`
starfield, and (in the advanced version) levels as data, a boss, power-ups and a HUD scene fed by
events. The design ideas - readable threats, rising pressure, fairness - matter as much as the code.

The one idea to make sure every student leaves with is **pooling**, including its price: an object
that is reused must be *fully* reset every time. Most of the chapter's bugs, and most of the
students' bugs, come from that.

## Prerequisites

- Chapter 2: scene keys, `init()` and the restart trap, `scene.start(key, data)`
- Chapters 4 and 6: launching a scene in parallel; events between scenes; `localStorage`
- Chapter 5: the game-wide sound manager (for the advanced version's music)
- Chapter 7: tweens, animations, particles
- Chapter 8: Arcade bodies, groups, `overlap`, process callbacks, `as` casts in callbacks
- Chapter 12 or 13: a small state machine held in a union type

## Learning outcomes

Students can:

1. keep a player on one line with velocity and `setCollideWorldBounds`, driven by held keys
2. spawn objects on a timer with `this.time.addEvent({ delay, loop | repeat, callback })`, and stop it
3. explain why a shooter pools its bullets, and build a pool with a physics group, `get()`,
   `enableBody(true, x, y, true, true)` and `disableBody(true, true)`
4. explain why `killAndHide` is not enough for a physics object, and why a pooled object must be
   fully reset
5. build waves from staggered tweens, repeating timers and a tween along a path, and count a wave
   down to its end
6. add a fire rate, flashing invulnerability with a process callback, explosions with particles,
   and a difficulty ramp
7. describe how a game grows: data-driven levels, a phase state machine, one job per class, a HUD
   that only listens

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Play all three versions on the projector, back to back. Ask: "what stayed the same?" |
| 0:05 - 0:15 | Slides 3-6: the genre, the three versions, the catcher - player, timer, falling groups |
| 0:15 - 0:35 | Slides 7-11: pooling. **Live demo of `killAndHide`** (below). The three switches table |
| 0:35 - 0:45 | Slides 12-14: waves and counting a wave down, invulnerability, the starfield |
| 0:45 - 0:55 | Slides 15-18: the advanced version - data, phases, the swoop path, the boss, power-ups, HUD |
| 0:55 - 1:00 | Slides 19-20: summary, the challenges, and who should start where |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Everyone builds and plays the catcher; change `SPAWN_DELAY`, `BOMB_CHANCE` and `FALL_GRAVITY` and feel the difference |
| 0:15 - 0:50 | Challenges 1 and 2 (catcher) |
| 0:50 - 1:00 | Group check-in: open the intermediate version and find all three places a pooled object is switched on or off |
| 1:00 - 2:00 | Challenge 3 or 6 (intermediate), then 4 or 5 (advanced) for those who get there |

## Key points to stress

- **Pool what you make many of, often.** Bullets and enemies are pooled; explosions and power-ups
  are not. Ask students to justify each - it is a judgement, not a rule
- **Three switches**: `active` (updates, and "free" to the pool), `visible` (drawn), `body.enable`
  (moves and collides). `disableBody(true, true)` turns off all three; `killAndHide` only two
- **Reset everything on reuse.** Tweens (`killTweensOf`), velocities (`enableBody` with `reset`
  clears them), angles, tints, fields such as a bullet's owner
- **Count the wave; don't ask the pool.** `countActive() === 0` is true in the gaps of a stream wave
- **`get()` can return `null`** - type it `as Bullet | null` so the compiler insists on a check
- **The player's class does not know its keys.** The scene reads input and calls `move(-1 | 0 | 1)`.
  Challenges 1 and 6 both depend on this, and neither changes the ship or basket class
- **Fairness is design, not luck**: small hit boxes (`setBodySize`), invulnerability after a hit,
  enemies that stop firing when close

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| `TypeError: Cannot read properties of null (reading 'fire')` in the console, and the game freezes, when firing fast | `this.bullets.get() as Bullet` with no null check: the pool is full | `as Bullet \| null`, and return if it is `null` |
| Invisible bullets still destroy enemies | switched off with `killAndHide` or `setVisible(false)` - the body is still on | `disableBody(true, true)` |
| A reused enemy flies off to an old position, or starts moving at the wrong speed | a tween from its last life is still running | `this.scene.tweens.killTweensOf(this)` in `kill()` |
| The next wave never comes, or two come at once | `enemiesLeft` not decremented on every exit (shot, crash, off screen, pool empty), or decremented twice | one `enemyGone()`, called from every exit and nowhere else |
| The basket falls off the bottom of the screen | gravity set in the game config rather than on the falling groups | give the groups `gravityY`, not the world |
| `TS2345 [ERROR]: Argument of type '(bullet: Bullet, enemy: Enemy) => void' is not assignable to parameter of type 'ArcadePhysicsCallback'.` followed by `Type 'Body \| StaticBody \| GameObjectWithBody \| Tile' is not assignable to type 'Bullet'.` | typing the overlap callback's parameters as your classes | leave them untyped and cast inside: `bullet as Bullet` |
| `TS4114 [ERROR]: This member must have an 'override' modifier because it overrides a member in the base class 'TileSprite'.` | `preUpdate` in a `TileSprite` subclass without `override` | `protected override preUpdate(...)`, and call `super.preUpdate` |
| `TS2741 [ERROR]: Property 'shield' is missing in type '{ spread: string; rapid: string; life: string; }' but required in type 'Record<PowerUpKind, string>'.` (challenge 4) | a new kind added to the union but not to the `Record` | this is the compiler helping - add the entry |
| Things can still be caught after GAME OVER | spawn timer not removed, physics not paused | `spawnTimer.remove()` and `this.physics.pause()` |
| The second game starts with the old score, or ends at once | fields reset only where declared | reset in `init()` (Chapter 2) |
| The HUD works, but after a few games the game slows, or a HUD value updates several times | HUD listeners on the game scene's emitter never removed. There is **no error message** - in the console, `game.scene.getScene("GameScene").events.listenerCount("score-changed")` shows 2 after the second game, 3 after the third... | remove them in the HUD's `SHUTDOWN` handler with the same method and `this` |
| Holding SPACE fires one shot, a pause, then a fast stream (the keyboard's auto-repeat) | `keyboard.on("keydown-SPACE")` used for firing | check `fireKey.isDown` every frame, limited by the fire rate |

The first error and the three `TS` errors above were produced by making those mistakes in copies of
the projects; the listener count was read the same way, by removing the `SHUTDOWN` handler.

## Suggested demos and live-coding moments

- **`killAndHide` is not enough.** In the intermediate version, change the body of `Bullet.kill()`
  from `this.disableBody(true, true);` to `this.setActive(false).setVisible(false);` - which is what
  `killAndHide` does. Play: bullets still vanish when they hit, and it looks fine - until a stream
  wave lines ships up in a column, and one shot destroys the whole column. Ask why before explaining.
  We checked this: one bullet fired up a column of three ships destroyed all three (score 300), with
  no bullet visible after the first.
- **The leftover tween.** Remove `this.scene.tweens.killTweensOf(this);` from `Enemy.kill()`, shoot
  ships while they are still swooping into the row, and watch the next stream wave: some ships fly
  up into a row that is not there. We checked this: an enemy switched off mid-swoop and handed out
  again at (700, 500) was dragged straight back up to the row.
- **Pool size.** Set `BULLET_POOL_SIZE` to 2 in the intermediate version: firing becomes a
  staccato pair. Then remove the `null` check - the game stops with the `TypeError`.
- **Tuning live.** Open `levels.ts` in the advanced version, make level 1's boss 5 health and the
  first wave 20 ships. "Level design without touching game code."

## Discussion questions

- Explosions are not pooled. Should they be? What would you need to reset? (Animation, position,
  and the `ANIMATION_COMPLETE` listener - a pooled sprite would need `once` re-added each time, or a
  single `on` added when made.)
- Why does the intermediate version count `enemiesLeft` instead of asking
  `enemies.countActive() === 0`? When would `countActive` be fine?
- Power-ups are "active until" times on the clock, not timers. What are the advantages? What would
  go wrong with a `delayedCall` that switched spread shot off, if the player picked up a second one?
- `WavePattern` is `"row" | "stream" | "swoop"`. In Java you would use an `enum`. What does each
  give you that the other does not?
- The HUD only listens to events. What would be lost if it read `GameScene`'s fields every frame
  instead?
- Where is the line between "fair" and "easy"? Which of the fairness rules in the chapter would you
  remove for an "expert" mode?

## Extension ideas

- enemy variety: a class hierarchy (`Enemy` -> `Diver`, `Tank`) with different health and scores,
  still in one pool per class
- a boss with phases: a new attack pattern below half health
- replace the row wave's tween with `Phaser.GameObjects.PathFollower` and compare
- a pause scene (Chapter 4) that also pauses the music
- screen shake strength that scales with what exploded; a hit-stop (pause physics for 50 ms)

## Assessment ideas

- Practical: "add a fourth wave pattern of your own design to the advanced version's `WaveSpawner`,
  and use it in `levels.ts`" - look for the new pattern in the union type, a reset-safe enemy, and
  correct wave counting
- Code reading: show `Enemy.kill()` without `killTweensOf` and a description of the bug; ask for the
  cause and the fix
- Short answer: "What does each of `setActive(false)`, `setVisible(false)` and `disableBody()` switch
  off? Which does a pooled bullet need, and why?"
- Short answer: "Why is a fire rate a stored time rather than a `delayedCall`?"

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
