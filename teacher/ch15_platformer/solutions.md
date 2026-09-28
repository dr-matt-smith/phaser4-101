# Chapter 15 - Platformer: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change to the code is marked with a `// CHALLENGE n` comment. Two
solutions (4 and 6) also change the Tiled maps; JSON cannot hold comments, so those changes are
described below.

---

## 1. Double jump

**Project:** [solutions/ch15_challenge_1_double_jump](solutions/ch15_challenge_1_double_jump/)
(from `ch15_platformer_simple`)

**Goal:** a counter that is used up in the air and refilled on landing - the first taste of the hero
remembering something between frames.

`src/objects/Hero.ts`
```ts
const AIR_JUMP_SPEED = 420; // CHALLENGE 1: the jump in the air is a little weaker
const AIR_JUMPS = 1; // CHALLENGE 1: how many extra jumps the hero gets in the air
...
// CHALLENGE 1: standing on something gives the air jumps back
if (this.body.blocked.down) {
  this.airJumpsLeft = AIR_JUMPS;
}

if (jumpPressed && this.body.blocked.down) {
  this.setVelocityY(-JUMP_SPEED); // negative y is UP
  this.scene.sound.play(JUMP_SOUND);
} else if (jumpPressed && this.airJumpsLeft > 0) {
  // CHALLENGE 1: a second jump, in the air - it REPLACES the speed, so it works the same
  // whether the hero is still rising or already falling
  this.airJumpsLeft = this.airJumpsLeft - 1;
  this.setVelocityY(-AIR_JUMP_SPEED);
  this.scene.sound.play(JUMP_SOUND, { rate: 1.3 }); // a higher-pitched jump sound
}
```

Tested with the harness, logging the vertical speed every frame while pressing jump three times:
-520 (the ground jump), later -420 (the air jump), and nothing for the third press; the counter is
back to 1 after landing.

**Look for:**
- the refill happens on the *floor*, not in the jump - otherwise the first jump would use the air
  jump up too
- **setting** the speed rather than **adding** to it. `velocity.y - 420` while falling fast gives a
  feeble second jump; while rising it gives a rocket. Setting it makes the second jump the same
  every time
- `AIR_JUMPS` as a constant: a triple jump is then a one-character change. Some students use a
  boolean `hasDoubleJumped`; that is fine for exactly one extra jump
- walking off a ledge also allows one air jump here. Either answer is fine if the student can say
  which they chose

---

## 2. Springboard

**Project:** [solutions/ch15_challenge_2_springboard](solutions/ch15_challenge_2_springboard/)
(from `ch15_platformer_simple`)

**Goal:** a texture drawn in code, a static body with a collider callback, and the hero being told
to move rather than moving itself.

`src/scenes/GameScene.ts`
```ts
if (!this.textures.exists(SPRING_KEY)) {
  // make.graphics(..., false) draws off-screen: the Graphics is only used to make a texture
  const g = this.make.graphics({}, false);
  ...
  g.generateTexture(SPRING_KEY, SPRING_WIDTH, SPRING_HEIGHT);
  g.destroy();
}

// origin (0.5, 1): (x, y) is the bottom middle - here, the top of the ground strip
const spring = this.physics.add.staticImage(SPRING_X, 536, SPRING_KEY).setOrigin(0.5, 1);
spring.refreshBody(); // a static body does not follow changes to the image by itself

this.physics.add.collider(this.hero, spring, () => {
  // only when landing on TOP of it, not walking into its side
  if (this.hero.body.touching.down) {
    this.hero.launch(SPRING_SPEED);
    this.sound.play(JUMP_SOUND, { rate: 0.7 }); // a deeper "boing"
    this.tweens.add({ targets: spring, scaleY: 0.5, duration: 80, yoyo: true });
  }
});
```

`src/objects/Hero.ts`
```ts
// CHALLENGE 2: thrown upwards by a springboard - a jump the hero did not choose
public launch(speed: number): void {
  this.setVelocityY(-speed);
}
```

