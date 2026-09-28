# Chapter 11 - Tilemaps with Tiled: teacher notes

## Overview

Chapter 10 built tilemaps from arrays in code. This chapter hands the level over to a tool: students
draw maps in **Tiled**, export them as JSON, and load them into Phaser. The Phaser side is small -
`tilemapTiledJSON`, `make.tilemap({ key })`, `addTilesetImage`, `createLayer`,
`setCollisionByProperty`, and three ways into an object layer - so most of the learning is about the
**workflow** (source file, export, build, refresh) and about the idea that a **level is data**: the
code says what things do, the map says where they are and how they are tuned.

The one conceptual trap is **names as strings shared between two programs**. Tiled and the code must
agree on the tileset name, every layer name, every object name and every property name, and a
mismatch is not a build error - it is a console warning and a `null`. Teach students to keep the
names as constants and to look in the browser console first.

Tiled is not on every lab machine. It is a free download (mapeditor.org) for Windows, macOS and Linux;
check it is installed, and that it opens the chapter's maps, before the session.
Without it, students can still do the Phaser half of the chapter with the maps provided, and
challenges 2 and 4 can be done by editing the `.tmj` by hand (instructive in itself).

## Prerequisites

- Chapter 10: tilemaps from arrays, tilesets, layers, `setCollision`, colliders with a layer, the
  camera following the player
- Chapters 7-9 for the hero animation and Arcade Physics used by the level (the chapter does not
  re-teach them)
- Chapter 2's `scene.start(key, data)` / `init(data)`, used again as `scene.restart(data)`

## Learning outcomes

Students can:

1. make an orthogonal, fixed-size map in Tiled with an embedded tileset, tile layers, an object layer
   and custom properties on tiles, objects and the map
2. save the source (`.tmx`) and export the JSON (`.tmj`) to the right place, and explain what a GID
   and a firstgid are
3. load a Tiled map in Phaser and create its layers, matching the names used in Tiled
4. make tiles solid with `setCollisionByProperty`, and read any tile's custom properties
5. read an object layer with `findObject`, `filterObjects`, `createFromObjects` and
   `getObjectLayer(...).objects`, converting Tiled's rectangle positions to centres where needed
6. read custom properties on objects and maps, and explain why the code should cope with missing or
   wrongly typed values
7. join maps together with door objects whose properties name the target map and entrance

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Play `ch11_tiled_level`. Ask: "where is this level in the code?" (It is not.) Open `level1.tmx` in Tiled on the projector |
| 0:05 - 0:25 | **Live demo in Tiled** (slides 3-8): New Map, New Tileset (embedded!), two tile layers, paint a few tiles, add `collides` to the ground tiles, an object layer with a `player` point and a couple of `coin` points, a map property. Save As in `tiled/`, Export As into `public/assets/maps/` |
| 0:25 - 0:35 | Slides 9-10: open the `.tmj` in Celbridge. GIDs and firstgid - ask "why does the first tile get GID 1, not 0?" |
| 0:35 - 0:50 | Slides 11-15: the four steps in `createMap()`, names that must match, `setCollisionByProperty`, press D. The three ways into an object layer; `getTiledProperty` |
| 0:50 - 1:00 | Slides 16-18: doors between maps, `scene.restart(data)`, loading a map on demand |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Install/start Tiled; open both projects' maps; build and run both projects |
| 0:15 - 0:45 | Guided: change `level1` in Tiled (move the goal, add a platform and two coins, change a slime's speed), export, build, refresh. Everyone must get round the edit-export-build loop at least twice |
| 0:45 - 1:15 | Challenges 1-3 |
| 1:15 - 2:00 | Challenges 4-6 |

## Key points to stress

- **Two files.** The game loads the `.tmj`, never the `.tmx`. "I changed the map and nothing
  happened" is nearly always a missing export (or a missing build)
- **Embed the tileset, fixed size, CSV.** Phaser cannot read external tilesets, infinite maps are
  awkward, and compressed tile data is not supported
- **Names are the contract** between Tiled and the code - constants in one file, spelled exactly
- **GIDs are not tile indexes.** In a Tiled map, `tile.index` is the GID (grass top is 1, not 0).
  Choosing tiles by property avoids the whole question
- **Tile properties vs object properties.** Phaser turns tile properties into an object
  (`tile.properties.hazard`) but leaves object and map properties as Tiled's list of
  `{ name, type, value }` - hence `getTiledProperty`
- **Rectangles are measured from the top-left**, game objects from their centre
- **Data can be wrong.** The designer is a person: default values and checks (`?? 0`, the fallback in
  `getTiledProperty`, `null` checks) are part of reading a map
- In Phaser 4, **Tiled's tile animations play by themselves** (Phaser 3 needed a plugin or hand-written
  code - students will find old tutorials that say otherwise)

## Common problems and errors

These messages were produced by breaking copies of the chapter projects.

