# Chapter 2, challenge 5 - The decoy

**Teacher's solution to Chapter 2, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Click the Ball Plus)

The three-scene game from `ch02_click_the_ball`, made into a better game: five hits to win, a ball
that speeds up and jumps after every hit, a time penalty for every miss, sounds, and a best time
that the title screen remembers. It goes with **Chapter 2 - A three-scene game**.

## Controls

| Control | Does |
|---|---|
| SPACE | starts the game; plays again from the win screen |
| mouse | click the ball (clicking anywhere else is a miss) |
| ESC | back to the title screen |

## What to look at

- `src/scenes/PlayScene.ts` - `init()` resets the round; `this.input.on("pointerdown", ...)` spots
  misses; the data handed to `WinScene`
- `src/scenes/WinScene.ts` - `this.registry` keeps the best time between scenes
- `src/scenes/StartScene.ts` - reads the best time from the registry
- `src/objects/Ball.ts` - `speedUp()` and `teleport()`, which the scene calls

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
