# Chapter 11 - Tilemaps with Tiled: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every code change is marked with a `// CHALLENGE n` comment.

Every challenge in this chapter also changes a **map**, which students do in Tiled. JSON cannot hold
comments, so the solutions' maps were written by a script,
[tools/make_solution_maps.ts](tools/make_solution_maps.ts), which builds the chapter's maps and
changes them - each change marked `CHALLENGE n` there instead. The maps open in Tiled like any other,
so you can show the class what was changed. Each solution's README says which maps changed.

When marking, ask for both files: the `.tmx` in `tiled/` **and** the exported `.tmj` in
`public/assets/maps/`. A student whose game does not show their change has almost always forgotten
to export.

---

## 1. Above the player

**Project:** [solutions/ch11_challenge_1_above_the_player](solutions/ch11_challenge_1_above_the_player/)
(from `ch11_tiled_doors`)

**Goal:** see that layers are drawn in order, that depth can override it, and that a layer with no
collision is walked through.

**In Tiled:** Layer > New > Tile Layer, named **Above**, dragged above Walls in the Layers panel.
The solution paints a stone beam across the hall between the pillars, and the tops of the four
pillars. Nothing on this layer has `collides` set, and the scene does not ask for it anyway.

`src/scenes/RoomScene.ts`
```ts
const ABOVE_DEPTH = 10; // CHALLENGE 1 - higher than the player (0), so drawn over them
```

```ts
this.createPlayer(map);
this.physics.add.collider(this.player, walls);

// CHALLENGE 1 - the "Above" layer, drawn over the player. No collision is set on it, so the
// player walks underneath. Not every room has one: getLayer gives null for a layer that is not
// in the map (createLayer would warn in the console, and give null too).
if (map.getLayer(ABOVE_LAYER) !== null) {
  map.createLayer(ABOVE_LAYER, tiles).setDepth(ABOVE_DEPTH);
}
```

Making the layer after the player would be enough on its own - game objects are drawn in the order
they are added - but `setDepth` says what is meant and survives someone moving the line. No cast is
needed here: `setDepth` exists on both kinds of layer `createLayer` can return.

Tested with the harness: the player walks up through row 8 (the beam) without stopping, and is hidden
while under it; in the cellar, which has no Above layer, there is no console warning.

**Look for:**
- the layer made **after** the player, or given a depth - students who make it with the other layers
  find it drawn *under* the player and are puzzled
- the cellar still working: a student who calls `createLayer("Above", ...)` unconditionally gets
  *Invalid Tilemap Layer ID: Above* in the console for the cellar (harmless here, but a good moment to
  talk about checking). Adding an empty Above layer to every map is an equally good answer
- not setting collision on the Above layer

---

## 2. Gems

**Project:** [solutions/ch11_challenge_2_gems](solutions/ch11_challenge_2_gems/)
(from `ch11_tiled_level`)

**Goal:** a custom property on an object, read through `createFromObjects`' data.

