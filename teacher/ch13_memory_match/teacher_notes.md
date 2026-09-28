# Chapter 13 - Memory match: teacher notes

## Overview

The first "grid" game of the book, built three times. The Phaser content is light - sprite sheet
frames on an `Image`, `setFrame`, tweens and tween chains, `delayedCall`, a `Container`, particles -
and almost all of it was met in earlier chapters. The real subject is **program structure**: laying
out a grid with arithmetic rather than typed-in positions, writing game rules as a **state machine**,
and waiting for animations with **callbacks**. The advanced version adds an OO design discussion that
suits Java programmers well: a `Theme` interface with two implementations, and a `TileFace` that
separates what a tile *shows* from what it *matches*.

The one idea to get across above all others: **the board must be locked while tiles are showing**,
and a single `state` field is the cleanest way to do it. Students who "fix" the three-tiles-up bug
with a growing collection of booleans are the ones to talk to.

## Prerequisites

- Chapter 2: scenes, `init(data)` and resetting fields, `setInteractive` and `"pointerdown"`, the
  registry
- Chapter 5 (sounds), Chapter 6 (local storage, validating what is read back), Chapter 7 (tweens,
  chains, stagger, particles)
- Chapter 12: the `Card`/`Deck` split, Fisher-Yates, a flip made of two `scaleX` tweens, game state as
  a union of string literals, and the `cards.png` frame sum
- Java interfaces and lambdas (`Runnable`) for the analogies

## Learning outcomes

Students can:

1. lay out an R x C grid of game objects with nested loops, centred in the game, and convert between
   (row, col) and a flat index with `row * COLS + col`
2. make shuffled pairs (or groups) of values with `Phaser.Utils.Array.Shuffle`
3. show and change the frame of a sprite sheet on an `Image`
4. describe a game's rules as a state machine (states, events, transitions), implement it with a
   union type, and use it to ignore input in "locked" states
5. animate a flip with two tweens, and run code when it finishes by passing a callback
6. turn a performance (moves, time) into a rating, and show it
7. (advanced) design an interface that lets the same game use different sets of content, and
   describe levels as data

## Suggested session plan (2 x 2 hours)

**Session 1 - the simple and intermediate versions**

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play a physical round of pairs with a dozen cards, if you have some. Ask: "what are the rules, exactly? What happens if I turn over a third card while two are showing?" |
| 0:10 - 0:30 | Slides 3-6: what makes the genre work, tiles as sprite sheet frames, making pairs, the grid maths. Students draw the 4 x 3 grid on paper and work out the centre of tile 7 before seeing `layOutGrid` |
| 0:30 - 0:50 | Slides 7-9: the state machine, and trying the simple version. **Live demo:** delete `this.state = "twoUp"` in the simple version and click three tiles quickly - see "Common problems" below for the crash. Discuss why |
| 0:50 - 1:20 | Challenges 1 and 5 (both on the simple version) |
| 1:20 - 1:40 | Slides 10-13: the flip, callbacks, the fourth state, stars. Live-code the flip from scratch in a blank tile (one tween first, then the second in `onComplete`) |
| 1:40 - 2:00 | Start challenge 2 or 3 |

**Session 2 - the advanced version**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Play the advanced version, both themes. Ask: "what had to change so that two *different* cards can match?" |
| 0:15 - 0:40 | Slides 14-15: levels as data, the board that fits, the `Theme` interface and `matchKey`. Design discussion (below) |
| 0:40 - 0:55 | Slides 16-18: peek and shuffle as two more locked states; buttons and best results |
| 0:55 - 2:00 | Challenges 2, 3, 4 and 6 |

## Key points to stress

- **Positions are calculated, not typed.** A grid that centres itself from `ROWS`, `COLS`, `GAP` and
  the tile size can change size without anyone touching the layout code - which is exactly what
  challenge 1 and the advanced levels rely on
- **Gaps are one fewer than tiles.** `COLS * TILE_SIZE + (COLS - 1) * GAP`. The off-by-one here only
  shows as a grid slightly off-centre, so students often do not notice it
- **One `state` field, not several booleans.** A state machine can only be in one state at once, so
  impossible combinations cannot happen. Each new feature (a flip, a peek, a shuffle, a hint, a time
  limit) is a new state and a few new transitions
- **Test what is allowed, not what is forbidden.** The intermediate version locks with
  `state === "twoUp" || state === "checking"`; the advanced one with
  `state !== "idle" && state !== "oneUp"`. Only the second stays correct when a new locked state is
  added. Challenge 3 walks straight into this (see solutions.md)
- **Animations take time, so logic must wait for them.** The pair is checked in the second flip's
  callback, not straight after starting it; the board unlocks in the callback of the flip back
- **The tile knows what it is; the scene knows the rules.** `Tile` has `flipUp`, `celebrate`,
  `shake`, `matches` - nothing about pairs, moves or turns. That is why challenges 4 and 5 barely
  touch `Tile`
