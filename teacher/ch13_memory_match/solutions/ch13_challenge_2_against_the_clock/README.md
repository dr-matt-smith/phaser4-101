# Chapter 13, challenge 2 - Against the clock

**Teacher's solution to Chapter 13, challenge 2.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 2` comment.

(Originally: Memory Match Plus)

The memory game with polish: sixteen tiles that flip over with a tween, a moves counter and a clock,
sounds, a title screen, and a win screen that gives you up to three stars for finding the eight pairs
in as few moves as you can. It goes with **Chapter 13 - Memory match**.

## Controls

| Control | Does |
|---|---|
| mouse | click to start; click a tile to turn it over; click to play again |
| ESC | on the win screen, back to the title screen |

## What to look at

- `src/objects/Tile.ts` - `flipTo()` is the flip: two tweens of `scaleX`, with the frame swapped
  in between; `flipUp()` and `flipDown()` take a callback for when the flip has finished;
  `celebrate()` is a tween chain
- `src/scenes/GameScene.ts` - the four states, and `checkPair()`, which only runs once the second
  tile has finished turning over; the clock starts at the first click
- `src/rating.ts` - moves to stars, in one small function
- `src/scenes/WinScene.ts` - the stars, earned ones popping in one after another
- `src/scenes/StartScene.ts` - loads everything; the row of tiles uses a tween with a stagger

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
