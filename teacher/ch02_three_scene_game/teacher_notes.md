# Chapter 2 - A three-scene game: teacher notes

## Overview

Students build a complete (tiny) game with a beginning, a middle and an end. The Phaser ideas are
**scenes and the scene manager**, **passing data between scenes**, and **pointer input on game
objects**; the TypeScript ideas are **interfaces**, **object literals**, **union types** and the
**spread operator**. The one conceptual trap - scene objects are reused, so fields keep old values -
is worth a whole discussion: it is the most common "my game works once" bug students will write this
term.

## Prerequisites

- Chapter 1: building and serving, config/scene/game object, `preUpdate` and `delta`
- Java interfaces (for the analogy with TypeScript interfaces)

## Learning outcomes

Students can:

1. structure a game as several scenes, and move between them with `this.scene.start(key, data)`
2. pass data between scenes through `init(data)`, described by an `interface`
3. explain why a restarted scene keeps its field values, and reset them in `init()`
4. make a game object respond to the pointer with `setInteractive()` and `"pointerdown"`, and detect
   clicks on nothing with `this.input.on("pointerdown", ...)`
5. choose between `on` and `once` for an event
6. share a value between scenes with `this.registry`

## Suggested session plan (2 hours)

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play `ch02_click_the_ball` together. Ask: "how many screens? what moves you between them?" Draw the scene-flow diagram on the board before showing it |
| 0:10 - 0:30 | Slides 3-8: scenes, keys, `scene.start`, `on` vs `once`, loading once. Walk through `StartScene.ts` |
| 0:30 - 0:45 | Slides 9-11: `setInteractive`, `pointerdown`, the clock. Walk through `PlayScene.ts` |
| 0:45 - 1:00 | Slides 12-13: passing data, interfaces. Challenges 1-3 |
| 1:00 - 1:15 | **Live demo of the trap**: in the plus version, comment out the body of `init()` in `PlayScene`, win once, play again - the first click wins. Ask students to explain before revealing slide 14 |
| 1:15 - 1:30 | Slides 15-17: the plus version: misses, encapsulation, sound, registry, spread |
| 1:30 - 2:00 | Challenges 4-6 |

## Key points to stress

- `scene.start` **shuts down** the current scene: its game objects are destroyed and its listeners
  removed. Students sometimes expect the old scene to be "underneath" still
- scenes talk to each other through **data passed to `start`** (one-off hand-over) or the
  **registry** (shared, long-lived). Resist letting students reach into other scenes with
  `this.scene.get(...)` to read their fields - it couples scenes tightly (Chapter 6 shows events,
  which are better still)
- the object is reused: **`init()` is where a scene resets itself**
- the `Ball` class did not change to become clickable - the **scene** decided. A good moment to talk
  about keeping classes focused

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| Pressing SPACE does nothing; no error | scene key misspelled as a string (`"Playscene"`) | use the constants in `keys.ts` |
| Second round starts with the old score/hits, or ends instantly | fields reset only where declared | reset in `init()` |
| `Property 'seconds' does not exist on type 'object'` | `init(data: object)` or untyped `data` | type the parameter with the interface |
| `Object literal may only specify known properties, and 'secs' does not exist in type 'WinData'` | misspelled property in the data | this is the interface doing its job |
| Clicking the ball does nothing | forgot `setInteractive()` | game objects ignore the pointer until made interactive |
| Every click counts as a miss, including hits | the scene-wide listener ignores the `over` parameter | check `over.length === 0` |
| No sound in the plus version | the browser blocks audio until the page has been clicked or a key pressed | click the game first; mention Chapter 5 |
| `'best' is possibly 'undefined'` | using `best.toFixed()` without checking | this is the union type `number | undefined` working - check before use |

## Discussion questions

- Why keep scene keys in one file? What other strings in a game deserve the same treatment? (Asset
  keys, event names, registry names.)
- `WinScene` needs the time. Name three ways it could get it. (Data passed to `start`, the registry,
  reading `PlayScene`'s field.) Which is best, and why?
- In the plus version the ball's speed is private and the scene calls `speedUp()`. What would be
  lost if the scene set `ball.speedX` directly?
- Is "Too slow!" (challenge 4) a win scene any more? When is it right to reuse a scene with a flag,
  and when should it be a new scene?

## Extension ideas

- add a pause: `this.scene.pause()` and `this.scene.resume()`, and a "PAUSED" text
- launch a second scene **on top** of the play scene (`this.scene.launch(...)`) for a HUD - a preview
  of Chapter 6
- make the ball a different random colour each round with `setTint(...)`

## Assessment ideas

- Practical: "add a fourth scene - an instructions screen between start and play - with its own key,
  reached by SPACE, left by SPACE"
- Code reading: show `PlayScene` without `init()`, and a transcript of two rounds; ask for the bug and
  the fix
- Short answer: the difference between `this.registry` and the data passed to `this.scene.start`

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