The speed comes from the jump-height formula in the chapter: to rise about 430 pixels (from the
ground at 536 to above the top platform at 144) with gravity 900 needs `sqrt(2 x 900 x 430)`, about
880. The spring sits at x = 570, in the gap between two platforms, so the hero is not stopped by a
platform on the way up. Tested with the harness: dropped on the spring, the hero's feet rose to
y = 93, above the top platform; steering left in the air it landed on the top platform and collected
its coins.

**Look for:**
- `this.textures.exists` before generating: R restarts the scene, and the texture already exists the
  second time
- `refreshBody()` after `setOrigin` - without it the static body stays where the image *was*, and the
  hero bounces off thin air. A classic, and worth showing with `debug: true`
- `touching.down` (the hero's bottom touched something) so walking into the side does not launch.
  Because the spring is only 20 pixels high, Arcade often lifts a hero walking into it on top of it -
  which then launches it. That is how most games behave; accept it
- a `launch()` method on `Hero` (ask, don't reach in - Chapter 2) is better than the scene setting
  the hero's velocity itself, though both work
- a `processCallback` returning `touching.down` is a good alternative

---

## 3. Coin record

**Project:** [solutions/ch15_challenge_3_coin_record](solutions/ch15_challenge_3_coin_record/)
(from `ch15_platformer_advanced`)

**Goal:** structured data in `localStorage`, checked on the way back in, and one class that owns it.

`src/Progress.ts`
```ts
// CHALLENGE 3: keep this result if it beats the record; true if it did
public static saveCoins(index: number, coins: number, total: number): boolean {
  const records = Progress.loadCoinRecords();
  const old = records[index];
  if (old !== null && old !== undefined && old.coins >= coins) {
    return false;
  }
  records[index] = { coins, total };
  try {
    localStorage.setItem(COINS_KEY, JSON.stringify(records));
  } catch {
    // storage switched off: the record is simply not kept
  }
  return true;
}

// CHALLENGE 3: an array with a record (or null) for each level. Everything read back from
// storage is checked: it might be missing, or not what we wrote
private static loadCoinRecords(): (CoinRecord | null)[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(COINS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => Progress.isCoinRecord(item) ? item : null);
  } catch {
    return []; // not valid JSON, or no storage
  }
}
```

`src/scenes/MenuScene.ts`
```ts
// CHALLENGE 3: a finished level shows its coin record
const record = Progress.coinRecord(index);
const coins = record === null ? "" : `   ${record.coins}/${record.total}`;
const label = open ? `${index + 1}   ${level.name}${coins}` : `${index + 1}   locked`;
```

`ResultScene` calls `Progress.saveCoins(r.level, r.coins, r.totalCoins)` when a level is completed
and shows "New coin record!" if it returns `true`. The total is saved with the record because the
menu has not loaded any map and cannot count the coins itself. Tested with the harness: a result of
5 coins showed "New coin record!", a later result of 3 did not, the menu showed "1   Green Hills
5/21", and a corrupted value (`{bad json`) in storage gave a menu with no records rather than a
crash.

**Look for:**
- the record saved only for a *completed* level (a game over should not count - the challenge says
  "finished")
- `unknown` and a type guard (`item is CoinRecord`) for what comes back from `JSON.parse`, not
  `as CoinRecord[]` - the Chapter 6 lesson
- `try`/`catch` around `JSON.parse`: it throws on bad JSON
- the record stored by level *index* - fine while levels are never reordered; the level `key` would be
  more robust, and a good discussion point

---

## 4. Wall jump

**Project:** [solutions/ch15_challenge_4_wall_jump](solutions/ch15_challenge_4_wall_jump/)
(from `ch15_platformer_intermediate`)

**Goal:** reading `blocked.left`/`right` in the air, and briefly taking control away from the player -
a real game-feel technique.

`src/objects/Hero.ts`
```ts
// CHALLENGE 4: in the air, pressed against a wall: slide down it slowly, and jump off it
private wallJump(time: number): void {
  if (this.body.blocked.down) {
    return;
  }
  const onLeftWall = this.body.blocked.left && this.cursors.left.isDown;
  const onRightWall = this.body.blocked.right && this.cursors.right.isDown;
  if (!onLeftWall && !onRightWall) {
    return;
  }

  // sliding: never fall faster than WALL_SLIDE_SPEED while holding on
  if (this.body.velocity.y > WALL_SLIDE_SPEED) {
    this.setVelocityY(WALL_SLIDE_SPEED);
  }

  // jump pressed (just now, or a moment ago - the same buffer as a normal jump)
  if (time - this.jumpPressedAt <= JUMP_BUFFER) {
    this.jumpPressedAt = -1000;
    this.wallJumpDirection = onLeftWall ? 1 : -1; // away from the wall
    this.setVelocity(this.wallJumpDirection * WALL_JUMP_ACROSS, -WALL_JUMP_UP);
    this.keysIgnoredUntil = time + WALL_JUMP_LOCK;
    this.setFlipX(this.wallJumpDirection < 0);
    this.scene.sound.play(JUMP_SOUND);
  }
}
```

`src/objects/Hero.ts`
```ts
// CHALLENGE 4: straight after a wall jump, keep going away from the wall whatever the keys
// say - otherwise a player still holding the arrow towards the wall pulls the hero back
if (time < this.keysIgnoredUntil) {
  this.setAccelerationX(this.wallJumpDirection * RUN_ACCELERATION);
  return;
}
```

**The map.** Two stone columns (tile 5, so `gid` 6) were added to the Ground layer of both copies of
`level.tmj`, at columns 5 and 8 from row 4 down to row 13, making a shaft two tiles wide just right of
the start. Rows 14 and 15 are left open so the hero can walk in underneath. Four coins (points of
type `coin`) sit at the top of the shaft, at columns 6 and 7, rows 4 and 5: out of reach of a normal
jump, which reaches about row 10. In Tiled: select the Ground layer, stamp the stone tile, then add
the points on the Objects layer; save, and copy the file to `public/assets/maps/`.

Tested with the harness, with a small script in the page standing in for the player (hold towards
a wall; when `blocked` against it in the air, press jump and switch direction): four wall jumps
reached the top of the shaft and collected all four coins.

**Look for:**
- "pressing into the wall" in the test. Without it the hero sticks to walls it merely brushes
- the key lock. Without it, the player is still holding the arrow towards the wall when the jump
  happens, acceleration pulls the hero straight back, and it climbs a single wall - which feels like
  a bug. Many students discover this the hard way; it is the most useful thing in the challenge
- re-using `jumpPressedAt` gives wall jumps the same buffering as normal ones for free
- the max velocity (220) caps the push away from the wall, so `WALL_JUMP_ACROSS` above 220 does
  nothing - a good question to ask a student who set it to 400

---

## 5. Medal times

**Project:** [solutions/ch15_challenge_5_medal_times](solutions/ch15_challenge_5_medal_times/)
(from `ch15_platformer_advanced`)

**Goal:** extend the level data, keep a clock in the HUD without flooding the registry with events,
and compare "better" with a ranking.

`src/config/levels.ts`
```ts
// CHALLENGE 5: the times, in seconds, to beat for each medal
export interface MedalTimes {
  gold: number;
  silver: number;
  bronze: number;
}
```

`src/config/medals.ts`
```ts
export type Medal = "gold" | "silver" | "bronze" | "none";

// better medals have bigger numbers, so two medals can be compared with > and <
export const MEDAL_RANK: Record<Medal, number> = { none: 0, bronze: 1, silver: 2, gold: 3 };
```

`src/scenes/HudScene.ts`
```ts
// CHALLENGE 5: the clock changes every frame, so it is worked out here rather than sent as an
// event. Every scene's clock is the game's clock, so this.time.now here is the same as in
// GameScene
override update(): void {
  const start: number = this.registry.get(START_TIME);
  const end: number = this.registry.get(END_TIME);
  const now = end > 0 ? end : this.time.now;
  this.clockText.setText(((now - start) / 1000).toFixed(1));
}
```

`GameScene` puts `START_TIME` in the registry when the level starts and sets `END_TIME` in
`endLevel()`, so the clock stops the moment the flag is touched (the HUD would otherwise tick on
through the fade-out). `ResultScene` works out the medal with `medalFor(r.seconds, times)`, shows it
in its colour with the three target times, and saves it with `Progress.saveMedal()`, which keeps
only a better rank. The menu draws a coloured disc with the medal's initial beside each level.

Tested with the harness: a 5-second run of Green Hills (after teleporting to the flag) showed
"GOLD medal - a new best!" and a G disc on the menu; a later result of 50 seconds showed "BRONZE
medal" without "a new best", and storage still held `["gold"]`.

**Look for:**
- the times in `LevelInfo`, not in the result scene: data about a level lives with the level
- no `changedata` event every frame for the clock - the HUD reading two numbers in its own
  `update()` is the right tool here, and a good contrast with the event-driven coins and lives
- `MEDAL_RANK` (or an array index) to compare medals; string comparison (`"gold" > "bronze"`) happens
  to work alphabetically for some pairs and not others
- the medal times are guesses; ask how they would set them properly (play-testing: gold about the
  designer's best, bronze easy)

---

## 6. A new enemy

**Project:** [solutions/ch15_challenge_6_new_enemy](solutions/ch15_challenge_6_new_enemy/)
(from `ch15_platformer_advanced`)

**Goal:** add a class to an existing design through its interface, and change the interface when
the design needs it.

`src/objects/Enemy.ts`
```ts
export interface Enemy {
  body: Phaser.Physics.Arcade.Body;
  isSquashed(): boolean;
  squash(): void;
  canBeStomped(): boolean; // CHALLENGE 6: false for an enemy that hurts even from above
}
```

`src/objects/Ghost.ts`
```ts
protected override preUpdate(time: number, delta: number): void {
  super.preUpdate(time, delta);

  const distance = Phaser.Math.Distance.BetweenPoints(this, this.target);
  if (distance < NOTICE_DISTANCE) {
    // aim at the hero's middle, not its feet (its origin is at the feet)
    this.scene.physics.moveTo(this, this.target.x, this.target.y - 24, SPEED);
  } else {
    this.setVelocity(0, 0);
  }
  this.setFlipX(this.body.velocity.x > 0);
}
```

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 6: only an enemy that CAN be stomped is squashed; the rest hurt from any side
if (falling && feetOnTop && enemy.canBeStomped()) {
  enemy.squash();
```

Adding `canBeStomped()` to the interface makes the compiler list every class that must now have it:
`Slime` and `Bat` each gain a three-line method returning `true`. `ghost.png` was copied from the
asset library into `public/assets/spritesheets/`, loaded in `PreloadScene`, and given an animation.
Ghosts are made from points of type `ghost`, with no collider (they drift through walls), and join
the one enemy overlap.

**The maps.** Points of type `ghost` were added to the Objects layer of both copies of each map:
level 1 at column 62, row 8; level 2 at column 25, row 13; level 3 at column 45, row 8 and column 88,
row 7.

Tested with the harness: a ghost 150 pixels away drifted towards the hero; dropping the hero on top
of the ghost cost a life, and dropping it on a slime still squashed the slime.

**Look for:**
- the interface changed, rather than `if (enemy instanceof Ghost)` in the scene. The `instanceof`
  answer works, but the scene then has to know every kind of enemy - exactly what the interface was
  there to avoid. A great discussion
- `Ghost.squash()` is an empty method the scene never calls. Ask whether that is a smell: splitting
  the interface (`Enemy` and `Stompable extends Enemy`) is the cleaner design, and some students will
  find it
- a slow speed - a ghost as fast as the hero cannot be escaped
- `moveTo` every frame steers the ghost continuously; compare the bat, which aims once and misses
