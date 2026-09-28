# Chapter 12, challenge 1 - Aces high

**Teacher's solution to Chapter 12, challenge 1.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 1` comment.

(Originally: Higher or Lower - Simple)

The simplest complete version of higher or lower. One card is face up; press H if you think
the next card will be higher, L if lower. Get five right in a row to win; a wrong guess sends you
back to zero. It is all in one scene, with a `Card` class for the data and plain images for the
pictures. It goes with **Chapter 12 - Higher or lower**.

## Controls

| Control | Does |
|---|---|
| H | guess that the next card is higher |
| L | guess that the next card is lower |
| SPACE | play again, after winning |

## What to look at

- `src/Card.ts` - a card as data: `suit`, `rank`, and the `value` that higher and lower compare
- `src/scenes/GameScene.ts` - `frameFor()` (which picture shows a card), `guess()`, `judge()`
  (the rules, ties included), and the `state` field that ignores keys while a card is showing

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
