# Chapter 14 - Catch, avoid and shoot: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment (and
`<!-- CHALLENGE n -->` in `index.html`). All six were played with the test harness, as described
under each one.

---

## 1. Pointer control

**Project:** [solutions/ch14_challenge_1_pointer_control](solutions/ch14_challenge_1_pointer_control/)
(from `ch14_catcher_simple`)

**Goal:** scene-wide pointer events, and moving an object *towards* a target rather than onto it.

The pointer sets a target; the keys, when pressed, take over again:

`src/scenes/GameScene.ts`
```ts
this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
  this.pointerTargetX = pointer.x;
});
this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
  this.pointerTargetX = pointer.x;
});
```

```ts
// CHALLENGE 1: a key press takes over from the pointer, until the pointer moves again
if (this.cursors.left.isDown) {
  this.pointerTargetX = null;
  this.basket.move(-1);
} else if (this.cursors.right.isDown) {
  this.pointerTargetX = null;
  this.basket.move(1);
} else if (this.pointerTargetX !== null) {
  this.moveTowardsPointer(this.pointerTargetX);
} else {
  this.basket.move(0);
}
```

```ts
private moveTowardsPointer(targetX: number): void {
  const distance = targetX - this.basket.x;
  if (Math.abs(distance) < CLOSE_ENOUGH) {
    this.basket.move(0);
  } else {
    this.basket.move(Math.sign(distance));
  }
}
```

`Basket` is unchanged - the scene still only calls `move(-1 | 0 | 1)`. That is the pay-off of the
chapter's design: a new way to control the basket, and not one line of the basket's class changes.

**Look for:**
- `pointerdown` as well as `pointermove`: a touch screen has no "move without pressing"
- a dead zone (`CLOSE_ENOUGH`). Without it the basket overshoots by a few pixels every frame and
  jitters from side to side - a good thing to let students see, then explain
- `pointerTargetX` reset in `init()` - otherwise a restarted game remembers where the pointer was
- a common simpler answer sets `this.basket.x = pointer.x`. It works, but the basket teleports and
  ignores its speed; the challenge asks it to slide. Some students use
  `this.physics.moveTo(basket, pointer.x, basket.y, SPEED)` - fine, if they stop it on arrival

Tested with the harness: mouse moved to x = 100, the basket stopped at 96; clicked at x = 650, it
stopped at 656; LEFT held, it moved left and the pointer target was cleared.

---

## 2. Combo scoring

**Project:** [solutions/ch14_challenge_2_combo_scoring](solutions/ch14_challenge_2_combo_scoring/)
(from `ch14_catcher_simple`)

**Goal:** a piece of game state with a clear reset rule, and feedback with a tween.

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 2: each fruit in a row is worth 10 more than the last, up to MAX_COMBO times 10
this.combo = this.combo + 1;
const points = FRUIT_POINTS * Math.min(this.combo, MAX_COMBO);
this.showPoints(fruit.x, fruit.y, points);
```

The combo breaks in one place - `loseLife()`, which both a dropped fruit and a caught bomb already
go through:

```ts
this.sound.play(HURT_SOUND);
this.combo = 0;            // CHALLENGE 2: a dropped fruit or a caught bomb breaks the combo
this.lives = this.lives - 1;
```

The floating score is a text that tweens up and fades, then destroys itself:

```ts
this.tweens.add({
  targets: text,
  y: y - 80,
  alpha: 0,
  duration: 700,
  onComplete: () => {
    text.destroy();
  },
});
```

**Look for:**
- the reset in **one** place, reached by every way of missing - students who reset in both
  `catchBomb` and the drop code often forget one
- `this.combo = 0` in `init()` as well (the restart trap again)
- `text.destroy()` in `onComplete`: without it, every caught fruit leaves an invisible text behind
- reading `fruit.x` / `fruit.y` **before** `fruit.destroy()`. (A destroyed Phaser object still has
  its last `x` and `y`, so reading them after works too - but it is a bad habit.)

Tested with the harness: three fruit caught in a row scored 10 + 20 + 30 = 60, a caught bomb set the
combo to 0, and the next fruit scored 10.

---

## 3. Zig-zag enemies

**Project:** [solutions/ch14_challenge_3_zig_zag](solutions/ch14_challenge_3_zig_zag/)
(from `ch14_shooter_intermediate`)

**Goal:** a new wave pattern, combining a velocity with a repeating tween; a difficulty ramp.

The zig-zag is a yoyo tween on `x` that repeats for ever, while the velocity carries the ship down:

`src/objects/Enemy.ts`
```ts
public zigZag(width: number, time: number): void {
  this.scene.tweens.add({
    targets: this,
    x: { from: this.x - width / 2, to: this.x + width / 2 },
    duration: time,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1,
  });
}
```

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 3: three patterns in turn - row, stream, zig-zag, row, ...
const pattern = this.wave % 3;
if (pattern === 1) {
  this.rowWave(size, ROW_SPEED + extraSpeed);
} else if (pattern === 2) {
  this.streamWave(size, STREAM_SPEED + extraSpeed);
} else {
  this.zigZagWave(size, ZIGZAG_SPEED + extraSpeed);
}
```

