# Chapter 3 - Preloading: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment (JSON files cannot
have comments, so changes to them are described here instead).

To see a loading screen solution working, slow the network down (Chrome or Edge: F12, **Network**,
**Disable cache**, **Fast 4G**) - or it is over before you can look at it.

---

## 1. Restyle the bar

**Project:** [solutions/ch03_challenge_1_restyle_the_bar](solutions/ch03_challenge_1_restyle_the_bar/)
(from `ch03_loading_screen`)

**Goal:** find where each part of the loading screen is decided, and learn a little more of the
`Graphics` API.

`src/scenes/PreloadScene.ts`
```ts
// CHALLENGE 1: a longer, taller bar, in a rounded box with an outline
const BAR_WIDTH = 500;
const BAR_HEIGHT = 36;
const BAR_Y = 350;
const BOX_COLOUR = 0x0b0e14;
const BOX_OUTLINE = 0xf1faee;
const BOX_PADDING = 8;          // the gap between the box and the bar inside it
const BOX_RADIUS = 12;
```

```ts
box.fillStyle(BOX_COLOUR);
box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, BOX_RADIUS);
box.lineStyle(3, BOX_OUTLINE);
box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, BOX_RADIUS);
```

```ts
bar.fillStyle(this.barColour(value));    // CHALLENGE 1
```

```ts
// CHALLENGE 1: red, then orange, then green, as the bar fills
private barColour(value: number): number {
  if (value < 1 / 3) {
    return EARLY_COLOUR;
  }
  if (value < 2 / 3) {
    return MIDDLE_COLOUR;
  }
  return LATE_COLOUR;
}
```

plus new wording and colours for the two lines of text. Because the whole bar is cleared and redrawn
on every `"progress"` event, choosing its colour from `value` each time is all it takes - the bar
turns wholly orange at a third, and wholly green at two thirds.

**Look for:** the sizes kept as named constants, and the box worked out *from* them (so changing
`BAR_WIDTH` still centres everything); `lineStyle` before `strokeRoundedRect` (the stroke uses
whatever line style was set last - forget it and there is no outline); the colour choice in a small
method rather than inline in the listener. A student who makes the colour **blend** from red to
green (`Phaser.Display.Color.Interpolate.ColorWithColor`) has gone further than asked - welcome it.

---

## 2. Percentage

**Project:** [solutions/ch03_challenge_2_percentage](solutions/ch03_challenge_2_percentage/)
(from `ch03_loading_screen`)

**Goal:** turn the `"progress"` value into something a person reads; think about rounding.

`src/scenes/PreloadScene.ts`
```ts
// CHALLENGE 2: the percentage, in the middle of the bar. Made AFTER the bar, so it is drawn
// on top of it
const percentText = this.add.text(centreX, BAR_Y + BAR_HEIGHT / 2, "0%", {
  fontFamily: "Arial",
  fontSize: "20px",
  color: "#ffffff",
  stroke: "#1b1f2a",
  strokeThickness: 4,
}).setOrigin(0.5);
```

```ts
// CHALLENGE 2: value is 0 to 1; floor, so it only says 100% when it really is finished
percentText.setText(`${Math.floor(value * 100)}%`);
```

- **order of creation is order of drawing**: text made before the bar `Graphics` would be hidden
  behind the bar as it grows. A good moment to say so (Chapter 4 covers draw order and depth)
- `Math.round(0.996 * 100)` is 100 - the screen would say 100% with a file still to come.
  `Math.floor` never over-promises
- the stroke makes white text readable over both the yellow bar and the dark box

**Look for:** the update inside the existing `"progress"` listener (a second listener is fine too);
a whole number (students who write `value * 100` get `36.470588...%`); the text drawn on top of
the bar. Showing "12 of 170 files" as well, with `this.load.totalComplete` and
`this.load.totalToLoad`, is a good extension.

---

## 3. Hearts in the level

**Project:** [solutions/ch03_challenge_3_hearts_in_the_level](solutions/ch03_challenge_3_hearts_in_the_level/)
(from `ch03_asset_types`)

**Goal:** change a data file *and* its TypeScript description together.

