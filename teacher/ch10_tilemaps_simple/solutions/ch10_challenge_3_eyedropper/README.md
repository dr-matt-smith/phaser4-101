# Chapter 10, challenge 3 - Eyedropper

**Teacher's solution to Chapter 10, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Tile Painter)

A tile map you paint with the mouse. Choose a tile with the number keys or the palette under the
map, then click or drag to paint; 0 is an eraser that leaves empty cells. The map can be saved in
the browser's `localStorage`, loaded again, and printed to the browser's console as a 2D array
that can be pasted straight into `ch10_array_map`'s `level.ts`. It goes with
**Chapter 10 - Tilemaps**.

## Controls

| Control | Does |
|---|---|
| mouse | click or drag to paint the chosen tile; click the palette to choose a tile |
| right click | pick up the tile under the mouse (Challenge 3) |
| 1 - 4 | choose grass, water, wall or sand |
| 0 | choose the eraser |
| S | save the map in the browser |
| L | load the saved map |
| C | clear the map (all grass) |
| P | print the map to the browser's console, as TypeScript |

## What to look at

- `src/scenes/PainterScene.ts` - `create()` makes an empty map with `createBlankLayer` and `fill`;
  `tileUnder()` uses `worldToTileXY`, `hover()` uses `tileToWorldXY`; `paint()` uses `putTileAt`
  and `removeTileAt`; `toArray()` reads the map back with `getTileAt`; `loadMap()` puts a whole
  array down with `putTilesAt`
- `src/objects/Palette.ts` - buttons made from the tileset loaded a second time as a sprite sheet;
  it tells the scene what was chosen through a function passed to its constructor
- `src/tiles.ts` - the tile indexes, and `EMPTY = -1`

To see what P prints, open the browser's developer tools (F12, or Cmd+Option+I on a Mac) and look
at the Console tab.

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
