# Chapter 12 - Higher or lower: teacher notes

## Overview

The first genre chapter. Students meet one small game three times - simple, intermediate, advanced -
and the real subject is **how a game's code grows**: from one scene with a few fields, to a model
(`Card`, `Deck`, `rules.ts`) kept apart from a view (`CardSprite`, `Button`, `HistoryRow`), with a
scene in between. Along the way: a union-of-strings state machine that ignores input at the wrong
moment, a Fisher-Yates shuffle (and why the popular `sort` trick is biased), a flip made of two
tweens, a reusable button, and a risk-and-reward scoring system. There is little new Phaser here;
there is a lot of design.

It is also the first chapter where students should *play critically*: why is the advanced version
more fun than the simple one, when the underlying luck is the same?

## Prerequisites

- Chapters 1-2: scenes, `init(data)`, interfaces, pointer input, the "scenes are reused" trap
- Chapter 3: a preload scene; Chapter 5: playing sounds; Chapter 6: local storage
- Chapter 7: tweens, tween chains, particles
- Java: `final` fields, getters, enums, `Predicate<T>` (for challenges 3 and 6)

## Learning outcomes

Students can:

1. separate a game's model (plain TypeScript data and rules) from its view (Phaser game objects),
   and explain what each change touches
2. use unions of string literals for small sets of values (suits, guesses, outcomes, states)
3. implement a Fisher-Yates shuffle and explain why `sort(() => Math.random() - 0.5)` is biased
4. keep a game state, and ignore input while the game is busy
5. animate a card flip with a tween chain and change a sprite's frame (or texture) mid-animation
6. build a reusable `Container`-based button with hover, pressed and disabled states
7. design scoring that rewards risk (a pot, a multiplier, a cash-out choice) and persist records

## Suggested session plan (2 x 2 hours)

**Session 1 - simple and intermediate**

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play all three versions for two minutes each, in order. Ask: "which is most fun, and *why*? The luck is identical." Collect answers on the board (risk, streak, reveal) |
| 0:10 - 0:30 | Slides 3-7: genre notes, the simple version - `Card`, frames, `judge()`, `GameState`. Walk through `GameScene.guess()` |
| 0:30 - 0:45 | **Live demo**: delete the state check at the top of `guess()`, rebuild, and mash H. Ask what went wrong before explaining |
| 0:45 - 1:00 | Challenge 1 (aces high). Then ask who changed `rank` instead of `value` - see Common problems |
| 1:00 - 1:25 | Slides 8-11: model and view, the deck, **the shuffle bias** (run the experiment - see Demos), `draw()` and `Card \| undefined` |
| 1:25 - 1:40 | Slides 12-14: the flip, buttons, the state machine. Live-code: change `Sine.easeIn`/`easeOut` to `Linear`, then change `scaleX` to `scale` |
| 1:40 - 2:00 | Challenges 2 and 3 |

**Session 2 - advanced**

| Time | Activity |
|---|---|
| 0:00 - 0:20 | Slides 15-17: the pot, multipliers, cash out. Discussion: "with only a score, what is the best strategy?" (always guess the likely way - no decisions). "With a pot?" |
| 0:20 - 0:35 | Slide 18: dealing, sprites that swap jobs, the history row, records, polish |
| 0:35 - 0:45 | Polish exercise: turn off one piece of polish at a time (comment out the shake, the float text, the sparkles). Which one did the class miss most? |
| 0:45 - 1:15 | Challenge 4 (jokers wild) |
| 1:15 - 2:00 | Challenges 5 and 6. Finish with the computer playing (challenge 6) on the projector |

## Key points to stress

- **The model never imports Phaser.** Point out that `Card.ts`, `Deck.ts` and `rules.ts` could run
  in a plain Deno script (they can - see Demos). The next chapter (memory match) needs a deck too
- **The scene asks, then tells.** `judge()` returns an outcome; the scene decides what sound and
  text go with it. Rules never play sounds
- **One gate for all input.** H, L and both buttons all call `guess()`; the state check lives there
  once. If students add a new input (challenge 5's D, challenge 6's computer), it must go through the
  same gate
- **Order of the reveal.** `reveal()` runs *after* the flip completes. Play the result sound before
  the card is visible and the tension goes - worth demonstrating
- **The shuffle is a correctness issue, not style.** The chart in the chapter is real data from
  V8, the engine in Chrome and Deno