**In Tiled:** select the coins to change (several can be selected at once with Select Objects), and
add an **int** property **value** = 5. The solution changes the four coins above the brick wall.

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 2 - createFromObjects has put each coin's custom properties into its data. A coin
// with a "value" is shown as a gem; the others spin. (The whole group can no longer be told to
// play the spin animation - it would turn the gems back into coins.)
for (const sprite of coinSprites) {
  const coin = sprite as Phaser.GameObjects.Sprite; // createFromObjects made Sprites (its default)
  const value: number = coin.getData(VALUE) ?? 1;
  coin.setData(VALUE, value);
  if (value > 1) {
    coin.setTexture(GEM_KEY);
  } else {
    coin.play(COIN_SPIN);
  }
}
```

```ts
this.score = this.score + coin.getData(VALUE); // CHALLENGE 2
```

A coin with no property gets `undefined` from `getData`, so `?? 1` gives it the default - and
`setData` stores it, so collecting is one line. `gem.png` is copied into `public/assets/images/` and
loaded in `preload()`.

Tested with the harness: 12 coins have value 1 and 4 are gems with value 5; collecting a gem makes
the score 5, then a coin makes it 6.

**Look for:**
- the property read from the sprite's **data** (`getData`), not from `obj.properties` - both work,
  but `createFromObjects` has already done the work. Students who loop over `getObjectLayer` and use
  `getTiledProperty` have a perfectly good answer too
- `this.coins.playAnimation(COIN_SPIN)` removed or replaced - left in, it turns every gem back into a
  spinning coin, a nice bug to discuss
- the score reset in `init()` (Chapter 2's trap: R restarts the scene)
- a common wrong turn: a **string** property `"5"`. `getData` then returns the string, and `score +
  "5"` makes `"05"`. The type in Tiled matters

---

## 3. A third room

**Project:** [solutions/ch11_challenge_3_a_third_room](solutions/ch11_challenge_3_a_third_room/)
(from `ch11_tiled_doors`)

**Goal:** understand that the level is data. The right answer changes **no code**.

**In Tiled:**
1. make a new map, `tiled/treasure.tmx` (the solution's is 17 x 9 tiles). The quickest way is to
   open the cellar, **File > Save As** `treasure.tmx`, and change the size (Map > Resize Map) and the
   tiles: the embedded tileset, its `collides` properties and the layers all come with it. Starting
   from File > New works too, but then the tileset must be made again - embedded, named
   **dungeon_tiles**, with `collides` ticked on the same tiles
2. layers **Floor**, **Walls** and **Objects**, spelled as in the other rooms; a map property
   **name** = `The Treasure Room`
3. in the new room: a point `from_hall`, and a `door` rectangle with `target` = `hall`, `entrance` =
   `from_treasure`
4. in the hall: repaint the closed door (tile 5) as an open door (tile 6), add a `door` rectangle over
   it with `target` = `treasure` and `entrance` = `from_hall`, and a point `from_treasure` two tiles
   below it
5. export both maps to `public/assets/maps/` - the new one's file name must be the `target`:
   `treasure.tmj`

`RoomScene` loads `assets/maps/<target>.tmj` on demand, finds the entrance by name and centres the
camera on whatever size of room it gets - so nothing in `src/` changes.

Tested with the harness: walking up the carpet goes from the hall to the treasure room, arriving at
`from_hall`; walking down through its door returns to the hall at `from_treasure`.

**Look for:**
- no code changes. If a student changed code, ask what for - often they added the map to a list in
  `preload()`, which works but misses the point
- entrance points placed a tile or two **away** from the doors (otherwise the player arrives in the
  doorway and is sent straight back - students meet this and have to reason about it)
- the three names that must agree across two files: the `target` and the new map's file name; the
  `entrance` and the point's name; the layer and tileset names
- common failures: the file exported as `Treasure.tmj` with `target` = `treasure` (a 404 - file names
  on the web are case-sensitive), a non-embedded tileset (*External tilesets unsupported. Use Embed
  Tileset and re-export*), or forgetting to export the hall after changing it

---

## 4. Signposts

**Project:** [solutions/ch11_challenge_4_signposts](solutions/ch11_challenge_4_signposts/)
(from `ch11_tiled_level`)

**Goal:** trigger areas from rectangle objects, a string property, and asking "am I in it?" every
frame.

**In Tiled:** rectangles named **sign**, each with a **string** property **message**. The solution
has three (by the sign at the start, before the lava, and before the flag) and paints two more sign
tiles in the Background layer. The first message has two lines; in the JSON a line break is written
as `\n`, and Phaser's `Text` shows it as a new line.

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 4 - a signpost: a rectangle from Tiled, and the message to show while the player is in it
interface Sign {
  zone: Phaser.GameObjects.Zone;
  message: string;
}
```

```ts
for (const obj of signObjects) {
  const width = obj.width ?? 32;
  const height = obj.height ?? 32;
  // Tiled measures a rectangle from its top-left corner; a Zone is placed by its centre
  const zone = this.add.zone((obj.x ?? 0) + width / 2, (obj.y ?? 0) + height / 2, width, height);
  this.physics.add.existing(zone, true);
  this.signs.push({ zone: zone, message: getTiledProperty(obj.properties, "message", "") });
}
```

