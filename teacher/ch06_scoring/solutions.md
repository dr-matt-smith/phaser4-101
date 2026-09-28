# Chapter 6 - Scoring: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. A star is born

**Project:** [solutions/ch06_challenge_1_a_star_is_born](solutions/ch06_challenge_1_a_star_is_born/)
(from `ch06_coin_collector`)

**Goal:** find the places a pickup type is described, and add one - data, not new code.

`src/objects/Coin.ts`
```ts
export const GEM: CoinKind = { texture: GEM_KEY, points: 50, scale: 1.5, lifetimeScale: 0.6 };
// CHALLENGE 1 - the rarest and quickest pickup
export const STAR: CoinKind = { texture: STAR_KEY, points: 100, scale: 1.6, lifetimeScale: 0.45 };
```

`src/scenes/GameScene.ts`
```ts
const STAR_CHANCE = 0.05;          // CHALLENGE 1 - one pickup in twenty is a star
...
// CHALLENGE 1 - one random number, split into three ranges: star, gem, coin
const roll = Math.random();
let kind = GOLD_COIN;
if (roll < STAR_CHANCE) {
  kind = STAR;
} else if (roll < STAR_CHANCE + GEM_CHANCE) {
  kind = GEM;
}
```

plus `STAR_KEY` / `STAR_FILE` in `assets.ts`, `this.load.image(STAR_KEY, STAR_FILE)` in
`TitleScene.preload()`, a third picture on the title screen, and `star.png` copied into
`public/assets/images/`.

**Look for:** `ScoreManager`, `HudScene` and `Coin`'s class untouched - the points come from the
`CoinKind`, and the ScoreManager only ever sees a number. The most common slip is calling
`Math.random()` twice (`if (Math.random() < 0.05) ... else if (Math.random() < 0.12)`), which
quietly changes the odds: the gem chance becomes 12% of the remaining 95%. One roll, split into
ranges, is the clean answer. Tested with the harness: 200 spawned pickups gave 167 coins, 24 gems
and 9 stars, and a clicked star scored 100.

---

## 2. Bonus life

**Project:** [solutions/ch06_challenge_2_bonus_life](solutions/ch06_challenge_2_bonus_life/)
(from `ch06_coin_collector`)

**Goal:** see the payoff of events: change the rules in one place, and the display follows.

`src/ScoreManager.ts`
```ts
if (this.pickups % PICKUPS_PER_LEVEL === 0) {
  this.level = this.level + 1;
  this.emit(LEVEL_CHANGED, this.level);

  // CHALLENGE 2 - a new level gives back one lost life. The HUD already listens for
  // LIVES_CHANGED, so it fills a heart in again without being changed at all.
  if (this.lives < START_LIVES) {
    this.lives = this.lives + 1;
    this.emit(LIVES_CHANGED, this.lives);
  }
}
```

**Why it works without touching the HUD** (the question in the challenge): the HUD does not know
*why* lives change. It listens for `LIVES_CHANGED` and redraws the hearts from the number it is
given - so a life gained is shown exactly like a life lost.

**Look for:** the change in `ScoreManager`, not in `GameScene` (a student who adds a life in the
game scene's `LEVEL_CHANGED` listener has to reach into the ScoreManager - there is no setter - and
usually ends up adding one, which is worth discussing). The cap at three. Tested with the harness:
two lives lost, ten pickups - hearts go from `1, 0.2, 0.2` to `1, 1, 0.2`; two more levels and all
three are back, and no more.

---

## 3. Combo meter

**Project:** [solutions/ch06_challenge_3_combo_meter](solutions/ch06_challenge_3_combo_meter/)
(from `ch06_coin_collector`)

**Goal:** a new view of existing data, entirely in the HUD.

`src/ScoreManager.ts`
```ts
// CHALLENGE 3 - exported, so the HUD's meter can use the same numbers as the rules
export const COMBO_STEP = 5;    // the multiplier goes up by 1 for every 5 pickups in a row
export const MAX_MULTIPLIER = 5;
```

