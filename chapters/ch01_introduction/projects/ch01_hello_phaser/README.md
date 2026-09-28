# Hello Phaser

The smallest useful Phaser game: a config in `main.ts`, one scene, a loaded picture, some text,
and a key that does something. It goes with **Chapter 1 - Introduction**.

## Controls

| Key | Does |
|---|---|
| SPACE | changes the background colour, and counts the presses |

## What to look at

- `src/main.ts` - the game config: size, scale mode, and the list of scenes
- `src/scenes/HelloScene.ts` - `preload()` loads two pictures; `create()` adds them, adds text, and
  listens for SPACE; `changeColour()` responds

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
