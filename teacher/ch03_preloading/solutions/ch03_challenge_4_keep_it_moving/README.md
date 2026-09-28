# Chapter 3, challenge 4 - Keep it moving

**Teacher's solution to Chapter 3, challenge 4.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 4` comment.

(Originally: Loading Screen)

The Boot -> Preload -> Menu pattern. A tiny boot scene loads the logo; the preload scene shows it,
with a progress bar and the name of the file being loaded, while it loads everything else the game
needs (pictures, sprite sheets, sounds and music - plus 150 extra copies of small pictures, so that
the bar can be seen at all); then the menu starts, and shows what was loaded. It goes with
**Chapter 3 - Preloading**.

## Controls

| Control | Does |
|---|---|
| SPACE | (menu) plays a sound that the loading screen loaded |
| R | (menu) runs the boot and loading scenes again - this time with nothing left to load |

Files on your own computer load in a blink. To watch the bar properly, open the game in Chrome or
Edge, open the developer tools (F12), and on the **Network** tab tick **Disable cache** and choose
**Fast 4G** from the throttling menu (or **Slow 4G**, for a long wait). Then refresh.

## What to look at

- `src/main.ts` - the three scenes, in order
- `src/scenes/BootScene.ts` - loads just the logo, then starts the loading screen
- `src/scenes/PreloadScene.ts` - `preload()` draws the screen, listens for the loader's
  `"progress"`, `"fileprogress"` and `"complete"` events, and queues every file; `setPath()`;
  `COPIES`
- `src/scenes/MenuScene.ts` - uses what was loaded, with no `preload()` of its own
- `src/assets.ts` - every file's key

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