`public/assets/data/level.json` - a new list, after `"gems"` (note the comma that now has to follow
the `]` of `"gems"`):
```json
"hearts": [
  { "x": 30, "y": 40 },
  { "x": 160, "y": 130 },
  { "x": 225, "y": 45 }
]
```

`src/LevelData.ts`
```ts
hearts: Point[];     // CHALLENGE 3: the new list in level.json
```

`src/scenes/AssetTypesScene.ts`
```ts
// CHALLENGE 3: say how many hearts too
this.add.text(x + 10, y + 34, `"${level.name}" - ${level.gems.length} gems, ${level.hearts.length} hearts`, SMALL_STYLE);
```

```ts
// CHALLENGE 3: the hearts - heart.png is already loaded, by the asset pack
level.hearts.forEach((heart) => {
  this.add.image(originX + heart.x, originY + heart.y, HEART_KEY);
});
```

No new file needs loading: `heart.png` comes in with the asset pack, and textures are shared, so
the JSON panel can use it.

**Look for:** the interface updated. A student who skips it gets
`Property 'hearts' does not exist on type 'LevelData'.` - which is the point of the interface.
The opposite mistake - interface updated, JSON not (or the JSON broken by a missing comma) - builds
cleanly and then fails in the browser: with no `"hearts"` in the file, `level.hearts.length` throws
`Cannot read properties of undefined`. Ask students which of the two mistakes they would rather
make. Sharp students make `hearts` optional (`hearts?: Point[]`) so older level files still work,
and then have to check for `undefined` - a fine answer.

---

## 4. Keep it moving

**Project:** [solutions/ch03_challenge_4_keep_it_moving](solutions/ch03_challenge_4_keep_it_moving/)
(from `ch03_loading_screen`)

**Goal:** understand what runs while a scene is loading - and which scene must load what.

`src/assets.ts`
```ts
// CHALLENGE 4: the spinner is on the loading screen, so the boot scene must load it too
export const SPINNER_KEY = "spinner";
export const SPINNER_FILE = "assets/images/star.png";
```

`src/scenes/BootScene.ts`
```ts
this.load.image(SPINNER_KEY, SPINNER_FILE);    // CHALLENGE 4
```

`src/scenes/PreloadScene.ts`
```ts
const spinner = this.add.image(barX + BAR_WIDTH + 45, BAR_Y + BAR_HEIGHT / 2, SPINNER_KEY);
this.tweens.add({
  targets: spinner,
  angle: 360,
  duration: SPIN_TIME,
  repeat: -1,
});
```

While a scene is loading, Phaser still runs its **systems** every frame - its clock, its tweens, its
loader - but it does not call the scene's own `update()` until `create()` has run. So code in
`update()` that turns the star does nothing until the loading is over; a tween turns it
throughout. (Tested with the harness on a throttled network: the star's `angle` changes between
two readings taken while `load.progress` is still below 1.) `this.time.addEvent({ delay, loop: true,
callback })` that changes the angle a step at a time also works, for the same reason.

**Look for:** the picture loaded in `BootScene`. Students who load it in `PreloadScene` see the
missing-texture square spinning - worth letting them find that out and explain it; it is the whole
reason for the boot scene. Students who try `update()` see a star that sits still until the bar is
full.

---

## 5. When files fail

**Project:** [solutions/ch03_challenge_5_when_files_fail](solutions/ch03_challenge_5_when_files_fail/)
(from `ch03_loading_screen`)

**Goal:** listen for failures, pass them to a new scene, and reset state for a scene that runs
again.

`src/scenes/PreloadScene.ts`
```ts
private failed: string[] = [];     // CHALLENGE 5: every file that could not be loaded
```

```ts
// CHALLENGE 5: the scene object is reused if the player tries again - start with an empty list
init(): void {
  this.failed = [];
}
```

```ts
// CHALLENGE 5: "loaderror": one file could not be loaded - remember which, and from where
this.load.on("loaderror", (file: Phaser.Loader.File) => {
  this.failed.push(`${file.key}  -  ${file.src}`);
});
```

```ts
// CHALLENGE 5: if anything failed, the error screen - it can still go on to the menu
if (this.failed.length > 0) {
  const errorData: ErrorData = { failed: this.failed, menu: data };
  this.scene.start(ERROR_SCENE, errorData);
} else {
  this.scene.start(MENU_SCENE, data);
}
```

