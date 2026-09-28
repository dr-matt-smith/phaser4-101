# Chapter 10, challenge 4 - Treasure tiles

**Teacher's solution to Chapter 10, challenge 4.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 4` comment.

(Originally: Scrolling World)

A random cave, 60 x 40 tiles - much bigger than the screen - made in code every time the scene
starts. The camera follows the player round it and stops at the edges of the map, and a second
camera in the corner shows the whole cave as a minimap. Find the ten treasure chests. It goes with
**Chapter 10 - Tilemaps**.

## Controls

| Control | Does |
|---|---|
| arrow keys | walk |
| R | a new cave |

## What to look at

- `src/Cave.ts` - makes the cave as plain data (rock or floor), with random noise smoothed by
  "cellular automata", and a flood fill that removes any part the player could not reach
- `src/scenes/WorldScene.ts` - two layers made with `createBlankLayer`: a floor filled with
  `weightedRandomize`, and walls filled with `putTilesAt` from `wallTiles()` (`-1` where the cave is
  open) and `setCollisionByExclusion`; the camera's `setBounds` and `startFollow`; the physics world's
  `setBounds`; the HUD's `setScrollFactor(0)`; `addMinimap()` - a second camera, and `ignore`
- `src/objects/Player.ts` - the same class as in `ch10_array_map`, unchanged

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