- **`value` versus `rank`.** Two names for what are equal today and different tomorrow (aces high)

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| Every card shows as the next rank up; the king of spades shows as a card back | frame formula missing `- 1`: `suit * 13 + rank` | `suit * 13 + (rank - 1)` |
| Aces high "works" but the ace of spades is a card back | challenge 1 done by changing `rank` to 14, so the frame is `suit * 13 + 13` | change `value`, not `rank` |
| Mashing H deals two cards and judges both against the same card to beat | no `state` check at the top of `guess()` | `if (this.state !== "waiting") return;` |
| Card shrinks to a dot instead of flipping | tweening `scale` instead of `scaleX` | `scaleX` only |
| `TypeError: this.showFace is not a function` at the first flip (in the browser console); the build was fine | `onComplete: function () { this.showFace(card); }` - a `function` has its own `this` | arrow function: `onComplete: () => { ... }` |
| `Type 'Card \| undefined' is not assignable to type 'Card'.` | `draw()` returning `this.cards.pop()` directly | check for `undefined` first (and throw) |
| `Error: The deck is empty` (console, in `Deck.draw`) | drawing from an empty deck - e.g. a challenge that plays through the whole deck | check `isEmpty()` before drawing |
| `Property 'add' in type 'HistoryRow' is not assignable to the same property in base type 'Container'.` (and `This member must have an 'override' modifier because it overrides a member in the base class 'Container'.`) | naming a method `add` in a `Container` subclass | pick another name, e.g. `addCard` |
| `Argument of type '"down"' is not assignable to parameter of type 'Guess'.` | `this.guess("down")` | the union type doing its job - use `"lower"` |
| `This comparison appears to be unintentional because the types 'Guess' and '"hihger"' have no overlap.` | a typo in a string being compared | the union catches typos in comparisons too |
| `Cannot assign to 'rank' because it is a read-only property.` | trying to change a card (often while attempting aces high) | cards do not change; change `value`'s getter |
| `Texture "cards" has no frame "joker"` (console warning) and the ace of clubs appears | `setFrame(JOKER_KEY)` for a texture that is not in `cards.png` | `setTexture(JOKER_KEY)` |
| No sound until the first click | the browser's autoplay rule (Chapter 5) | expected; the title screen's PLAY click unlocks audio |

## Suggested demos and live-coding moments

- **The shuffle experiment.** In a scratch file, run in Deno:
  ```ts
  const counts: Record<string, number> = {};
  for (let i = 0; i < 600000; i++) {
    const order = ["A", "B", "C"].sort(() => Math.random() - 0.5).join("");
    counts[order] = (counts[order] ?? 0) + 1;
  }
  console.log(counts);
  ```
  ABC and BAC come out about 150,000 times each; the other four about 75,000. Then swap in
  Fisher-Yates and run again (100,000 each). Students believe a number they watched appear
- **The model runs without Phaser.** `deno eval 'import { Deck } from "./src/Deck.ts"; const d = new Deck(); console.log(String(d.draw()), String(d.draw()));'`
  from the intermediate project folder. No browser, no Phaser - that is what model/view buys
- **Remove the state check** (session 1) - and then, in the advanced version, remove the
  `multiplier === 0` part of the check in `guess()` and try H on a king (nothing breaks; the guess
  is just always lost - why was it greyed out?)
- **Easing**: `Sine.easeIn`/`easeOut` versus `Linear` on the flip; `Back.easeOut` on the title's aces
- **Turn the polish off** one piece at a time (session 2)

## Discussion questions

- The simple, intermediate and advanced versions have the same odds. Why is the advanced one more
  fun? Which single feature adds the most?
- A tie "does not count". What would change if a tie counted as a loss? As a win? Where in the code
  would you change it, and what else would need to change (text, the title screen)?
- `Card` has no `x`, `y` or `faceUp`. Where do those live, and why? What would go wrong if `Card`
  extended `Phaser.GameObjects.Image`?
- `winningRanks()` pretends all 13 ranks are equally likely. When is that badly wrong? (Late in the
  deck.) Should the multipliers use the real deck? Would that make the game better or just harder to
  understand?
- Is the pot-and-cash-out design fair? What does a cautious player's score look like against a
  reckless one's? (Challenge 6 lets you test it.)
- `GameOverScene` in the intermediate version handles both winning and losing. When should an ending
  be its own scene?

## Extension ideas

- a "bet" before each guess: the player chooses how much of their banked score to risk
- sound pitch rising with the streak (`this.sound.play(key, { detune: inARow * 100 })`)
- a two-player version, taking turns, with the history row shared
- move `Card`, `Deck` and `Button` into a shared folder and use them in Chapter 13's memory game
- unit tests for `judge()`, `riskMultiplier()` and `Deck` with `Deno.test` - they need no browser

## Assessment ideas

- Practical: "add a 'same' guess that pays x5 and wins only on a tie" - touches `Guess`, `judge()`,
  `riskMultiplier()`, a new button, and nothing in `Card` or `CardSprite`. Marking focuses on where
  the changes went
- Code reading: show a shuffle written with `sort(() => Math.random() - 0.5)` and ask what is wrong
  and how to show it is wrong
- Short answer: explain, with the flip as the example, why `reveal()` is called from the tween's
  `onComplete` rather than straight after `flipTo()`
- Design: "list three changes that would only touch the view, and three that would only touch the
  model"

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