`src/scenes/HudScene.ts`
```ts
this.add.rectangle(METER_X, METER_Y, METER_WIDTH, METER_HEIGHT, 0x000000, 0.6).setOrigin(0, 0.5);
this.meterFill = this.add.rectangle(METER_X, METER_Y, METER_WIDTH, METER_HEIGHT, 0xf4a261).setOrigin(0, 0.5);
this.meterFill.scaleX = 0;
...
private showMeter(combo: number, multiplier: number): void {
  this.tweens.killTweensOf(this.meterFill);

  if (multiplier >= MAX_MULTIPLIER) {
    this.meterFill.scaleX = 1;   // the top multiplier: nothing more to fill, so it stays full
    return;
  }

  const step = combo % COMBO_STEP;   // 0 to 4: pickups since the multiplier last went up
  if (combo > 0 && step === 0) {
    // the multiplier has just gone up: show the bar full for a moment, then empty it
    this.meterFill.scaleX = 1;
    this.tweens.add({ targets: this.meterFill, scaleX: 0, delay: 150, duration: 300 });
  } else {
    // a fifth for each pickup - or empty when the combo is broken (combo 0, step 0)
    this.tweens.add({ targets: this.meterFill, scaleX: step / COMBO_STEP, duration: 120 });
  }
}
```

`showMeter` is called at the end of `showCombo`, which already runs on every `COMBO_CHANGED`.

- the fill is a `Rectangle` stretched with `scaleX`; origin `(0, 0.5)` makes it grow from the left.
  Changing `width` also works, but a Rectangle's `width` does not redraw its shape - `setSize` does
- `%` (remainder) turns "combo 13" into "3 towards the next step"

**Look for:** the constants **exported** from `ScoreManager.ts`, not copied as a second `5` in the
HUD (a copy goes wrong the day someone changes the rule). `killTweensOf` before starting a new
tween, so an old one does not fight it. Accept a meter with no tween at all. Tested with the
harness: 3 pickups gives 0.6; the 5th fills it and it empties; a broken combo gives 0; the top
multiplier keeps it full.

---

## 4. Wipe the slate

**Project:** [solutions/ch06_challenge_4_wipe_the_slate](solutions/ch06_challenge_4_wipe_the_slate/)
(from `ch06_high_score_table`)

**Goal:** a small state machine for keyboard input, and removing something from storage.

`src/HighScoreTable.ts`
```ts
// CHALLENGE 4 - empty the table, and forget the saved copy too
public clear(): void {
  this.entries = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage turned off: there was nothing saved to remove
  }
}
```

`src/scenes/TitleScene.ts`
```ts
// CHALLENGE 4 - R asks the question; then Y clears the table, and any other key cancels
private handleKey(event: KeyboardEvent): void {
  const key = event.key.toLowerCase();
  if (!this.confirming) {
    if (key === "r") {
      this.confirming = true;
      this.prompt.setVisible(true);
    }
    return;
  }

  if (key === "y") {
    HighScoreTable.load().clear();
    const data: TitleData = {};   // no row to highlight any more
    this.scene.restart(data);     // start this scene again: it reads the (now empty) table
  } else {
    this.confirming = false;
    this.prompt.setVisible(false);
  }
}
```

and the SPACE listener becomes `on` with a check, so it does nothing while the question is showing:

```ts
this.input.keyboard!.on("keydown-SPACE", () => {
  if (!this.confirming) {
    this.scene.start(GAME_SCENE);
  }
});
```

**The trap most students fall into:** listening for R, and then adding a `"keydown"` listener
*inside* the R listener to hear the answer. Phaser sends `keydown-R` first and then `keydown` for
the **same** key press - so the brand-new listener hears the R, and takes it as the answer. We
checked this in a scratch copy: the answer listener logged `answer: r` straight after `asking`.
One `keydown` listener with a `confirming` flag avoids it.

**Look for:** `confirming` reset in `init()` (the scene object is reused); `clear()` on
`HighScoreTable` rather than `localStorage.removeItem` with the key copied into the scene;
`restart({})` rather than `restart()` - without data, the new start could still carry the old
`highlight`. Tested with the harness: R shows the question, N or SPACE cancel and leave the table,
R then Y empties it, the storage key is gone, and it is still empty after a reload.

---

## 5. Chasing the record

**Project:** [solutions/ch06_challenge_5_chasing_the_record](solutions/ch06_challenge_5_chasing_the_record/)
(from `ch06_high_score_table`)

**Goal:** a second listener on the same event, with its own state.