`src/scenes/ErrorScene.ts` (new)
```ts
export interface ErrorData {
  failed: string[];     // "key  -  url" for each file that failed
  menu: MenuData;       // what to pass on to the menu, if the player carries on
}
```

```ts
this.input.keyboard!.once("keydown-R", () => {
  this.scene.start(BOOT_SCENE);
});
this.input.keyboard!.once("keydown-SPACE", () => {
  this.scene.start(MENU_SCENE, this.error.menu);
});
```

To test it, the solution asks for `strr.png` (a misspelling) when `TEST_A_MISSING_FILE` is `true`.
Tested with the harness: the error screen lists `broken  -  assets/images/strr.png`; R runs the
loading screen again and comes back to the error screen with **0** files loaded (everything that
worked is already in its cache, so only the broken file is tried again); SPACE reaches the menu.

**Look for:**
- `init()` resetting the list - without it, each retry adds the same failure again, and the list
  grows (the Chapter 2 trap, in a new place)
- the decision made in `create()` (or on `"complete"`), after all files have been tried - not in
  the `"loaderror"` listener, which would leave while other files were still loading
- `file.src` shown, not just the key: the address is what tells you *why* it failed
- the answer to the hint's question: a retry only fetches what failed, because the rest is cached

---

## 6. Rooms from a pack

**Project:** [solutions/ch03_challenge_6_rooms_from_a_pack](solutions/ch03_challenge_6_rooms_from_a_pack/)
(from `ch03_load_on_demand`)

**Goal:** separate *which files* (data, in a pack) from *what to do with them* (code); discover
that a pack is itself a cached file.

`public/assets/rooms_pack.json` (new) - one section per room:
```json
"space": {
  "path": "assets/",
  "files": [
    { "type": "image", "key": "space", "url": "images/space.png" },
    { "type": "image", "key": "player_ship", "url": "images/player_ship.png" },
    { "type": "image", "key": "enemy_ship", "url": "images/enemy_ship.png" },
    { "type": "image", "key": "rock", "url": "images/rock.png" },
    { "type": "audio", "key": "shoot", "url": "audio/shoot.wav" }
  ]
},
```

`src/rooms.ts`
```ts
export interface Room {
  name: string;
  section: string;          // CHALLENGE 6: this room's section in rooms_pack.json
  background: string;       // CHALLENGE 6: keys, not files - the pack says which file each key is
  props: RoomProp[];
  sound: string;            // played as you walk in
}
```

```ts
// CHALLENGE 6: the key the pack file itself is kept under, once loaded for this room
export function packKey(room: Room): string {
  return `pack_${room.section}`;
}
```

`src/scenes/MenuScene.ts`
```ts
private queueRoom(room: Room): void {
  this.load.pack(packKey(room), ROOMS_PACK_FILE, room.section);
}
```

```ts
// CHALLENGE 6: the pack file itself is kept in the JSON cache, under its key. Left there,
// the loader would skip it next time - and so load none of the room's files
this.cache.json.remove(packKey(room));
```

`isLoaded()` now checks the background, every prop's key, and the sound key - the keys the room
actually uses.

The trap, and the reason for the last hint: a loaded pack is stored in `this.cache.json` under the
key it was loaded with. After U removes the pictures and sounds, loading the room again with the
same pack key is **skipped** - the key is in the cache - so no files are queued, the loader
completes at once, and the room starts with nothing loaded. Tested with the harness: with the
`this.cache.json.remove` line taken out, going back into an unloaded room draws every picture as
the missing texture and stops with `Error: Audio key "shoot" not found in cache`. With it, U and
going back in works every time.

**Look for:**
- a different key per room for `load.pack` (one key for all four means only the first room ever
  loads - the others' packs are skipped)
- the pack's `"player"` entry in two sections - the loader skips it the second time, as before
- `rooms.ts` no longer containing any file names
- an alternative that is just as good: load `rooms_pack.json` once with `this.load.json`, and give
  `this.load.pack` one section of it as an object instead of a file name -
  `this.load.pack({ key: packKey(room), url: { [room.section]: packData[room.section] } })`
