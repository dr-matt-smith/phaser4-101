# Chapter 13 - Memory match: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment. Every solution was
played with the test harness; what was checked is noted under each.

---

## 1. Choose the size

**Project:** [solutions/ch13_challenge_1_choose_the_size](solutions/ch13_challenge_1_choose_the_size/)
(from `ch13_memory_simple`)

**Goal:** turn constants into state that survives a restart - `scene.restart(data)` and `init(data)`.

`ROWS` and `COLS` become fields, and the three sizes a table:

`src/scenes/GameScene.ts`
```ts
const SIZES: BoardSize[] = [
  { rows: 3, cols: 4 },
  { rows: 4, cols: 4 },
  { rows: 4, cols: 6 },
];
...
export interface BoardSize {
  rows: number;
  cols: number;
}
...
private rows = SIZES[0].rows;   // CHALLENGE 1: the size is a field now, not a constant
private cols = SIZES[0].cols;
```

The keys restart the scene with a size; `init` takes it, or keeps the size it had:

```ts
init(data: Partial<BoardSize>): void {
  this.rows = data.rows ?? this.rows;
  this.cols = data.cols ?? this.cols;
...
this.input.keyboard!.on("keydown-ONE", () => {
  this.scene.restart(SIZES[0]);
});
```

- the first start (from the game config) and `restart()` with no data both hand `init` an **empty
  object**, so the fields may be missing. `Partial<BoardSize>` is "a `BoardSize` with every field
  optional", and `??` (the nullish coalescing operator) falls back to the current size when a field is missing. So SPACE after a win -
  `this.scene.restart()`, unchanged - plays again at the same size, for free
- `layOutGrid` swaps `ROWS`/`COLS` for `this.rows`/`this.cols`; nothing else in it changes, because
  it was already centring by arithmetic. That is the point of the challenge

Tested: 1, 2, 3 give 12, 16 and 24 tiles; the 6 x 4 grid spans x 60-740 and y 76-524 (centred);
SPACE after winning the 4 x 4 board gives another 4 x 4 board.

**Look for:** the size in the restart data (not a field set before `restart`, which works but by
accident - the scene object is reused); the grid still centred at every size; the message saying the
size. Students who keep the size in the **registry** instead have a good answer too. Some will ask
about a 5 x 5 board: 25 tiles cannot make pairs - a nice moment to add a check that `rows * cols` is
even.

---

## 2. Against the clock

**Project:** [solutions/ch13_challenge_2_against_the_clock](solutions/ch13_challenge_2_against_the_clock/)
(from `ch13_memory_intermediate`)

**Goal:** a losing condition - and the discovery that it can happen in the *middle* of something.

The countdown is the same clock, shown the other way round:

`src/scenes/GameScene.ts`
```ts
if (this.seconds >= TIME_LIMIT) {
  this.seconds = TIME_LIMIT;
  this.outOfTime();
}
...
const left = TIME_LIMIT - this.seconds;
this.timeText.setText(`Time left: ${left.toFixed(1)}`);
this.timeText.setColor(left <= HURRY_TIME ? "#e63946" : "#ffffff");
```

Running out of time is a new, permanently locked state, `"timeUp"`:

```ts
private outOfTime(): void {
  this.clockRunning = false;
  this.state = "timeUp";

  // cancel a wrong pair that is waiting to turn back (the tiles simply stay face up)
  this.time.removeAllEvents();

  // anything face down - or on its way down - turns face up
  for (const tile of this.tiles) {
    if (!tile.isFaceUp()) {
      tile.reveal();
    }
  }
```

The hard part is that time can run out at any moment: while the second tile is flipping up, while a
wrong pair is waiting to turn back, or while it is half-way through turning back. Three small pieces
cover all of them:

- `this.time.removeAllEvents()` cancels the pending "turn the wrong pair back" call
- `checkPair` starts with `if (this.state === "timeUp") { return; }`, so a flip that finishes late
  does nothing
- `Tile.reveal()` stops any flip in progress - and with it the callback that would have unlocked the
  board - and flips the tile up:

`src/objects/Tile.ts`
```ts
public reveal(): void {
  this.scene.tweens.killTweensOf(this);
  this.scaleX = 1;
  this.flipUp();
}
```

`WinData` gains `pairsFound` and `outOfTime`; the win scene shows "Out of time!", no earned stars
(all three grey) and "Pairs found: 1 of 8", and plays the wrong sound instead of the win sound.

Tested: time forced to run out (by moving `startTime` back) while a wrong pair was half-way through
turning back: every tile ends face up on its own face with `scaleX` 1, the state stays `"timeUp"`,
and the win scene reports `outOfTime: true`. The time turns red below ten seconds.