| What students see | Cause | Fix |
|---|---|---|
| console: `Tilemap has no tileset "platform". Its tilesets are ['platform_tiles']`, then the project's own error `No tileset "platform" in the map, or no picture "platform_tiles" loaded` | first argument of `addTilesetImage` does not match the tileset's name in Tiled | copy the name from Tiled's Tilesets panel (the warning lists the real names) |
| console: `Texture key "platform_tiles" not found`, then the same `No tileset...` error | the tileset picture was never loaded with `this.load.image`, or with a different key | load it; the second argument of `addTilesetImage` is the **key** |
| console: `Invalid Tilemap Layer ID: ground` and `Valid tilelayer names: ['Background', 'Ground']`, then `TypeError: Cannot read properties of null (reading 'setCollisionByProperty')` | layer name spelled differently (here, a lower-case g) | match Tiled exactly - capitals matter |
| console: `No map data found for key level1`, every layer invalid; Network tab shows a 404 | wrong path in `tilemapTiledJSON`, or the map was never exported into `public/assets/maps/` | export to the right folder, then build |
| console: `Failed to process file: tilemapJSON "level1"` and `SyntaxError: Unexpected token '<', "<?xml vers"... is not valid JSON` | loading the `.tmx` instead of the `.tmj` | export JSON; load the `.tmj` |
| console: `External tilesets unsupported. Use Embed Tileset and re-export`, then `TypeError: Cannot read properties of undefined (reading '2')` | "Embed in map" was not ticked when the tileset was made | Embed Tileset button in the Tilesets panel, or the "Embed tilesets" export option, then export again |
| the player falls through everything; no error | no `collides` property, a differently spelled one, or a **string** property `"true"` rather than a **bool** | press D; check the property's name and type in Tiled |
| changes made in Tiled do not appear | not exported, or not built, or the browser shows the old page | File > Export (Ctrl+E), build, refresh |
| a coin or door is half a tile out | a rectangle's `x, y` used as its centre | add half the width and height |
| build error: `Type 'TilemapLayer \| TilemapGPULayer' is not assignable to type 'TilemapLayer'.` | storing `createLayer(...)` in a `TilemapLayer` field without the cast | `as Phaser.Tilemaps.TilemapLayer` (we did not ask for a GPU layer) |
| build error: `'spawn' is possibly 'null'.` | using `findObject`'s result without checking it | check for `null` (the map might not have the object) |
| build error: `Type 'number \| undefined' is not assignable to type 'number'.` | `spawn.x` used directly - Phaser's type makes `x` optional | `spawn.x ?? 0` |
| the door sends the player straight back | the entrance point is inside the other map's door rectangle | move the entrance a tile or two into the room |
| every coin tile collected at once (challenge 6) | the overlap with a tile layer reports empty places too | check `tile.index !== -1` |

## Suggested demos and live-coding moments

- **The contract, broken.** Rename the Ground layer in Tiled to "ground", export, refresh: the console
  warning lists the valid names. Rename it back. Then rename the tileset: a different warning
- **Data, not code.** Change a slime's `speed` property to 300 in Tiled, export, refresh. Then type
  `"fast"` into it (change its type to string): the fallback in `getTiledProperty` keeps the game
  running. Ask what would happen without the `typeof` check
- **GIDs.** Add `console.log(this.ground.getTileAt(0, 17).index)` at the end of `createMap()`: it
  prints 1, not 0, for a grass tile. Ask why
- **Draw order.** In Tiled, paint a bush on the Background layer over one of the crates, and drag
  Background above Ground in the Layers panel. Export: the bush is still hidden behind the crate,
  because Phaser draws layers in the order the code calls `createLayer`. Swap the two `createLayer`
  lines and it appears in front. Which wins - Tiled's order, or the code's?

## Discussion questions

- What belongs in the map, and what in the code? (Positions, sizes, speeds, messages, which tiles are
  solid - map. What a coin does when touched, how a slime patrols - code.) Where would you put a
  slime's *damage*? The level's music?
- Why is `collides` better than `setCollision([1, 2, 3, 4, 5, 6, 11])`? What happens to each when a
  designer adds a new solid tile to the tileset?
- `RoomScene` has no list of rooms. What are the advantages? What can go wrong that a list would have
  caught at start-up? (A mistyped `target` is only found when someone walks through that door.)
- The maps in this chapter were written by a script, not drawn in Tiled. When might a game generate its
  maps rather than have them drawn? (Roguelikes do exactly that.)

## Extension ideas

- a level select: several `levelN.tmx` files and a menu that starts `GameScene` with the map key
- a tile property `friction` (float) on ice tiles, read under the player's feet to change their drag
- use a Tiled **object template** (`.tx`) for coins - and find out what Phaser does with it (templates
  must be detached on export: Preferences > Export Options > Detach templates)
- tile objects (Insert Tile, T) instead of points for coins, so the designer sees coins in the editor;
  `createFromObjects` with `gid` handles them
- a minimap of the Tiled level with a second camera (Chapter 10)

## Assessment ideas

- Practical: "Add a second level to `ch11_tiled_level`, reached by touching the flag, with at least one
  new kind of object configured by a custom property." Mark the map (in Tiled) as well as the code
- Code reading: show `createMap()` and a screenshot of Tiled's Layers and Tilesets panels with one name
  different; ask what the console will say and which line fails
- Short answer: explain GID and firstgid, and why a map with two tilesets needs them
- Short answer: why does `getTiledProperty` take a fallback, and why does it check `typeof`?

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
The changed maps are written by [tools/make_solution_maps.ts](tools/make_solution_maps.ts).
