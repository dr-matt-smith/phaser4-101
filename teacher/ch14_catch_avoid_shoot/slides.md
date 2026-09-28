---
marp: true
theme: default
paginate: true
title: "Chapter 14 - Catch, avoid and shoot"
---

# Chapter 14
## Catch, avoid and shoot

One genre, three games

![bg right:45% 90%](../../chapters/ch14_catch_avoid_shoot/images/advanced_swoop.png)

---

## Today

- a player on one line; spawning on a timer
- **object pools** - and the price of reuse
- waves: tweens, timers, a curved path
- fire rate, invulnerability, explosions, a starfield
- growing a game: levels as data, a boss, power-ups, a HUD scene

---

## The genre

- the player can do almost nothing - the game is in **what comes down the screen**
- **readable** threats: a bomb looks like a bomb
- **rising pressure**: easy, then harder and harder
- **fairness**: small hit boxes, a moment of safety, no point-blank shots

---

## Three versions

![w:1000](../../chapters/ch14_catch_avoid_shoot/images/three_versions.svg)

---

## Try it: Fruit Catcher

![bg right:45% 90%](../../chapters/ch14_catch_avoid_shoot/images/catcher_playing.png)

- build and play `ch14_catcher_simple`
- change `SPAWN_DELAY`, `BOMB_CHANCE`, `FALL_GRAVITY` - how does it feel?
- why does a fruit brushing the side not count?

---

## A timer, and things that fall

```ts
this.fruit = this.physics.add.group({ gravityY: FALL_GRAVITY });

this.spawnTimer = this.time.addEvent({
  delay: SPAWN_DELAY,
  loop: true,
  callback: () => {
    this.dropSomething();
  },
});

this.physics.add.overlap(this.basket, this.fruit, (_basket, fruit) => {
  this.catchFruit(fruit as Phaser.Physics.Arcade.Sprite);
});
```

`loop: true` - for ever; `repeat: n` - n + 1 times; `remove()` - stop

---

## Try it: Space Shooter

![bg right:45% 90%](../../chapters/ch14_catch_avoid_shoot/images/shooter_playing.png)

- hold SPACE: about 5 shots a second
- how many bullet **objects** does a minute of firing need?
- (we measured: **9**)

---

## Why pool?

- make + destroy hundreds of objects a minute -> the **garbage collector** -> stutter
- instead: make a few, **switch them off**, switch them on again

![w:900](../../chapters/ch14_catch_avoid_shoot/images/object_pool.svg)

---

## A pool in Phaser

```ts
this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE });

// firing
const bullet = this.bullets.get() as Bullet | null;
if (bullet === null) {
  return;
}
bullet.fire(this.ship.x, this.ship.y - MUZZLE_OFFSET);

// in Bullet
this.enableBody(true, x, y, true, true);   // on
this.disableBody(true, true);              // off
```

---

## Three switches

| Switch | Off means |
|---|---|
| `active` | no `preUpdate()`; free to the pool |
| `visible` | not drawn |
| `body.enable` | not moved, **overlaps nothing** |

`killAndHide` = the first two only.
**Demo:** an invisible bullet that still shoots down ships.

---

## The price of reuse

```ts
public kill(): void {
  this.scene.tweens.killTweensOf(this);
  this.disableBody(true, true);
}
```

- a reused object brings back **everything** you do not reset
- tweens, velocities, angles, tints, fields
- "only goes wrong the second time" = this

---

## Waves

![w:1000](../../chapters/ch14_catch_avoid_shoot/images/wave_patterns.svg)

- row: tweens with `delay: i * ROW_STAGGER`
- stream: `addEvent({ delay, repeat: size - 1, ... })`
- count the wave down: `enemiesLeft`, one `enemyGone()`

---

## Hit, flash, safe

```ts
this.scene.tweens.add({
  targets: this,
  alpha: 0.15,
  duration: FLASH_TIME,
  yoyo: true,
  repeat: INVULNERABLE_TIME / (FLASH_TIME * 2) - 1,
  onComplete: () => {
    this.setAlpha(1);
    this.invulnerable = false;
  },
});
```

+ a **process callback**: `() => !this.ship.isInvulnerable()`

---

## A parallax starfield

![w:1000](../../chapters/ch14_catch_avoid_shoot/images/parallax.svg)

`TileSprite` + `tilePositionY`; textures drawn with `Graphics` + `generateTexture`

---

## Try it: Space Shooter Deluxe

![bg right:45% 90%](../../chapters/ch14_catch_avoid_shoot/images/advanced_boss.png)

- three levels, a boss each
- enemies shoot back; power-ups
- HUD scene, music, high scores
- open `levels.ts` - make level 1 easier

---

## Levels as data, and a phase

```ts
export type WavePattern = "row" | "stream" | "swoop";

export interface WaveData {
  pattern: WavePattern;
  size: number;             // how many ships
  speed: number;            // pixels per second (swoop: ms)
}

type Phase = "waves" | "between" | "boss" | "over";
```

![w:700](../../chapters/ch14_catch_avoid_shoot/images/level_flow.svg)

---

## Along a curve

```ts
// WaveSpawner.swoop()
const path = new Phaser.Curves.Spline(points);
enemy?.followPath(path, duration, i * SWOOP_GAP);

// Enemy.followPath(): a tween moves pathProgress from 0 to 1
this.scene.tweens.add({
  targets: this,
  pathProgress: 1,
  duration: duration,
  delay: delay,
});

// Enemy.preUpdate(): every frame, go to that point on the curve
this.path.getPointAt(this.pathProgress, this.point);
this.setPosition(this.point.x, this.point.y);
```

A tween can move **any** number.

---

## Boss, power-ups, HUD

- boss: an entry tween, then `yoyo: true, repeat: -1`; a hit flash with
  `setTint(0xffffff).setTintMode(Phaser.TintModes.FILL)` (no `setTintFill` in Phaser 4)
- power-ups: "active until" **times**; `Record<PowerUpKind, string>`; narrowing in `collect()`
- HUD: `this.events.emit(SCORE_CHANGED, this.score)` - and `off()` on `SHUTDOWN`

![bg right:35% 90%](../../chapters/ch14_catch_avoid_shoot/images/advanced_game_over.png)

---

## Summary

- `time.addEvent` spawns; physics groups give members the same motion
- pool what you make **many of, often**: `classType`, `maxSize`, `get()`, `enableBody` / `disableBody`
- reset **everything** on reuse; `killAndHide` leaves the body on
- waves: staggered tweens, repeating timers, paths - counted down to zero
- fire rate and power-ups = stored times
- grow with data, phases, small classes, and a HUD that listens

---

## Challenges

1. **Pointer control** - the basket follows the mouse or a finger (catcher)
2. **Combo scoring** - 10, 20, 30... for fruit in a row (catcher)
3. **Zig-zag enemies** - a third wave pattern (intermediate)
4. **Shield power-up** - takes the next hit (advanced)
5. **Smart bomb** - B clears the screen, three a game (advanced)
6. **Second player** - A / D / W, two scores (intermediate)

Next: **Chapter 15 - Platformer**
