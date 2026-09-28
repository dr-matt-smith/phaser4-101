# Chapter 4 - The life of a scene: teacher notes

## Overview

Chapters 1-3 used scenes as boxes to put code in. This chapter opens the box: the exact order of a
scene's methods and events, what happens in a frame, and the scene manager's other powers - `launch`,
`pause`/`resume`, `sleep`/`wake`, `stop`, `remove`. The Phaser ideas are the **lifecycle**, **scene
events**, **parallel scenes** (a HUD and a pause menu) and **cleaning up listeners**; the OO ideas
are **overriding a method and calling `super`** (a `Sprite`'s `preUpdate`) and the **context**
argument of a listener (JavaScript's `this` compared with Java's method references).

The chapter has one big practical lesson that students will need in every later chapter:
**Phaser clears up a scene's game objects, timers, tweens and input listeners when it shuts down, but
not listeners on `this.events` or on longer-lived emitters.** Leaks do not crash at once; they make
things happen twice, three times... and then crash. The logger's leak mode makes this visible.

## Prerequisites

- Chapter 1: `preUpdate` on an `Image`, `delta`, `override`
- Chapter 2: `scene.start(key, data)`, `init(data)`, scenes are reused, `on` and `once`, the registry
- Chapter 3: the loader and `preload()` (only lightly needed here)
- Java: overriding and `super.method()`; listeners and method references (`this::onClick`)

## Learning outcomes

Students can:

1. state the order in which Phaser calls a scene's constructor, `init`, `preload`, `create` and
   `update`, which of them run once and which on every start, and where game objects' `preUpdate`
   comes in a frame
2. listen for scene events (`CREATE`, `PAUSE`, `RESUME`, `SLEEP`, `WAKE`, `SHUTDOWN`, `DESTROY`,
   `UPDATE`, ...) with a method and a context, and remove the listener again
3. override `preUpdate` in a `Sprite` subclass correctly (`protected override`, calling `super`)
4. run scenes side by side with `launch`, and choose between `pause`, `sleep` and `stop`
5. explain which listeners Phaser removes when a scene shuts down, and clean up the rest in
   `SHUTDOWN`
6. measure time in a pausable game with timers or `delta`, not `time`/`this.time.now`
7. build a HUD scene and a pause menu scene around a game scene

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Recap Chapter 2's trap (fields keep old values). "Today: exactly what Phaser calls, and when" |
| 0:05 - 0:20 | Slides 3-5: the lifecycle diagram, then **live**: run the logger, read the log from the top. Restart with 5 and ask "what is missing?" (the constructor) |
| 0:20 - 0:30 | Slides 6-7: one frame in order; scene events; the context argument (Java `this::onClick` comparison) |
| 0:30 - 0:35 | Slide 8: `Sprite.preUpdate` - **live**: press S in the logger, then delete `super.preUpdate` in `Spinner.ts` and rebuild |
| 0:35 - 0:45 | Slides 9-10: the scene manager table; pause vs sleep (press 1, 2, 3, 4); requests are queued |
| 0:45 - 0:55 | Slides 11-12: cleaning up. **Live**: L then 5, 5 - watch every line of the log appear three times. Ask for the fix before showing `onShutdown()` |
| 0:55 - 1:00 | Slide 13: `time` vs `delta` - the question "what does `time` do while paused?" |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:20 | Everyone runs the logger and fills in a table: for pause, sleep, stop and remove - is it updated? drawn? do its game objects survive? what events? (Answers: the chapter's table) |
| 0:20 - 0:35 | Challenge 1 |
| 0:35 - 0:55 | Play `ch04_pause_and_hud`; slides 14-18. Read `GameScene`, `HudScene`, `PauseScene` together; find the three places where something is cleaned up in `SHUTDOWN` or by `stop` |
| 0:55 - 1:40 | Challenges 2-4 |
| 1:40 - 2:00 | Challenges 5-6 for the fast; the rest finish 3-4. Collect the "which camera fades?" answers from challenge 5 |

## Key points to stress

- **The constructor runs once.** Everything that must happen on every start goes in `init()` or
  `create()`. Everything that must happen once for the whole game (animations, registry defaults)
  must survive `create()` running again - check with `exists`, or do it in a scene that only runs once
- **Scene events are on `this.events`, and that emitter is reused.** This is the surprise: students
  assume shutting a scene down clears everything. It clears game objects, timers, tweens and input
  listeners - not listeners on `this.events`, `this.game.events`, `this.registry.events` or other
  scenes' emitters
- **Paused scenes are drawn; sleeping scenes are not; neither is updated nor hears input.** So the
  scene that reads the "unpause" key must be a different, running scene
- **`start` stops the caller; `launch` does not.** The most common HUD bug is `this.scene.start(HUD)`
  from the game scene
- **`restart()` has no key.** It restarts its own scene only
- **Scene manager calls are queued** (except `add` and `remove`). Code after `this.scene.start(...)`
  still runs, in the old scene
- **`time` is the game's clock and keeps going during a pause.** Timers and `delta` are the scene's,
  and stop. `this.time.now` is only brought up to date while the scene steps

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| `This member must have an 'override' modifier because it overrides a member in the base class 'Sprite'.` | `preUpdate` in a `Sprite` subclass without `override` | add `override` (a Chapter 1 `Image` did not need it - a `Sprite` has its own `preUpdate`) |
| `Class 'Spinner' incorrectly extends base class 'Sprite'.` / `Property 'preUpdate' is private in type 'Spinner' but not in type 'Sprite'.` | `private override preUpdate` | `protected` (or `public`) - a subclass cannot make a method less visible |
| A sprite moves but its animation is stuck on one frame; no error | `super.preUpdate(time, delta)` missing | call it, first thing in `preUpdate` |
| Console: `AnimationManager key already exists: spin` after a restart | `this.anims.create(...)` in `create()`, run again on restart | `if (!this.anims.exists(key))`, or create animations in a scene that runs once |
| After each restart, events happen twice, three times... (sounds doubled, score counted twice) | listeners added in `create()` to `this.events`, `this.game.events`, `this.registry.events` or another scene's `events`, never removed | remove them in a `SHUTDOWN` handler: `off(event, method, this)` |
| `off(...)` does not remove the listener | `on` and `off` were each given a new arrow function | pass the same method and context to both, or keep the function in a variable |
| The pause menu opens but the game can never be unpaused | the unpause key is read by the paused scene, which hears no input | read it in the pause scene (which is running) |
| The game disappears when the HUD or pause menu appears | `this.scene.start(HUD_SCENE)` - `start` stops the calling scene | `this.scene.launch(...)` |
| `Argument of type 'string' is not assignable to parameter of type 'object'.` | `this.scene.restart(GAME_SCENE)` - `restart` takes data, not a key | `this.scene.start(GAME_SCENE)` from the other scene, or `restart()` inside the scene itself |
| `Property 'score' does not exist on type 'Scene'.` | `this.scene.get(GAME_SCENE).score` - `get` returns a plain `Scene` type | better: send the value as event data or registry value. If it really must be read, `this.scene.get(GAME_SCENE) as GameScene` and a public getter |
| `TypeError: Cannot read properties of null (reading 'queue')` in the console when removing a scene from a key press | `this.scene.remove(...)` runs immediately, in the middle of Phaser dispatching the key to every scene | defer it: `this.time.delayedCall(0, () => this.scene.remove(key))` |
| The HUD shows nothing until the first change | it listened for events the game emitted in its `create()`, before the HUD had started (launch is queued) | pass the starting values as `launch` data |
| The invulnerable time / power-up ends early if the game was paused | measured with `this.time.now` or `time` | use `this.time.delayedCall`, or add up `delta` |

## Discussion questions

- `DemoScene`'s constructor cannot use `this.log()`, and `EventLog` is a plain class that any file can
  import. What is available to a scene in its constructor, and why? (Only what `super(...)` sets up;
  Phaser gives it its systems when the game boots it.)
- The HUD listens to `GameScene`'s events rather than `GameScene` calling HUD methods. What would
  break, or become harder, if `GameScene` called `hud.showScore(...)` directly? (The HUD might not
  have started yet; GameScene would depend on the HUD existing; a second HUD is harder.)
- When should a scene be paused, slept, or stopped? Give a game example of each
- Why does the leak in leak mode make the log *triple* after two restarts, not double? Why do the
  leaked `UPDATE` listeners appear *before* `Spinner.preUpdate()` in the log? (Phaser's own update
  list re-registers its listener on each start, after the leftovers.)
- In challenge 5, why can the pause scene's camera fade the whole screen, but the game scene's
  cannot?

## Extension ideas

- Add a `TRANSITION` between two scenes with `this.scene.transition({ target, duration, moveAbove })`
  and log its events (`transitionout`, `transitionstart`, `transitioncomplete`)
- Make the logger's frame limit adjustable while running: `this.game.loop.setFPSLimit(n)` (Phaser
  4.2) on the number keys, and watch the coin's steps get bigger
- `this.scene.switch(key)` sleeps the current scene and starts (or wakes) another: build a two-room
  game where each room keeps its state when you leave it
- Run two copies of the same scene class side by side with `this.scene.add(key, new GameScene(key))`
  and camera viewports - a split screen

## Assessment ideas

- Written: give a sequence of calls (`launch`, `pause`, `sleep`, `wake`, `stop`, `start`) and ask for
  the log a lifecycle logger would print, including which lifecycle methods run again
- Code reading: a scene with `this.game.events.on("blur", () => this.pauseGame())` in `create()` and
  no clean-up. Ask what happens after three restarts, how to prove it, and for the fix
- Practical: "add a game-over scene launched over the paused game, showing the score, with R to play
  again" - checks `launch`, `pause`, data, and restarting a paused scene

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
