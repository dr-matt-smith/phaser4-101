# Chapter 11, challenge 5 - Moving platforms

**Teacher's solution to Chapter 11, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Tiled Level)

**The map:** in `tiled/level1.tmx` (and its export `public/assets/maps/level1.tmj`) the floating platform over the wide pool has been erased, and a polyline object called **platform** added in its place. The maps were written by `../../tools/make_solution_maps.ts`; they open in Tiled like any other.

A side-on platform level made in the Tiled map editor. The ground, the scenery, where the player
starts, the coins, the enemies (and how fast each one walks) and the finish flag are all in the map
file; the code loads the map and says what each thing does. Solid tiles and dangerous tiles are
chosen by custom properties set on the tileset in Tiled. It goes with **Chapter 11 - Tilemaps with
Tiled**.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT | run |
| UP or SPACE | jump |
| D | show which tiles are solid (collision debug) |
| R | start the level again |

## The map

- `tiled/level1.tmx` - the map's source. Open it in [Tiled](https://www.mapeditor.org/) (1.10 or
  later) to change the level
- `public/assets/maps/level1.tmj` - the map exported as JSON, which the game loads. After changing
  the map in Tiled, use **File > Export** (Ctrl+E / Cmd+E) to write it again, then build

## What to look at

- `src/scenes/GameScene.ts` - `preload()` loads the map with `tilemapTiledJSON`; `createMap()` joins
  the tileset to its picture and makes the layers; `setCollisionByProperty` makes tiles solid;
  `createPlayer()`, `createCoins()`, `createEnemies()` and `createGoal()` each read the object layer a
  different way (`findObject`, `createFromObjects`, `getObjectLayer`); `touchingHazard()` reads a tile
  property
- `src/assets.ts` - the tileset and layer names, which must match the names in Tiled
- `src/tiled.ts` - `getTiledProperty()`, for reading custom properties on objects and on the map
- `src/objects/Slime.ts` - an enemy whose speed comes from Tiled, and which looks at the tile ahead
  to turn round at edges

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
