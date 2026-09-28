# Chapter 10 - Tilemaps: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. A new island

**Project:** [solutions/ch10_challenge_1_new_island](solutions/ch10_challenge_1_new_island/)
(from `ch10_array_map`)

**Goal:** read and write a map as a 2D array; understand that the level is data.

Only `src/level.ts` changes. The house has moved to the top left, inside a moat, with a sand
path from its door across the water; the river has a second bridge; the bottom half is a maze:

`src/level.ts`
```ts
export const LEVEL: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 2, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 2, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 2, 2, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 2],
  ...
  [2, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 2],
  ...
];

// CHALLENGE 1: a new start - inside the house, which has moved
export const START_COLUMN = 6;
export const START_ROW = 4;
```

**Look for:** every row still 25 numbers long. A short row is not caught when the map is made - the
map takes its width from the first row - but the game crashes with
`TypeError: Cannot read properties of undefined (reading 'index')` (inside `GetTilesWithin`) the
moment the player walks near the missing tiles, which can be long after the level starts. Also: the
start on a tile the player can stand on; everything reachable. Tested with the harness: from the start, walking down leaves the house by the door and
crosses the moat on the sand path; the new bridge crosses the river. Students who paint the map in
`ch10_tile_painter` and paste it in have done exactly what the chapter suggests - accept it.

---

## 2. Sand slows you down

**Project:** [solutions/ch10_challenge_2_sand_slows](solutions/ch10_challenge_2_sand_slows/)
(from `ch10_array_map`)

**Goal:** read the tile under the player every frame, and keep the `Player` class free of map
knowledge.

`src/objects/Player.ts`
```ts
// CHALLENGE 2: how fast to walk, as a fraction of SPEED. The player does not know about tiles -
// the scene looks at the map and tells it
private speedFactor = 1;
...
// CHALLENGE 2: 1 is full speed, 0.5 is half speed
public setSpeedFactor(factor: number): void {
  this.speedFactor = factor;
}
...
// CHALLENGE 2: times the speed factor
const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(SPEED * this.speedFactor);
```

`src/scenes/GameScene.ts`
```ts
const tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y);

// CHALLENGE 2: slow on sand, full speed anywhere else
const onSand = tile !== null && tile.index === SAND;
this.player.setSpeedFactor(onSand ? SAND_SPEED : 1);
```

The scene already found the tile for the info strip, so the check is two lines. Tested with the
harness: walking down onto the sand below the house, the player's velocity drops from 160 to 80
pixels per second at the edge of the sand.

**Look for:**
- the player told its speed, not made to look at the map. A student who passes the layer into
  `Player` and checks tiles there has a working answer - ask what happens when a second map, or a
  different game, wants to reuse `Player`
- `tile !== null` checked first (off the map, or an empty cell, gives `null`)
- speed reset to full off the sand - a common bug is a player who slows down and never speeds up
- where the check happens: the tile under the player's *centre*. Some students use the feet (a few
  pixels lower) - both are fine; discuss which looks right

---

## 3. Eyedropper

**Project:** [solutions/ch10_challenge_3_eyedropper](solutions/ch10_challenge_3_eyedropper/)
(from `ch10_tile_painter`)

**Goal:** tell the mouse buttons apart; read a tile back from the map.

`src/scenes/PainterScene.ts`
```ts
// CHALLENGE 3: stop the browser's own menu appearing when the right button is clicked
this.input.mouse!.disableContextMenu();

// paint when the button goes down, and while it is held and the mouse moves
// CHALLENGE 3: ...but the RIGHT button picks up the tile instead
this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonDown()) {
    this.pick(pointer);
  } else {
    this.paint(pointer);
  }
});
this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
  this.hover(pointer);
  // CHALLENGE 3: only the left button paints while dragging (isDown is true for any button)
  if (pointer.leftButtonDown()) {
    this.paint(pointer);
  }
});
```

```ts
private pick(pointer: Phaser.Input.Pointer): void {
  const cell = this.tileUnder(pointer);
  if (cell === null) {
    return;
  }
  const tile = this.layer.getTileAt(cell.x, cell.y);
  this.choose(tile === null ? EMPTY : tile.index);
}
```