**Look for:** the timer counting down from the first click (not from the scene starting - either is
defensible, but be consistent with the chapter); a locked state for the end; and whether the student
thought about the "in the middle of a flip" cases. Many solutions work only when time runs out while
the board is idle - play one with a wrong pair showing at 0.5 seconds left and see. A new scene for
losing is also a fine answer.

---

## 3. A hint

**Project:** [solutions/ch13_challenge_3_a_hint](solutions/ch13_challenge_3_a_hint/)
(from `ch13_memory_intermediate`)

**Goal:** another locked state - and a lesson in how to write a lock.

`src/scenes/GameScene.ts`
```ts
private hint(): void {
  if (this.state !== "idle") {
    return;
  }
  const hidden = this.tiles.filter((tile) => !tile.isFaceUp());
  if (hidden.length === 0) {
    return;
  }
  const face = Phaser.Utils.Array.GetRandom(hidden).face;
  const pair = hidden.filter((tile) => tile.face === face);

  this.state = "hinting";
  this.moves = this.moves + HINT_COST;
  this.updateHud();
  for (const tile of pair) {
    tile.flash(() => {
      this.state = "idle";
    });
  }
}
```

In `"idle"` no unmatched tile is face up, so "face down" means "not yet found" - pick one at random,
and flash it and its partner. `Tile.flash` pulses the tile three times and glows it yellow:

`src/objects/Tile.ts`
```ts
public flash(onDone: () => void): void {
  this.setTint(HINT_TINT).setTintMode(Phaser.TintModes.ADD);
  this.scene.tweens.add({
    targets: this,
    scale: 1.12,
    duration: 150,
    yoyo: true,
    repeat: 2,
    onComplete: () => {
      this.clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
      onDone();
    },
  });
}
```

The ordinary tint *multiplies* colours, which can only make the dark tile darker; `ADD` brightens it.
(Both tiles call `onDone`, so the state is set to `"idle"` twice - harmless.)

**The bug the solution walked into.** The first version of this solution added `"hinting"` to the
`State` type and left `tileClicked` as it was:

```ts
if (this.state === "twoUp" || this.state === "checking") {
```

Clicking a tile during the hint then fell through to the "second tile" branch, with no first tile,
and the harness showed `TypeError: Cannot read properties of null (reading 'matches')`. The fix is to
list the states that **allow** a click, as the advanced version does:

```ts
if (this.state !== "idle" && this.state !== "oneUp") {
  return;
}
```

Now any state added later is locked unless someone decides otherwise. This is the most useful thing
to discuss from this challenge.

Tested: H in `"idle"` flashes two tiles with the same face and adds 2 moves; clicks during the flash
are ignored; H with one tile up does nothing.

**Look for:** the hint only when idle; the moves added; a new state or an equivalent lock while the
flash plays (without one, a click starts a flip - a `scaleX` tween - on a tile that is also being
scaled by the flash, and the two fight). Flipping the pair face up briefly is also an acceptable
"flash".

---

## 4. Two players

**Project:** [solutions/ch13_challenge_4_two_players](solutions/ch13_challenge_4_two_players/)
(from `ch13_memory_intermediate`)

**Goal:** find the one place in the state machine where a turn ends.

`src/scenes/GameScene.ts`
```ts
private player = 0;
private scores = [0, 0];
...
this.scores[this.player] = this.scores[this.player] + 1;
this.updateHud();
...
second.flipDown(() => {
  // CHALLENGE 4: THE place where a turn ends - a wrong pair, now face down again
  this.player = 1 - this.player;
  this.updateHud();
  this.state = "idle";   // unlock only once both are face down again
});
```

A pair scores for the current player, who simply goes again - nothing to do. A wrong pair passes
the turn, and the right moment is when the tiles are face down and the board unlocks. Switching when
the wrong pair is *found* would show "Player 2's turn" while player 1's tiles are still up.
`1 - this.player` flips between 0 and 1.

The HUD shows both scores and whose turn it is, in that player's colour. `WinData` carries `scores`,
and the win scene announces the winner or a draw:

`src/scenes/WinScene.ts`
```ts
const [p1, p2] = this.result.scores;
let heading = "A draw!";
if (p1 > p2) {
  heading = "Player 1 wins!";
} else if (p2 > p1) {
  heading = "Player 2 wins!";
}
```

`const [p1, p2] = ...` is **destructuring**: the first two items of the array, as two constants.

Stars are dropped: moves are shared by both players, so they no longer say how well either played.

Tested: player 1 finds a pair and keeps the turn (score 1-0); a wrong pair passes to player 2, who
finds three (1-3); a wrong pair passes back; the game ends 5-3 and the win scene says "Player 1
wins!". Playing again starts at 0-0, player 1.