- **Shape and meaning are different things.** `frame` vs `matchKey` in the advanced version - the
  same idea as Chapter 12's model/view split

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| Three (or four) tiles face up at once, then `TypeError: Cannot read properties of null (reading 'matches')` in the console | the lock is missing: after a wrong pair the state stayed `"oneUp"` with `firstTile` already `null` (produced by deleting `this.state = "twoUp"` from the simple version) | put the game in a locked state while the wrong pair shows |
| `Argument of type 'Tile \| null' is not assignable to parameter of type 'Tile'. Type 'null' is not assignable to type 'Tile'.` | passing `this.firstTile` (a `Tile \| null`) where a `Tile` is needed | the state guarantees it is set: `this.firstTile!` - or check for `null` |
| `Type '"oneup"' is not assignable to type 'State'. Did you mean '"oneUp"'?` | a typo in a state name | this is why the states are a union type, not plain strings |
| The game restarts the moment the last pair is found | `this.input.once("pointerdown", ...)` added inside the tile's click handler: the same click reaches the scene's listener straight after (tested: the scene restarts on the winning click) | use a key, a `delayedCall`, or a separate win scene |
| Second game cannot be won; or tiles from the first game are still "there" | `tiles` (or `pairsFound`, `state`) not reset in `init()`; the array still holds the old, destroyed tiles | reset every field in `init()` - Chapter 2's trap |
| Grid is a little off-centre | gaps counted as `COLS * GAP` instead of `(COLS - 1) * GAP`, or the half-tile for the centre origin forgotten | check the sums against the diagram |
| The result sound plays before the second tile can be seen | the pair is checked straight after `flipUp()` starts, not in its callback | pass `() => this.checkPair()` to `flipUp` |
| After a flip, a scaled-down tile is suddenly full size | the flip tweens `scaleX` back to `1` | tween back to the tile's own base scale (advanced `Tile`) |
| A dark tile tinted yellow looks darker, not brighter | `setTint` multiplies colours | `setTintMode(Phaser.TintModes.ADD)` (challenge 3's solution), or tween `alpha`/`scale` instead |
| `Class 'CardTheme' incorrectly implements interface 'Theme'. Property 'backFrame' is missing in type 'CardTheme' but required in type 'Theme'.` | a class that `implements Theme` has left a property out | the interface doing its job - add it |
| `Property 'cards' is missing in type '{ pictures: PictureTheme; }' but required in type 'Record<ThemeName, Theme>'.` | a name added to `ThemeName` with no theme in `THEMES` (or the reverse) | add the theme; `Record` insists every key has a value |
| No sound on the first flip | the browser blocks audio until the page has been clicked | the title scene's "Click to start" solves this; mention Chapter 5 |

## Demos and live-coding

- **Remove the lock** (simple version): delete `this.state = "twoUp";` in `checkPair`, rebuild, and
  click three tiles quickly. Three tiles stay up and the console shows the `TypeError` above. Ask the
  class to trace, state by state, what happened
- **The flip from nothing**: in a blank scene, one tile. Tween `scaleX` to 0 - "now it has vanished,
  what next?" - add `onComplete` with `setFrame`, then the second tween. Then change the eases to
  `"Linear"` and compare
- **The easing matters**: in the intermediate project, set `HALF_FLIP` to 600 and watch the flip in
  slow motion; then try `"Back.easeOut"` on the second half
- **The trap of `once("pointerdown")`**: in the simple version, change `win()` to use
  `this.input.once("pointerdown", ...)`. Find the last pair - the game restarts instantly. Explain
  the order Phaser delivers the event (game object first, then the scene)

## Discussion questions

- Draw the state machine for the simple version on the board. Which transitions does each click
  cause? Which state has no transition on a click, and why is that the important one?
- Why is `face` `readonly` on a `Tile`? What could go wrong if the scene could change it?
- The intermediate version checks the pair in a callback. What would players notice if it checked
  straight away? (The sound and shake come before the second face is visible.)
- In the card theme, the seven of hearts matches the seven of diamonds. Why could the simple
  version's `Tile` (with `face: number`) not express that? What is the smallest change that could?
- `LEVELS` is an array of plain objects. What would change if each level were a subclass of a
  `Level` class instead? When would that be worth it? (When levels have different *behaviour*, not
  just different numbers.)
- Is the peek worth a star? How would you tune the star limits - by feel, or by recording real
  players' moves?

## Extension ideas

- a "flip everything face up for two seconds at the start" memorisation phase, as a new state
- a third theme - letters, numbers, or shapes drawn with `Graphics` and `generateTexture`
- matching by a *rule* rather than a picture: a number and a sum that makes it (7 and "3 + 4")
- a replay: record every click (time and tile) in an array, then play the game back
- a proper undo of the last pair? (Why does that not make sense for this genre?)

## Assessment ideas

- Practical: "add a fourth theme with its own `makeFaces` rule" (tests the interface), or "make the
  wrong-pair delay get shorter as more pairs are found" (tests the state machine and timers)
- Code reading: give the intermediate `tileClicked` and `checkPair` without comments, and a list of
  click times; ask which clicks are ignored
- Short answer: explain why the pair is checked in `flipUp`'s callback, and what a callback is,
  using a Java comparison
- Design: draw the state diagram for challenge 4 (two players) or challenge 5 (triples)

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