`src/scenes/HudScene.ts`
```ts
init(data: HudData): void {
  ...
  // CHALLENGE 5 - the HUD reads the table itself: it is the only one that needs the top score
  this.record = HighScoreTable.load().getTopScore();
  this.celebrated = false;
}
...
this.scoreManager.on(SCORE_CHANGED, this.checkRecord, this);   // CHALLENGE 5 - a second listener
...
private showScore(score: number): void {
  this.shownScore = score;
  this.scoreText.setText(String(score).padStart(SCORE_DIGITS, "0"));
  // CHALLENGE 5 - HI shows the record, or the score on screen once that is higher, so the two
  // count up together
  this.hiText.setText(String(Math.max(this.record, score)).padStart(SCORE_DIGITS, "0"));
}

private checkRecord(score: number): void {
  if (this.celebrated || this.record === 0 || score <= this.record) {
    return;
  }
  this.celebrated = true;
  this.hiText.setColor("#ffd166");
  ...
```

The rest of `checkRecord` makes a big "NEW HIGH SCORE!" text and blinks it with a tween before
destroying it (the same pattern as the level banner).

**Look for:**
- `celebrated` reset in `init()` - otherwise the second game never celebrates (Chapter 2's trap)
- the matching `off` for the new listener in the `SHUTDOWN` handler
- `HI` updated in `showScore` (so it counts up with the score) rather than jumping to the new score
  in the listener - both are acceptable, but ask which looks better
- `record === 0`: with an empty table every first point would be a "new high score". A good
  discussion point - is it one?

Some students put the record in the `ScoreManager`. That is defensible (it is a scoring fact), but
then the ScoreManager needs the table, or has to be given the record - ask them to argue for it.
Tested with the harness: record 300; at 170 and 230 nothing; at 330 `HI` shows 000330, gold, and
the message appears once.

---

## 6. Easy, normal, hard

**Project:** [solutions/ch06_challenge_6_easy_normal_hard](solutions/ch06_challenge_6_easy_normal_hard/)
(from `ch06_high_score_table`)

**Goal:** data that travels through every scene; one storage key per table.

A new file describes the difficulties:

`src/Difficulty.ts`
```ts
export type Difficulty = "easy" | "normal" | "hard";

export interface DifficultySettings {
  name: string;
  lifetimeScale: number;   // how long coins stay: 1.4 = 40% longer
  spawnScale: number;      // the time between coins: 0.75 = they come a quarter faster
}

export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: { name: "EASY", lifetimeScale: 1.4, spawnScale: 1.25 },
  normal: { name: "NORMAL", lifetimeScale: 1, spawnScale: 1 },
  hard: { name: "HARD", lifetimeScale: 0.7, spawnScale: 0.75 },
};
```

The answer to the hint's question - `load()` takes the difficulty, and uses it to choose the
storage key; the table remembers its key for `save()`:

`src/HighScoreTable.ts`
```ts
// CHALLENGE 6 - each difficulty is saved under its own key. "normal" keeps the original key, so
// the scores saved before there were difficulties still count as normal ones.
function storageKeyFor(difficulty: Difficulty): string {
  return difficulty === "normal" ? STORAGE_KEY : `${STORAGE_KEY}.${difficulty}`;
}
...
public static load(difficulty: Difficulty = DEFAULT_DIFFICULTY): HighScoreTable {
  const key = storageKeyFor(difficulty);
```

Then the difficulty is carried in scene data all the way round: `TitleData` and a new `GameData`
gain `difficulty?`, `GameOverData` gains `difficulty`, and every `this.scene.start` passes it on.
The title screen's 1, 2 and 3 keys restart it with the chosen difficulty:

`src/scenes/TitleScene.ts`
```ts
private choose(difficulty: Difficulty): void {
  const data: TitleData = { difficulty: difficulty };
  this.scene.restart(data);
}
```

and the game scene scales its timings:

`src/scenes/GameScene.ts`
```ts
const lifetime = levelLifetime * DIFFICULTIES[this.difficulty].lifetimeScale;   // CHALLENGE 6
```

**Look for:**
- a union type (or enum) for the difficulty rather than bare strings or numbers - then
  `Record<Difficulty, ...>` makes the compiler insist every difficulty has settings
- the difficulty in **every** hand-over. The usual bug: playing again from the game over screen
  (SPACE) silently goes back to normal, because `GameOverScene` starts `GameScene` with no data. The
  tidy fix is the one here; storing the current difficulty in the registry is also a fair answer
- keeping the old key for normal - a thoughtful touch, not required
- a default parameter (`difficulty: Difficulty = DEFAULT_DIFFICULTY`) so older calls still compile

Tested with the harness: a seeded normal table shows under NORMAL; 3 shows an empty HARD table; a
hard game's coins last 1680 ms instead of 2400; a hard high score goes into
`phaser4-guide.coin-collector.high-scores.hard` and the normal table is untouched; after an easy
game, SPACE on the game over screen plays easy again.