Calling the existing `choose()` means the palette's yellow frame and the status text update with no
extra code. Tested with the harness (right-button mouse events sent to the canvas): right-clicking
a wall chose wall, an erased cell chose the eraser, grass chose grass; nothing was painted; the
`contextmenu` event was cancelled.

**Look for:**
- `disableContextMenu()` - without it the browser's menu pops up over the game
- the drag handler changed too. `pointer.isDown` is true for *any* button, so the unchanged
  version paints while you right-drag - a subtle bug worth asking about
- an empty cell handled (`getTileAt` gives `null`, which must become `-1`)

---

## 4. Treasure tiles

**Project:** [solutions/ch10_challenge_4_treasure_tiles](solutions/ch10_challenge_4_treasure_tiles/)
(from `ch10_scrolling_world`)

**Goal:** put special tiles into a generated map, and react when the player touches one.

The chests are written into the wall layer's data before it goes into the layer, on open cells
away from the start (the same choice of places the gems used):

`src/scenes/WorldScene.ts`
```ts
const wallData = this.wallTiles(cave);
this.placeChests(cave, wallData);
walls.putTilesAt(wallData, 0, 0);
walls.setCollisionByExclusion([EMPTY]);       // every tile that is not empty collides
...
private placeChests(cave: Cave, wallData: number[][]): void {
  ...
  for (const cell of places.slice(0, CHEST_COUNT)) {
    wallData[cell.row][cell.column] = CHEST;
  }
}
```

Because the chests are on the wall layer, they are solid - the player bumps into them. A collider
can take a callback, which for a sprite and a layer is given the sprite and the **tile**:

```ts
this.physics.add.collider(this.player, walls, (_player, tile) => {
  // Phaser's callback type allows bodies and game objects too; with a layer it is always a Tile
  const bumped = tile as Phaser.Tilemaps.Tile;
  if (bumped.index === CHEST) {
    walls.removeTileAt(bumped.x, bumped.y);
    this.sound.play(COIN_KEY);
    this.chestsFound++;
    this.updateHud();
  }
});
```

Tested with the harness: placing the player two tiles above a chest (with open floor between) and
walking down collects it - the tile disappears and the HUD counts it; ten chests are placed in every
new cave.

**Other good answers:**
- `walls.setTileIndexCallback(CHEST, (sprite, tile) => { ... }, this)` - the callback fires when the
  player touches any chest. Note that if the callback returns `true`, Phaser skips the collision for
  that tile; returning nothing (as most students will) means the player is still bumped back
- a third layer holding only the chests (`-1` everywhere else) and
  `this.physics.add.overlap(player, chestLayer, ...)` - the player walks onto a chest instead of
  bumping into it. Check the tile's index in the callback: an overlap with a layer reports every
  tile under the body, empty ones included

**Look for:** chests placed only on open floor (not in rock, where they could never be reached);
the chest removed from the map, not just counted (otherwise the count runs up while the player
leans on it); the count reset in `init()` for a new cave.

---

## 5. A map from strings

**Project:** [solutions/ch10_challenge_5_map_from_strings](solutions/ch10_challenge_5_map_from_strings/)
(from `ch10_array_map`)

**Goal:** turn text into data; lookup tables; helpful errors.

`src/level.ts`
```ts
const MAP: string[] = [
  "#########################",
  "#.......................#",
  "#...sss.........~~~.....#",
  "#..ss~ss......~~~~~~....#",
  ...
  "#....#.@.#..............#",
  ...
];

const TILE_FOR: Record<string, number> = {
  ".": GRASS,
  "~": WATER,
  "#": WALL,
  "s": SAND,
  "@": GRASS,
};
```

```ts
export function parseLevel(rows: string[]): Level {
  const width = rows[0].length;
  const tiles: number[][] = [];
  let startColumn = -1;
  let startRow = -1;

  rows.forEach((text, row) => {
    if (text.length !== width) {
      throw new Error(`Map row ${row} is ${text.length} characters long, not ${width}`);
    }

    const line: number[] = [];
    text.split("").forEach((character, column) => {
      if (!(character in TILE_FOR)) {
        throw new Error(`Unknown map character "${character}" at column ${column}, row ${row}`);
      }
      if (character === START) {
        startColumn = column;
        startRow = row;
      }
      line.push(TILE_FOR[character]);
    });
    tiles.push(line);
  });

  if (startColumn < 0) {
    throw new Error(`The map has no ${START} to show where the player starts`);
  }
  return { tiles, startColumn, startRow };
}

// CHALLENGE 5: parsed once, when the game loads
export const LEVEL: Level = parseLevel(MAP);
```