```ts
const width = Math.min(ZIGZAG_WIDTH + this.wave * ZIGZAG_WIDTH_PER_WAVE, ZIGZAG_MAX_WIDTH);
const time = Math.max(ZIGZAG_TIME - this.wave * ZIGZAG_TIME_PER_WAVE, ZIGZAG_MIN_TIME);
```

"Wilder" is wider (up to a limit) and quicker (down to a limit). `Math.min` and `Math.max` are the
limits - without them, wave 30 would be unplayable.

The important point to draw out: `Enemy.kill()` already calls `killTweensOf(this)`, so the endless
zig-zag tween is stopped when the ship is shot down or leaves - and the pool hands out a clean ship
next time. Tested with the harness: a zig-zag wave (wave 3), then the row wave that followed reused
the same enemy objects, and every one of them had 0 tweens and flew in a straight row.

**Look for:**
- ships spawned far enough from the edges for the whole sway to stay on screen
- an answer that sways with `Math.sin(time)` in a `preUpdate()` is also good - check that it stores
  the ship's starting x and resets it in `spawn()`, because a pooled enemy keeps its fields
- a `repeat: -1` tween **without** `killTweensOf` in `kill()` - the classic pooled-object bug. Ask
  what the next row wave looks like

---

## 4. Shield power-up

**Project:** [solutions/ch14_challenge_4_shield](solutions/ch14_challenge_4_shield/)
(from `ch14_shooter_advanced`)

**Goal:** extend a union type and follow the compiler to every place that must change; a picture
made in code; a new rule for being hit.

Adding `"shield"` to `PowerUpKind` and nothing else gives exactly the two errors the hint promises:

```
TS2741 [ERROR]: Property 'shield' is missing in type '{ spread: string; rapid: string; life: string; }' but required in type 'Record<PowerUpKind, string>'.
const TEXTURES: Record<PowerUpKind, string> = {
      ~~~~~~~~

TS2345 [ERROR]: Argument of type '"spread" | "rapid" | "shield"' is not assignable to parameter of type 'WeaponPowerUp'.
  Type '"shield"' is not assignable to type 'WeaponPowerUp'.
      this.ship.powerUp(powerUp.kind, this.time.now);
                        ~~~~~~~~~~~~
```

The first needs a picture, which `PreloadScene` draws with `Graphics` (a blue orb for the pickup, and
a see-through bubble for the ship). The second needs a new branch in `collect()`:

`src/scenes/GameScene.ts`
```ts
} else if (powerUp.kind === "shield") {
  this.ship.giveShield();       // CHALLENGE 4
} else {
```

The ship owns its bubble, and keeps it in place in a new `preUpdate()`:

`src/objects/PlayerShip.ts`
```ts
preUpdate(_time: number, _delta: number): void {
  this.bubble.setPosition(this.x, this.y);
}
```

and `shipHit()` checks the shield first:

`src/scenes/GameScene.ts`
```ts
if (this.ship.hasShield()) {
  this.ship.popShield();
  this.sound.play(HIT_SOUND);
  this.ship.makeInvulnerable();
  return;
}
```

The shield never wears off, so it is a `boolean`, not an "until" time like spread and rapid. The
HUD needed no new code: `describeWeapon()` adds `"SHIELD"`, and the existing `WEAPON_CHANGED` event
carries it. The menu legend gained a fourth entry.

**Look for:**
- the `KINDS` array updated too (the compiler does **not** catch this one - without it, shields never
  drop). A good question for the class: why can the compiler check the `Record` but not the array?
- the moment of safety after the shield pops - without it, two bullets arriving together take the
  shield *and* a life
- the bubble drawn above the ship (made after it), and hidden when the shield pops

Tested with the harness: a shield power-up collected (HUD showed SHIELD, bubble visible), an enemy
bullet popped it with lives still 3, a second bullet two seconds later cost a life.

---

## 5. Smart bomb

**Project:** [solutions/ch14_challenge_5_smart_bomb](solutions/ch14_challenge_5_smart_bomb/)
(from `ch14_shooter_advanced`)

**Goal:** act on every live member of a pool; keep the wave count correct; add a HUD value through
the event system.

