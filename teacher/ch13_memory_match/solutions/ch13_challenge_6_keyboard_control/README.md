# Chapter 13, challenge 6 - Keyboard control

**Teacher's solution to Chapter 13, challenge 6.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 6` comment.

(Originally: Memory Match Deluxe)

The full memory game: four levels on bigger and bigger boards, a menu, and two sets of tiles - the
pictures, or playing cards, where a pair is two cards of the same rank and colour (the seven of hearts
matches the seven of diamonds). Each level has one peek, which shows every tile for a moment, and on
the later levels the unmatched tiles shuffle themselves after too many wrong guesses. Your best
result for every level is saved in the browser. It goes with **Chapter 13 - Memory match**.

## Controls

| Control | Does |
|---|---|
| mouse | choose the tiles and a level; click a tile to turn it over; the buttons |
| P | peek: every tile face up for a moment (once per level; costs the third star) |
| ESC | back to the menu |

## What to look at

- `src/themes/Theme.ts` - the `Theme` interface: what any set of tiles must provide. `PictureTheme`
  and `CardTheme` implement it; a `TileFace` has a `matchKey`, so two different pictures can match
- `src/levels.ts` - the levels as data
- `src/scenes/GameScene.ts` - six states; `layOutGrid()` scales the board to fit;
  `peek()` and `shuffleUnmatched()` are the two new locked states
- `src/objects/Tile.ts` - flips return to the tile's `baseScale`; `slideTo()` for the shuffle
- `src/objects/Button.ts` - a button made from a `Container` holding an image and a text
- `src/BestResults.ts` - best results in local storage, checked when read back

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
