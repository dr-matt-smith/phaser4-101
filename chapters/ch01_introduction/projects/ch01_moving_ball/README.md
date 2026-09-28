# Moving Ball

A ball that moves by itself and bounces off the edges of the game. It shows the **game loop**:
Phaser calls the ball's `preUpdate()` and the scene's `update()` about 60 times a second. It goes
with **Chapter 1 - Introduction**.

## Controls

None - just watch.

## What to look at

- `src/objects/Ball.ts` - a class that extends `Phaser.GameObjects.Image`; `preUpdate()` moves it
  by `speed * seconds` and turns it round at the edges
- `src/scenes/GameScene.ts` - makes one `Ball`; `update()` shows the time and the frame rate

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