```ts
// CHALLENGE 4 - show the message of the sign the player is standing by, or hide the box.
// physics.overlap with no callback just answers the question: are these two touching right now?
private updateSignMessage(): void {
  const sign = this.signs.find((s) => this.physics.overlap(this.player, s.zone));
  if (sign === undefined) {
    this.messageText.setVisible(false);
  } else {
    this.messageText.setText(sign.message).setVisible(true);
  }
}
```

The message box is one `Text` with a `backgroundColor` and `padding`, fixed to the camera with
`setScrollFactor(0)`, and hidden until needed.

Tested with the harness: at the start the box shows the controls; walking right out of the first
sign's rectangle hides it; standing by the lava sign shows "Lava ahead - jump it!".

**Look for:**
- the top-left to centre conversion (the classic bug: the message appears half a sign to the left)
- hiding the box again. The usual first attempt uses `this.physics.add.overlap(player, zone,
  callback)`, which says when the player is **in** a sign but never when they have **left** - so the
  message never goes away. The hint points at `physics.overlap` in `update()`; a "was I overlapping
  last frame?" flag is another good answer
- the message stored with its zone (an interface, or `zone.setData("message", ...)`) rather than a
  second array kept in step

---

## 5. Moving platforms

**Project:** [solutions/ch11_challenge_5_moving_platforms](solutions/ch11_challenge_5_moving_platforms/)
(from `ch11_tiled_level`)

**Goal:** a polyline's points, a chain of tweens, an immovable body - and discovering that Arcade
Physics does not carry a rider sideways on a tweened platform.

**In Tiled:** erase the floating platform over the wide pool, then draw a polyline with Insert
Polygon (click the points, then press Enter - or right-click - to finish without closing it), and
name it **platform**. The solution's goes across the pool at ground level and then up, so the player
can ride it to the higher platform.

`src/scenes/GameScene.ts`
```ts
// a polyline's points are measured from the object's x and y: turn them into world positions
const points = obj.polyline.map((p) => new Phaser.Math.Vector2((obj.x ?? 0) + p.x, (obj.y ?? 0) + p.y));

const platform = this.add.image(points[0].x, points[0].y, PLATFORM_KEY).setScale(PLATFORM_SCALE);
this.physics.add.existing(platform);
const body = platform.body as Phaser.Physics.Arcade.Body; // dynamic: made by physics.add.existing
body.setAllowGravity(false); // it floats
body.setImmovable(true); // the player cannot push it
```

```ts
// there and back: each point after the first, then back through each point before the last
const route = [...points.slice(1), ...points.slice(0, -1).reverse()];
let from = points[0];
const steps: Phaser.Types.Tweens.TweenBuilderConfig[] = [];
for (const to of route) {
  const distance = Phaser.Math.Distance.BetweenPoints(from, to);
  steps.push({
    targets: platform,
    x: to.x,
    y: to.y,
    duration: (distance / PLATFORM_SPEED) * 1000,
    completeDelay: PLATFORM_WAIT,
  });
  from = to;
}
this.tweens.chain({ tweens: steps, loop: -1 });
```

Each step's duration comes from its length, so the platform moves at a steady speed. `completeDelay`
makes it wait at each point. (`hold` looks tempting, but it only applies to tweens that `yoyo`.)

Arcade's collider lifts the player with the platform, but a tween changes the platform's `x`
directly, so its body has no velocity and the player is not carried sideways - the platform slides
out from under them. The solution carries the player itself, every frame:

```ts
private carryPlayer(): void {
  const feet = this.player.body as Phaser.Physics.Arcade.Body;
  for (const platform of this.platforms) {
    const top = platform.image.body as Phaser.Physics.Arcade.Body;
    const standingOn = Math.abs(feet.bottom - top.top) < 2 && feet.right > top.left && feet.left < top.right;
    if (standingOn) {
      this.player.x = this.player.x + (platform.image.x - platform.lastX);
    }
    platform.lastX = platform.image.x;
  }
}
```

Tested with the harness: over two complete trips the player's position relative to the platform
stayed exactly the same (7 pixels left of its centre, 32 above), across, up, down and back.

**Look for:**
- the points turned into world positions (forgetting to add `obj.x`/`obj.y` puts the platform near
  the top-left corner of the map)
