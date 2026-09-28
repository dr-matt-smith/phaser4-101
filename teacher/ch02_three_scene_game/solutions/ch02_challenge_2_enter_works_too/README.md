# Chapter 2, challenge 2 - Enter works too

**Teacher's solution to Chapter 2, challenge 2.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 2` comment.

(Originally: Click the Ball)

A game in three scenes: a title screen that waits for SPACE, a bouncing ball to click as fast as
you can, and a win screen showing how long you took. It goes with **Chapter 2 - A three-scene
game**.

## Controls

| Control | Does |
|---|---|
| SPACE | starts the game; plays again from the win screen |
| mouse | click the ball |

## What to look at

- `src/main.ts` - the three scenes, in order; Phaser starts the first
- `src/scenes/keys.ts` - every scene's name, as a constant
- `src/scenes/StartScene.ts` - loads everything; `this.scene.start(PLAY_SCENE)` on SPACE
- `src/scenes/PlayScene.ts` - `setInteractive()` and `"pointerdown"` on the ball; times the round;
  hands the time to the win scene
- `src/scenes/WinScene.ts` - `init(data)` receives the time; the `WinData` interface

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