`src/scenes/GameScene.ts`
```ts
private useBomb(): void {
  if (this.bombs === 0 || this.phase === "over") {
    return;
  }
  this.bombs = this.bombs - 1;
  this.events.emit(BOMBS_CHANGED, this.bombs);
  this.cameras.main.flash(BOMB_FLASH_TIME);

  const { width, height } = this.scale;
  for (const enemy of this.enemies.getMatching("active", true) as Enemy[]) {
    if (enemy.x >= 0 && enemy.x <= width && enemy.y >= 0 && enemy.y <= height) {
      this.explode(enemy.x, enemy.y);
      enemy.kill();
      this.addScore(ENEMY_POINTS);
      this.enemyGone();
    }
  }
  for (const bullet of this.enemyBullets.getMatching("active", true) as EnemyBullet[]) {
    bullet.kill();
  }
  if (this.phase === "boss" && this.boss.active) {
    this.boss.weaken(BOMB_BOSS_DAMAGE);
    this.events.emit(BOSS_HEALTH_CHANGED, this.boss.getHealth(), this.boss.getMaxHealth());
  }
}
```

The two traps the hint points at:

- **"on screen"** - `getMatching("active", true)` also returns ships that are active but waiting off
  the edge: a row wave's ships above the top, a swoop's ships queued at the start of the path. They
  should not explode
- **`enemiesLeft`** - every destroyed ship goes through `enemyGone()`, exactly as a shot-down ship
  does, so the count stays right and the next wave starts exactly once. The tempting shortcut,
  `this.enemiesLeft = 0`, is wrong: in a stream wave the ships still to come would then count it
  below zero, and the wave would never end

The boss "loses a chunk but survives" through a new `Boss.weaken()`, which never takes the last
point of health. The HUD shows the bombs through a new `BOMBS_CHANGED` event, and `HudData` gained a
`bombs` field for the starting value.

**Look for:**
- the new listener removed in the HUD's `SHUTDOWN` handler, like the others
- `bombs` reset in `init()`
- `keyboard.on("keydown-B")`, not `once` - it is used up to three times

Tested with the harness: in a stream wave with 2 of 6 ships on screen, B destroyed those 2
(`enemiesLeft` 6 to 4) and the wave still ended when the other 4 had gone; pressed while a swoop's
ships were still off screen, it destroyed none; against a 30-health boss it took off 10 and the boss
lived; a fourth press did nothing.

---

## 6. Second player

**Project:** [solutions/ch14_challenge_6_second_player](solutions/ch14_challenge_6_second_player/)
(from `ch14_shooter_intermediate`)

**Goal:** turn "the player" into data the scene loops over; share a pool between two owners.

Everything that belongs to one player goes in one object:

`src/scenes/GameScene.ts`
```ts
interface Player {
  name: string;
  ship: PlayerShip;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  fire: Phaser.Input.Keyboard.Key;
  score: number;
  lives: number;
  hudText: Phaser.GameObjects.Text;
}
```

and the old one-player code runs once per player still in the game:

```ts
for (const player of this.livingPlayers()) {
  if (player.left.isDown) {
    player.ship.move(-1);
  } else if (player.right.isDown) {
    player.ship.move(1);
  } else {
    player.ship.move(0);
  }
```

`PlayerShip` does not change at all - it never knew its keys, which is the point of the hint.

Both ships share the bullet pool (made twice as big). A bullet remembers who fired it:

`src/objects/Bullet.ts`
```ts
public fire(x: number, y: number, owner: number): void {
  this.owner = owner;
  this.enableBody(true, x, y, true, true);
```

`src/scenes/GameScene.ts`
```ts
const shooter = this.players[bullet.owner];   // CHALLENGE 6: read before kill(), to be clear
```

The stream wave aims at a random living player (`Phaser.Utils.Array.GetRandom(living)`). Each ship
has its own overlap with the enemies, so the callback knows which player was hit. A player with no
lives has their ship switched off with `disableBody(true, true)`; when `livingPlayers()` is empty, the
game ends, and `GameOverScene` gets `scores: number[]` and says who won (or that it was a draw).

**Look for:**
- no duplicated "player 2" copies of methods - a loop, or a method taking a `Player`
- the owner set on **every** fire: a pooled bullet keeps its last owner otherwise, and the wrong player
  scores
- the stream wave not aiming at a player who is out
- a second `PlayerShip` class for player 2, or `if (player === 2)` inside `PlayerShip`, both miss the
  point of the hint - worth discussing

Tested with the harness: both ships moved on their own keys; bullets fired as player 2 scored for
player 2; player 2 knocked out (ship gone, HUD "OUT") while player 1 played on; the next stream
wave dropped all five ships above player 1; when player 1 was out too, the game over screen said
"Player 2 wins!".