- a body that ignores gravity and cannot be pushed - otherwise it falls into the pool, or the player
  pushes it along
- some way of carrying the player. A good, alternative answer is `body.setDirectControl(true)`, which
  tells Arcade the body is moved by setting its position and makes it work out a velocity, so the
  collider carries the rider. In testing it carried the player less reliably than the hand-written
  version (the rider drifted across the platform over a few trips), which is worth discussing.
  Moving the platform by velocity instead of tweens (`this.physics.moveTo`) also works, and Arcade
  then carries the player by itself; it needs more code to know when each point is reached.
  Chapter 15 comes back to moving platforms

---

## 6. Spinning coins, as tiles

**Project:** [solutions/ch11_challenge_6_spinning_coins_as_tiles](solutions/ch11_challenge_6_spinning_coins_as_tiles/)
(from `ch11_tiled_level`)

**Goal:** a second tileset and firstgid, Tiled's tile animations, and collecting tiles with an
overlap and `removeTileAt`.

**In Tiled:**
1. File > New > New Tileset: `coin_spin.png` (in `public/assets/spritesheets/`), 32 x 32, **embedded**,
   named **coins**. Tiled gives it firstgid 17, because platform_tiles uses 1-16
2. Edit Tileset, select tile 0, and open the **Tile Animation Editor** (a button on the tileset
   editor's tool bar). Drag the six tiles into the frame list, each 100 ms
3. a new tile layer, **Pickups**, above Ground; paint coin tile 0 where the coins should be. The
   editor shows them spinning

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 6 - the second tileset, "coins", joined to the coin_spin picture. Its tiles have GIDs
// from 17 (its firstgid), so they cannot be mixed up with platform_tiles' 1-16. Phaser 4 plays
// the tile animation made in Tiled's Tile Animation Editor by itself.
const coinTiles = this.map.addTilesetImage(COINS_TILESET_NAME, COIN_KEY);
if (coinTiles === null) {
  throw new Error(`No tileset "${COINS_TILESET_NAME}" in the map, or no picture "${COIN_KEY}" loaded`);
}
this.pickups = this.map.createLayer(PICKUPS_LAYER, coinTiles) as Phaser.Tilemaps.TilemapLayer;
```

```ts
// CHALLENGE 6 - an overlap with a tile layer reports EVERY tile under the player's body,
// including the empty places (index -1), so only a real coin tile counts
this.physics.add.overlap(this.player, this.pickups, (_player, object) => {
  const tile = object as Phaser.Tilemaps.Tile; // from a tile layer, the second object is a Tile
  if (tile.index !== -1) {
    this.collectCoinTile(tile);
  }
});
```

```ts
// CHALLENGE 6 - take the coin tile out of the layer, and count it
private collectCoinTile(tile: Phaser.Tilemaps.Tile): void {
  this.pickups.removeTileAt(tile.x, tile.y);
```

The `coin_spin` sprite sheet, already loaded for the object coins, is used as the tileset's picture
as well - one texture can be both. Coin tiles are counted with
`this.pickups.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index !== -1)`.

Tested with the harness: the map has tilesets `platform_tiles` (firstgid 1, 16 tiles) and `coins`
(firstgid 17, 6 tiles); `getAnimatedTileId(17, ms)` steps 17, 18, 19, 20 as time passes, and two
screenshots 170 ms apart show the coins at different frames; running right along row 16 collects
three coin tiles, and the total counts 16 object coins + 10 tiles.

**Look for:**
- `addTilesetImage` called twice, once per tileset, and the Pickups layer given the right one (or an
  array of both, if a student paints both tilesets on one layer)
- `tile.index !== -1` in the overlap - without it the first empty place counts as a coin, and the
  count races up as soon as the game starts
- students who follow Phaser 3 tutorials and write their own tile animation code: Phaser 3 needed a plugin or hand-written code for Tiled's tile animations; **Phaser
  4 plays them itself** (both kinds of tilemap layer). A student who animates by hand with a timer
  and `putTileAt` has done more work than needed, but understood the idea - credit it
- the firstgid question from the hint answered: 17