**Look for:** the turn switched in exactly one place; scores reset in `init()` - and reset with a
**new** array (`this.scores = [0, 0]`), because the old array was handed to the win scene inside
`WinData`, and changing it in place would change the result being shown. Worth asking students
why that matters even though the win scene has already drawn it.

---

## 5. Triple match

**Project:** [solutions/ch13_challenge_5_triple_match](solutions/ch13_challenge_5_triple_match/)
(from `ch13_memory_simple`)

**Goal:** generalise from "a first tile" to "the tiles showing", and redesign the states.

`src/scenes/GameScene.ts`
```ts
type State = "idle" | "picking" | "wrong";   // CHALLENGE 5
...
private showing: Tile[] = [];
```

```ts
tile.showFace();
this.showing.push(tile);

if (!tile.matches(this.showing[0])) {
  // a different face - this group is wrong, however many are showing
  this.state = "wrong";
  const wrongGroup = this.showing;
  this.showing = [];
  this.time.delayedCall(MISMATCH_DELAY, () => {
    for (const wrongTile of wrongGroup) {
      wrongTile.hideFace();
    }
    this.state = "idle";
  });
} else if (this.showing.length === GROUP_SIZE) {
```

- `makeFaces` pushes each face `GROUP_SIZE` times; the board holds `ROWS * COLS / GROUP_SIZE` groups
- comparing each new tile with the **first** one is enough: if every tile matches the first, they all
  match each other
- `wrongGroup` keeps hold of the array for the delayed call, while `this.showing` starts afresh

With `GROUP_SIZE = 2` this is the ordinary game again - a good test that the generalisation is right.
How big can the board be? Twelve faces make 36 tiles - 6 x 6, which does not fit at 100 pixels a
tile (the grid would be 680 pixels tall), so it would need smaller tiles or scaling as in the
advanced version.

Tested: three the same stay up; two different are wrong straight away (after two clicks); two the
same and a third different is wrong with three showing; clicks during `"wrong"` are ignored; all four
groups found wins.

**Look for:** the array rather than `firstTile`/`secondTile`/`thirdTile`; the lock still there; a
wrong guess ending the group as soon as it is wrong (a student who waits for three tiles before
comparing has made a different - but playable - game; ask which is better).

---

## 6. Keyboard control

**Project:** [solutions/ch13_challenge_6_keyboard_control](solutions/ch13_challenge_6_keyboard_control/)
(from `ch13_memory_advanced`)

**Goal:** separate *where* from *what*: a cursor is a place on the board, and a tile is whatever is
there now.

`layOutGrid` keeps the numbers it already worked out, so a column and row can be turned into x and y
on any level, in either theme, at any scale:

`src/scenes/GameScene.ts`
```ts
this.gridLeft = left;
this.gridTop = top;
this.stepX = (width + GAP) * scale;
this.stepY = (height + GAP) * scale;
```

The cursor is a `Rectangle` with a stroke and no fill, drawn above the tiles, and the keys move it
(clamped to the board) or pick the tile under it:

```ts
private moveCursor(dCol: number, dRow: number): void {
  this.cursorCol = Phaser.Math.Clamp(this.cursorCol + dCol, 0, this.level.cols - 1);
  this.cursorRow = Phaser.Math.Clamp(this.cursorRow + dRow, 0, this.level.rows - 1);
  this.cursor.setPosition(this.placeX(this.cursorCol), this.placeY(this.cursorRow));
}

private pickAtCursor(): void {
  const x = this.placeX(this.cursorCol);
  const y = this.placeY(this.cursorRow);
  const tile = this.tiles.find((t) => Phaser.Math.Distance.Between(t.x, t.y, x, y) < 1);
  if (tile !== undefined) {
    this.tileClicked(tile);
  }
}
```

`pickAtCursor` hands the tile to the same `tileClicked` the mouse uses, so every rule - the locks,
face-up tiles, matched tiles - applies to the keyboard without a line of new logic. And because it
looks for the tile *at the place* every time, it keeps working after a shuffle has moved the tiles
round (`find` returns `undefined` if nothing is there - it never is, but the type says it could be).

Tested on level 4 with cards (6 x 4): the cursor starts on the top-left card, clamps at the edges,
SPACE and ENTER turn over the card under it; after `shuffleUnmatched()` the card picked is the one
now at the cursor's place.

**Look for:** the cursor as (col, row) rather than a reference to a tile - a student who stores
"the tile under the cursor" finds it wrong after the first shuffle, which is exactly the point of the
hint; the tile found by position (or a 2D array of tiles kept up to date when the shuffle happens -
also good, but more to keep in step); the mouse still working; the cursor sized for both themes.
