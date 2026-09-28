# Chapter 11, challenge 3 - A third room

**Teacher's solution to Chapter 11, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Tiled Doors)

**The maps:** in `tiled/hall.tmx` the closed door at the end of the carpet is now an open door, with a `door` object (target `treasure`, entrance `from_hall`) and a new entrance point, `from_treasure`. `tiled/treasure.tmx` is the new room. Each is exported to `public/assets/maps/`. **No code changed** - so there is no `// CHALLENGE 3` comment anywhere in `src/`. That is the point of the challenge. The maps were written by `../../tools/make_solution_maps.ts`; they open in Tiled like any other.

Two small top-down rooms, each made in the Tiled map editor with `dungeon_tiles.png`. Doors are
rectangle objects in Tiled with two custom properties - `target`, the map the door leads to, and
`entrance`, the point in that map where the player appears. Walking through a door fades out, loads
the next map (only the first time it is needed) and restarts the same scene with it. It goes with
**Chapter 11 - Tilemaps with Tiled**.

## Controls

| Control | Does |
|---|---|
| arrow keys | walk (diagonals too) |

Walk onto the stairs in the hall to go down to the cellar, and through the cellar's door to come
back.

## The maps

- `tiled/hall.tmx`, `tiled/cellar.tmx` - the maps' sources. Open them in
  [Tiled](https://www.mapeditor.org/) (1.10 or later) to change the rooms
- `public/assets/maps/hall.tmj`, `public/assets/maps/cellar.tmj` - the maps exported as JSON, which
  the game loads. After changing a map in Tiled, use **File > Export** (Ctrl+E / Cmd+E) to write it
  again, then build

## What to look at

- `src/scenes/RoomScene.ts` - `init(data)` is told which map and entrance to use; `preload()` loads
  only that map; `create()` builds the room; `goThrough()` restarts the scene with the door's target
- `src/objects/Door.ts` - a `Zone` made from a Tiled rectangle, reading its `target` and `entrance`
  properties
- `src/tiled.ts` - `getTiledProperty()`, for reading custom properties on objects and on the map
- `src/assets.ts` - there is no list of rooms: the maps themselves say how they join up

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
