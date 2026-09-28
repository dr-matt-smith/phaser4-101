# Chapter 12, challenge 5 - Double or nothing

**Teacher's solution to Chapter 12, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Higher or Lower - Advanced)

The full game. Play right through one deck with three lives. Every right guess adds points to a
pot - more for a risky guess (the buttons show the multiplier) and more the longer your run. Cash
out to bank the pot; guess wrong and you lose the pot and a life. Cards played line up along the
bottom, and the best score and longest run are saved in the browser. It goes with **Chapter 12 -
Higher or lower**.

## Controls

| Control | Does |
|---|---|
| mouse | click PLAY, HIGHER, LOWER, CASH OUT, PLAY AGAIN and MENU |
| H | guess higher |
| L | guess lower |
| C | cash out: bank the pot |
| D | double or nothing: red doubles the pot and banks it, black loses it |

## What to look at

- `src/rules.ts` - `winningRanks()`, `riskMultiplier()` and `pointsFor()`: the scoring, with no
  Phaser in it
- `src/Records.ts` - the best score and longest run, in local storage
- `src/scenes/GameScene.ts` - `guess()`, `reveal()`, `moveOn()` (two `CardSprite`s that swap
  jobs), `cashOut()`, `endGame()`; the polish methods `floatText()` and `pulse()`
- `src/objects/CardSprite.ts` - `flipTo()` now lifts the card as it turns; `slideTo()` deals it
- `src/objects/HistoryRow.ts` - a `Container` of small cards that slide along as new ones arrive

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
