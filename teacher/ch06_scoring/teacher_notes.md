# Chapter 6 - Scoring: teacher notes

## Overview

Scoring looks like the easiest part of a game, and it is where students first meet a real design
question: *who owns the score, and how does everyone else find out about it?* The chapter answers it
in three steps. `ch06_hud_events` shows three Phaser emitters (a scene's, the game's, the
registry's) feeding a HUD scene, and what each does when a scene restarts. `ch06_coin_collector`
puts the rules and numbers in a plain `ScoreManager` class that **announces** changes as events,
with a HUD scene that only listens. `ch06_high_score_table` saves a top-ten table in
`localStorage`, validates what it reads back, and takes initials from the keyboard.

The Phaser ideas are **parallel scenes** (`launch`/`stop`, draw order), **event emitters**
(`emit`/`on`/`once`/`off`, context, `changedata-`), **counter tweens** and generic `keydown`
events. The TypeScript and JavaScript ideas are `extends Phaser.Events.EventEmitter`, `unknown` and
**type guards**, `try`/`catch`, `JSON`, optional properties and optional chaining, `padStart`, and
regular expressions. The OO idea - tell an object what happened, let it announce the results - is
the one to leave them with.

## Prerequisites

- Chapter 2: scenes, `init(data)` with an interface, the registry, the scene object being reused
- Chapter 4: `launch`, parallel scenes, `SHUTDOWN` and cleaning up listeners (the chapter recaps
  what it needs in a few lines, so it can be taught before Chapter 4 at a push)
- Java: interfaces, inheritance, the observer pattern / Swing listeners (for the analogy)

## Learning outcomes

Students can:

1. run a HUD as a separate scene on top of the game, and explain why it is better than text in the
   game scene
2. send and listen for events on a scene, on the game and on the registry, and choose between them
3. explain why a late listener misses events, and read the current state as well as listening
4. remove listeners from longer-lived emitters on `SHUTDOWN`, passing the same function and context
5. design a plain class that owns game state and emits events, and keep scenes to *telling* and
   *listening*
6. save and load structured data with `localStorage` and JSON, and validate it with `unknown`,
   `try`/`catch` and a type guard
7. read typed characters from `keydown` events with `event.key`

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Play `ch06_coin_collector`. Ask: "what is on screen that is not the game?" |
| 0:05 - 0:15 | Slides 3-4: why a HUD scene; `launch`, draw order, each scene's own camera (point out the shake does not move the HUD) |
| 0:15 - 0:30 | Slides 5-9 with `ch06_hud_events` running: the three routes. **Live demo** (below) of the missing clean-up |
| 0:30 - 0:45 | Slides 10-12: the `ScoreManager`, tell vs announce. Draw the "who talks to whom" diagram on the board before showing it |
| 0:45 - 0:55 | Slides 13-17: floating text and count-up; localStorage, JSON and validation |
| 0:55 - 1:00 | Slide 18: initials; the challenge list |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Build and play all three projects. In `ch06_high_score_table`, get onto the table, then find the key in the browser's developer tools (Application > Local Storage in Chrome) |
| 0:15 - 0:30 | Break it on purpose: edit the stored value to `this is not json`, reload - the game still starts. Then comment out the `try`/`catch` round `JSON.parse` and reload |
| 0:30 - 1:15 | Challenges 1-3 |
| 1:15 - 2:00 | Challenges 4-6 (6 is a good take-home) |

## Suggested demos and live coding

- **The invisible leak.** In `ch06_hud_events/src/scenes/HudScene.ts`, delete the
  `this.events.once(Phaser.Scenes.Events.SHUTDOWN, ...)` block, rebuild, and press H a few times.
  There is **no error and the numbers are right** - but the "listeners" counts go 2, 3, 4. Ask why it
  still works (the scene object is reused, so old listeners call the same `HudScene`, whose fields
  now point at the new texts). Then ask: what if `showCoins` also played a sound?
- **Late listeners.** In `ch06_hud_events`, press 2 a few times, then H: `Gems: ?`. Ask why coins and
  stars survive a HUD restart and gems do not. Lead them to "events are news, not state".
- **Forgetting `this.scene.stop(HUD_SCENE)`.** Remove that line from `GameScene.endGame()` in
  `ch06_coin_collector`: the HUD bar stays on top of the game over screen (checked in a scratch
  copy: the active scenes were `HudScene, GameOverScene`). Pressing SPACE then relaunches the HUD,
  which *restarts* it - so it looks fine again, hiding the bug.
- **Why validate?** Show `ch06_high_score_table` starting normally with a corrupt value in storage,
  then with the `try`/`catch` removed: a blank screen and a `SyntaxError` in the console.

## Key points to stress

- **Tell, then listen.** Scenes call the `ScoreManager`'s methods to report what happened; they
  never set the score. The `ScoreManager` emits events and never knows who listens. Most students'
  first design has the game scene updating HUD text directly, or the HUD reading game-scene fields
  every frame - both work, and both are worth comparing to this
- **Events are news, not state.** Anything that starts later (a launched HUD starts a frame late)
  must read the current values as well as listen
- **Clean up what you add to someone else's emitter.** Phaser clears a scene's own objects, timers
  and input listeners on shutdown. It does *not* remove listeners the scene put on the game, the
  registry, another scene, or a ScoreManager
- **`on(event, fn, this)`** - the third argument matters, and `off` needs the same three things
- **Never trust stored data.** Storage is shared by the whole site (every project in this book is
  served from 127.0.0.1:8000), can be edited by the player, and outlives versions of your game
- a new `ScoreManager` per game is the cleanest reset there is - contrast with Chapter 2's `init()`

## Common problems and errors

These messages were produced by making each mistake in a scratch copy of the chapter projects.

| What students see | Cause | Fix |
|---|---|---|
| Nothing wrong, but `listenerCount` climbs; effects play twice after a restart | listeners on another emitter not removed on `SHUTDOWN` | `off(...)` them in a `SHUTDOWN` handler |
| `TypeError: Cannot read properties of undefined (reading 'addCounter')` when the score changes | `this.scoreManager.on(SCORE_CHANGED, this.countUpTo)` - no context, so `this` is the ScoreManager | pass `this` as the third argument (and to `off`) |
| `Argument of type 'number \| null' is not assignable to parameter of type 'number'.` | `this.showScore(tween.getValue())` in a counter tween | `tween.getValue() ?? 0` |
| `Argument of type 'string \| null' is not assignable to parameter of type 'string'.` | `JSON.parse(localStorage.getItem("scores"))` | check for `null` first |
| `Type 'Scene' is missing the following properties from type 'GameScene': coins, gems, preload, init, and 6 more.` | `this.gameScene = this.scene.get(GAME_SCENE);` into a `GameScene` field | `this.scene.get<GameScene>(GAME_SCENE)` |
| Blank screen; console: `SyntaxError: Unexpected token 'h', "this is not json" is not valid JSON` | `JSON.parse` with no `try`/`catch`, and bad data in storage | `try`/`catch`, and start with an empty table |
| The HUD never updates from the registry, or misses the first value | listening for `changedata-score` when the key is new: the first `set` sends `setdata` | set the key before anything listens (as `GameScene.init()` does), and read the current value when the listener starts |
| The HUD restarts (score display resets) whenever the game scene restarts | `this.scene.launch(HUD_SCENE)` on a HUD that is already running restarts it | `if (!this.scene.isActive(HUD_SCENE))` |
| HUD bar still showing over the game over screen | no `this.scene.stop(HUD_SCENE)` at game over | stop it before starting the next scene |
| The old "new" row still flashes on the title screen after a later game | `this.scene.start(TITLE_SCENE)` with no data reuses the data it was last started with | pass `{}` |
| The initials screen types an extra letter, or the confirm prompt (challenge 4) cancels itself | a `keydown` listener added inside another key's listener receives the same key press | one `keydown` listener with a state flag |
| Scores "disappear" | playing in Celbridge's `game.webview` then in Chrome (or the other way round) - each browser has its own storage | expected; explain |
| Scores from another project appear, or vanish | two games using the same storage key on 127.0.0.1:8000 | a key that names the game |

## Discussion questions

- The ScoreManager extends `Phaser.Events.EventEmitter`. It could instead *have* one:
  `public readonly events = new Phaser.Events.EventEmitter();` - which is how `this.registry.events`
  works. What changes for the callers? Which do you prefer, and why? (Inheritance exposes `emit` to
  everyone, so any class can fake a `SCORE_CHANGED`; composition could keep `emit` private-ish.)
- `emit` is not type-checked. How could we make `SCORE_CHANGED`'s arguments checked by the compiler?
  (Typed wrapper methods such as `onScoreChanged(fn: (score: number) => void)`.)
- The game scene plays the level-up sound; the HUD shows the level-up banner. Both listen to
  `LEVEL_CHANGED`. Should the ScoreManager play the sound? Why not?
- Where should "best score this session" live - the registry, the ScoreManager, or the table?
- The high score table is loaded afresh by every scene that needs it, rather than kept in memory.
  What are the advantages? When would it be a bad idea?
- What could a player do to cheat the table? Can a browser game ever stop that? (No - anything in
  the browser can be edited. Only a server can keep honest scores.)

## Extension ideas

- a pause scene (Chapter 4) that shows the ScoreManager's numbers - a third listener, for free
- unit-test the scoring rules: extract them into a class that does not extend a Phaser class (take
  an emitter in the constructor, or return results), and test it with `deno test`
- save the whole game's settings (volume from Chapter 5, difficulty from challenge 6) as one JSON
  object under one key, with a `version` number and a migration when the shape changes
- show the table with a stagger tween, rows sliding in one after another (a preview of Chapter 7)

## Assessment ideas

- Practical: "add a *time bonus*: points for every second survived, shown in the HUD, without the
  HUD reading anything from the game scene"
- Code reading: show a HUD `create()` with `on` calls and no `SHUTDOWN` handler; ask what goes
  wrong, when, and how they would prove it (listener counts)
- Short answer: what is the difference between `unknown` and `any`, and why is `JSON.parse`'s
  result better treated as `unknown`?
- Design: draw the "tells / announces" diagram for a game of their choice (lives, ammo, keys)

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