The scene uses `LEVEL.tiles`, `LEVEL.startColumn` and `LEVEL.startRow`. Tested with the harness:
the tile data in the running game is identical, tile for tile, to `ch10_array_map`'s, and the player
starts in the same place. With an `x` put into the map (in a scratch copy), the game stops with
`Error: Unknown map character "x" at column 16, row 8` in the console.

- `Record<string, number>` is an object used as a lookup table - the TypeScript way to write a
  small `Map<Character, Integer>` as a literal
- `character in TILE_FOR` asks whether the object has that key. `TILE_FOR[character]` alone would
  give `undefined` for an unknown character, and the tilemap would quietly get a hole
- `forEach((value, index) => ...)` gives the index as well as the value - just what a map needs

**Look for:** the character table in **one** place; a sensible start (the `@` also needs a tile
under it - grass here); errors that say *where* the problem is. Accept a plain nested `for` loop
with `text[column]` or `text.charAt(column)` instead of `split("")`. Strong students will notice the
strings do not show the house's door very clearly in a proportional font - an argument for a
monospace editor, and for Tiled next week.

---

## 6. Grid movement

**Project:** [solutions/ch10_challenge_6_grid_movement](solutions/ch10_challenge_6_grid_movement/)
(from `ch10_array_map`)

**Goal:** a different model of movement - positions in tiles, checks before moves, tweens between.

`Player` becomes a plain `Sprite` (no physics - the config's `physics` section is removed too) that
knows the layer and its own column and row:

`src/objects/Player.ts`
```ts
protected override preUpdate(time: number, delta: number): void {
  super.preUpdate(time, delta);    // without this, the animations would not play

  // CHALLENGE 6: no new move until the last one has finished - so no turning halfway
  if (this.moving) {
    return;
  }
  ...
  // CHALLENGE 6: look at the next tile first. Off the map (null), or a tile that collides (wall or
  // water - the scene's setCollision still says which), and the player turns but stays put
  const next = this.layer.getTileAt(this.column + dx, this.row + dy);
  if (next === null || next.collides) {
    this.stand();
    return;
  }

  // CHALLENGE 6: glide to the centre of the next tile; ignore the keys until it is there
  this.column = this.column + dx;
  this.row = this.row + dy;
  this.moving = true;
  this.anims.play(`walk-${this.facing}`, true);

  const corner = this.layer.tileToWorldXY(this.column, this.row);
  this.scene.tweens.add({
    targets: this,
    x: corner.x + TILE_SIZE / 2,
    y: corner.y + TILE_SIZE / 2,
    duration: STEP_TIME,
    onComplete: () => {
      this.moving = false;     // the next preUpdate moves again if a key is still held
    },
  });
}
```

`src/scenes/GameScene.ts`
```ts
this.player = new Player(this, this.layer, START_COLUMN, START_ROW);
```

Holding a key keeps moving because, once a tween completes, the next `preUpdate` sees the key still
down and starts another. Only one direction is read at a time (`else if` all the way down), so there
are no diagonals. `tile.collides` - set by the scene's unchanged `setCollision([WATER, WALL])` - is
the "can I go there?" test, so the list of solid tiles is still in one place.

Tested with the harness: a short tap of DOWN moves exactly one tile (y 240 to 272); holding DOWN from
the start walks out through the door and stops at row 10, above the river, at the exact centre of
the tile (y 336); walking into the house wall does not move the player; holding RIGHT and DOWN
together moves right only.

**Look for:**
- the position held in tiles (`column`, `row`), with pixels worked out from them - not the other
  way round. Students who convert `x`/`y` back to tiles each move get rounding errors
- the next tile checked **before** the move starts
- input ignored while moving, so the player cannot stop or turn between tiles
- `null` handled (off the edge of the map) - not needed with this map's wall border, but the right
  habit
- physics removed. Students who keep the Arcade body and tween a physics sprite get a body that
  lags behind or fights the tween; it is worth seeing once why grid movement and physics do not mix
