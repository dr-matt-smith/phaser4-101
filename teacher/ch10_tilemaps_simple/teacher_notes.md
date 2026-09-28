# Chapter 10 - Tilemaps: teacher notes

## Overview

Students build tile worlds entirely in code. The Phaser ideas are the **three objects of a tilemap**
(`Tilemap` = data, `Tileset` = picture, `TilemapLayer` = game object), **tile collision** with Arcade
Physics, **finding and changing tiles** while the game runs, **converting between pixels and tiles**,
and the **camera** for a world bigger than the screen (bounds, follow, scroll factor, a second camera
as a minimap). The TypeScript ideas are 2D arrays (`number[][]`), `unknown` and a **type guard**,
**function types** for callbacks, and `Record<K, V>` (in the solutions). There is also a small
algorithm - cellular automata plus a flood fill - and a model/view split (`Cave` is data; the scene
draws it).

Chapter 11 does the same with maps made in Tiled, so this chapter deliberately builds every map in
code: students should come out understanding that a map is *just a grid of numbers*, which makes
Tiled's JSON unsurprising next week.

## Prerequisites

- Chapter 2: scene reuse and `init()` (used in `ch10_scrolling_world`)
- Chapter 6: `localStorage` and `JSON` (used in `ch10_tile_painter`)
- Chapter 7: sprite sheet animations and tweens (the hero's walk; challenge 6)
- Chapter 8: Arcade Physics bodies, `setSize`, colliders and their callbacks
- Java 2D arrays (`int[][]`), for the analogy with `number[][]`

## Learning outcomes

Students can:

1. explain what a tileset, a tile index and an empty tile (`-1`) are, and why games use tiles
2. build a map from a 2D array with `make.tilemap`, `addTilesetImage` and `createLayer`, and describe
   the job of each of the three objects
3. make tiles solid with `setCollision` / `setCollisionByExclusion` and a physics collider, and debug
   it with `renderDebug`
4. find tiles with `getTileAt` / `getTileAtWorldXY`, and convert between pixels and tiles with
   `worldToTileXY` / `tileToWorldXY`
5. change a map while the game runs with `putTileAt`, `removeTileAt`, `putTilesAt`, `fill`
6. set up a camera for a world bigger than the screen, keep a HUD fixed with `setScrollFactor(0)`, and
   add a second camera
7. contrast free movement with grid movement, and choose between them for a given game

## Suggested session plan (2 x 2 hours)

**Session 1 - maps, collision and editing**

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Show a screenshot of a well-known tile game (any top-down RPG or platformer) and ask students to find the repeated squares. How many different tiles? How big would the level be as one picture? |
| 0:10 - 0:25 | Slides 3-4: why tiles, indexes, the level as a 2D array. Students read `level.ts` and find the house and the bridge in the numbers |
| 0:25 - 0:45 | Slides 5-6: the three objects, the five steps in `create()`. **Live-code** the five steps into an empty scene, running after each one (see Demos) |
| 0:45 - 1:00 | Slide 7: collision; the smaller body; press D. Challenge 1 |
| 1:00 - 1:10 | Slide 8: `getTileAtWorldXY`, a `Tile`'s `x`/`y` vs `pixelX`/`pixelY` |
| 1:10 - 1:30 | Slides 9-12: the tile painter - blank layer, `worldToTileXY`/`tileToWorldXY`, put/remove, `-1`. Students paint a level, press P, paste it into `ch10_array_map` |
| 1:30 - 2:00 | Challenges 2 and 3 |

**Session 2 - big worlds and movement**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Recap quiz: what does `worldToTileXY(100, 70)` return? What does `tileToWorldXY(3, 2)` return? What index is an empty cell? |
| 0:15 - 0:35 | Slide 13: the cave generator. Do the cellular automaton **on paper** first (see Activities), then show `Cave.ts` |
| 0:35 - 0:55 | Slides 14-17: two layers, `setCollisionByExclusion`, camera bounds and follow, scroll factor, the minimap |
| 0:55 - 1:05 | Slide 18: free vs grid movement - discussion |
| 1:05 - 2:00 | Challenges 4-6 (6 is a good stretch for the strongest students; 5 suits everyone) |

## Key points to stress

- **a map is a grid of numbers**. Everything else - drawing, collision, the minimap - is Phaser
  reading those numbers. Changing the map at run time is changing a number
- **rows first**: `LEVEL[row][column]`, i.e. `[y][x]`. This is the single most common tile bug
- **the `Tilemap` is not drawn**. Layers are. A map can have several layers, and only the layers you
  collide with need collision set
- **`setCollision` is by index**, and remembered: tiles put down later with those indexes collide too.
  Collision has nothing to do with pictures - a map whose tileset fails to load still has walls
- **`tileToWorldXY` gives the top left corner** of a tile - add half a tile for the centre
- **a `Tile`'s `x` and `y` are in tiles**, not pixels (`pixelX`, `pixelY` are pixels). Students who
  have been using `sprite.x` for pixels all term will trip on this
- **`pointer.worldX`, not `pointer.x`**, whenever the camera can move. The painter's camera never
  moves, so both work - a good moment to say why the book uses `worldX` anyway
- the player body is **smaller than a tile** on purpose: a 32 x 32 body through a 32-pixel door has
  to be pixel-perfect
- generated levels: keep the **model** (`Cave`) separate from the **view** (the tilemap). The model
  can then be tested, reused, or drawn differently

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| The map is invisible, but the player bumps into invisible walls; the console says `Texture key "tilez" not found` | the key passed to `addTilesetImage` does not match the key the image was loaded with | use the constant; remember the first argument is used as the key when there is no second |
| `Type 'TilemapLayer \| TilemapGPULayer' is not assignable to type 'TilemapLayer'.` | storing `createLayer(...)` in a field typed `TilemapLayer` without the cast | `as Phaser.Tilemaps.TilemapLayer` (and explain why it is safe here) |
| `Argument of type 'Tileset \| null' is not assignable to parameter of type 'string \| string[] \| Tileset \| Tileset[]'.` | the result of `addTilesetImage` passed straight to `createLayer` | `!` after `addTilesetImage(...)`, or check for `null` |
| `TypeError: Cannot read properties of undefined (reading '7')` | `LEVEL[x][y]` instead of `LEVEL[y][x]`: a column number used as a row, past the last row | rows first |
| `TypeError: Cannot read properties of undefined (reading 'index')` from `GetTilesWithin`, only when the player reaches one part of the map | a row of the level array is shorter than the first row | every row the same length (the strings of challenge 5 can check this) |
| The player walks through walls and water | `setCollision` not called, wrong indexes given, or no `this.physics.add.collider(player, layer)` | both are needed; press D to see what collides |
| `TypeError: Cannot read properties of undefined (reading 'add')` in `new Player` | the project has no `physics` section in the config, so `scene.physics` does not exist | add `physics: { default: "arcade" }` to the config |
| The player gets stuck in doorways | body as big as a tile | `setSize` smaller than a tile |
| The player starts in the corner of a tile, or half inside a wall | `tileToWorldXY` is the top left corner | add `TILE_SIZE / 2` |
| `Property 'load' in type 'PainterScene' is not assignable to the same property in base type 'Scene'.` (plus four more errors, including `Property 'image' does not exist on type '() => void'`) | a method called `load()` in a scene - it replaces the scene's loader | rename it (`loadMap()`); `add`, `make`, `physics`, `cameras`, `time`, `input`, `sound` are all taken |
| Painting happens on the palette strip, or the eraser paints | not checking the result of `worldToTileXY` is on the map; or comparing `current === 0` for the eraser | check bounds; the eraser is `-1`, not `0` (0 is grass) |
| The camera shows black beyond the map edge | no `cameras.main.setBounds(...)` | set the camera's bounds to the map size |
| The player stops at an invisible line at x = 800 or y = 600 | physics world bounds left at the game size while the player has `setCollideWorldBounds(true)` | `this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)` |
| The HUD scrolls away | no `setScrollFactor(0)` | fix it to the screen |
| The HUD appears, tiny, inside the minimap | the minimap camera draws everything | `minimap.ignore([...])` |
| "My painted map is lost when I reload" | expected: S saves, L loads - the map is not loaded automatically | a nice mini-extension: load on start if there is a save |

## Suggested demos and live-coding moments

- **Build the map in five runs.** Start from an empty scene with only `preload()`. Add
  `make.tilemap` - run: nothing drawn (it is data). Add `addTilesetImage` - still nothing. Add
  `createLayer` - the map appears. Add the player - it walks through everything. Add `setCollision`
  - still walks through! Add the collider - now it stops. Each run makes one object's job visible
- **Change one number** in `level.ts` (a wall in the doorway) and rebuild: the level is data
- **The invisible map**: misspell the tileset key. Nothing is drawn, but the player still stops at
  the walls - a memorable way to show that collision is about indexes
- **Press D** and slide the player along a wall: show the white "interesting faces"
- **Painter to game**: paint a small level, press P, open the console, copy, paste into
  `ch10_array_map`'s `level.ts`, rebuild, walk round it
- **Two cameras**: in `ch10_scrolling_world`, comment out `minimap.ignore(...)` and then
  `this.cameras.main.ignore(this.marker)` in turn, and ask what will happen before running

## Activities

- **Cellular automaton on paper.** Give pairs a 10 x 8 grid with random shaded squares (about half).
  They apply one smoothing pass to a *second* grid (rock if 5 or more of the 9 squares are rock). Then
  ask: what goes wrong if you write the result into the same grid as you go? (Cells already changed
  affect their neighbours - the result depends on the order.) This is exactly why `smooth()` builds a
  new grid
- **Flood fill by hand.** On the smoothed grid, colour in everything reachable from one square. Which
  caves are cut off? Link to `fillUnreachable()`, and to the paint bucket in any drawing program
- **Design a tileset.** In groups, list the tiles a Sokoban, a Pac-Man maze or a farm game would need,
  and which of them collide

## Discussion questions

- A 60 x 40 level as one picture is about 10 MB of graphics memory; as tiles it is a 128 x 32 image
  and 2,400 numbers. What else do tiles make easy that a picture does not?
- Why does `setCollision` take indexes rather than a list of positions? When would you want to make
  a *single* tile solid? (`tile.setCollision(...)`; a secret door)
- `Cave` knows nothing about Phaser. What does that make possible? (Unit testing it; a different
  tileset; drawing it as a minimap; making levels on a server)
- Free movement or grid movement for: a Zelda-like, Sokoban, Pac-Man, a racing game, a roguelike?
  Why? (Pac-Man is interesting: it moves smoothly but is locked to the grid's lines)
- The minimap is a camera. What else could a second camera be used for? (Split-screen two-player; a
  rear-view mirror; a zoomed "picture in picture")

## Extension ideas

- load the painter's saved map automatically at start-up, if there is one
- add a second layer to the painter (a "decorations" layer drawn over the ground, with its own
  palette) and a key to switch layers
- a **fog of war** minimap: only tiles the player has been near are shown (a third layer of black
  tiles removed as the player walks)
- **seeded caves**: replace `Math.random()` with `Phaser.Math.RandomDataGenerator` and show the seed
- smooth camera: `startFollow(player, true, 0.1, 0.1)` and discuss lerp
- try `createLayer(0, tileset, 0, 0, true)` (a `TilemapGPULayer`) in the cave, and see what breaks
  when a tile changes (`generateLayerDataTexture()`)

## Assessment ideas

- Practical: "add lava (use `dungeon_tiles.png`, or tint a tile) that sends the player back to the
  start when stepped on" - tests `getTileAtWorldXY`, tile indexes, and a physics reset
- Practical: "add a door tile that disappears (`removeTileAt`) when the player has collected a key"
- Code reading: give `LEVEL[x][y]` code and the `Cannot read properties of undefined (reading '7')`
  error; ask for the bug and the fix
- Short answer: what are the jobs of the `Tilemap`, the `Tileset` and the `TilemapLayer`? Which one
  is a game object?
- Short answer: the player is at pixel (200, 150) in a map of 32-pixel tiles. Which column and row?
  What are the pixel coordinates of the centre of that tile?

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
