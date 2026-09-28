# Chapter 10, challenge 5 - Map from strings

**Teacher's solution to Chapter 10, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Array Map)

A top-down map built from a 2D array of numbers and the four tiles in `simple_tiles.png`: grass,
water, walls and sand. A hero walks round it with the arrow keys, but cannot walk into walls or
water - the tilemap layer collides with the player's Arcade Physics body. The strip below the map
says which tile the player is standing on. It goes with **Chapter 10 - Tilemaps**.

## Controls

| Control | Does |
|---|---|
| arrow keys | walk (diagonals too) |
| D | show / hide which tiles collide |

## What to look at

- `src/level.ts` - the map: one inner array per row, one tile index per column
- `src/tiles.ts` - what each tile index means
- `src/scenes/GameScene.ts` - `create()` builds the map in five steps: `make.tilemap`,
  `addTilesetImage`, `createLayer`, `setCollision`, `physics.add.collider`; `update()` uses
  `getTileAtWorldXY` to find the tile under the player; `toggleDebug()` uses `renderDebug`
- `src/objects/Player.ts` - an Arcade Physics sprite that sets its own velocity from the arrow keys,
  with a body smaller than its picture so it fits through a one-tile door

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
