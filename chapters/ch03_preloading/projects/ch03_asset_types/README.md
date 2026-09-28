# Asset Types

One file of each kind Phaser loads most often, each shown in a panel of its own: pictures, a sprite
sheet (shown frame by frame), sounds (click to play), a JSON file of level data (drawn as a little
level), a text file, and an asset pack (a JSON list of more files to load). One picture is missing
on purpose, to show what happens when a file fails to load. It goes with **Chapter 3 - Preloading**.

## Controls

| Control | Does |
|---|---|
| mouse | click a button in the audio panel to play that sound |

## What to look at

- `src/scenes/AssetTypesScene.ts` - `preload()` queues one of each kind of file, and records
  failures with `"loaderror"`; each `show...()` method reads one back from its cache
- `src/LevelData.ts` - an interface describing `level.json`
- `public/assets/data/level.json` and `public/assets/data/notes.txt` - the data and text files
- `public/assets/pack.json` - an asset pack
- `src/assets.ts` - every file's key and path (including `missing.png`, which does not exist)

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
