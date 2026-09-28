# Chapter 13, challenge 1 - Choose the size

**Teacher's solution to Chapter 13, challenge 1.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 1` comment.

(Originally: Memory Match)

The simplest complete memory game: twelve tiles, face down, in a 4 x 3 grid. Click a tile to turn
it over, then click another. If they show the same picture they stay face up; if not, they turn back
after a second. Find all six pairs to win. It goes with **Chapter 13 - Memory match**.

## Controls

| Control | Does |
|---|---|
| mouse | click a tile to turn it over |
| SPACE | play again, once every pair is found |

## What to look at

- `src/scenes/GameScene.ts` - `makeFaces()` makes the pairs and shuffles them; `layOutGrid()`
  places the tiles with two loops; `tileClicked()` is the state machine, and `"twoUp"` is the
  state that locks the board
- `src/objects/Tile.ts` - a tile is an `Image` showing one frame of a sprite sheet; `showFace()`
  and `hideFace()` just change the frame

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
