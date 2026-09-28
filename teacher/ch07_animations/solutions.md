# Chapter 7 - Animations: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. Different speeds

**Project:** [solutions/ch07_challenge_1_different_speeds](solutions/ch07_challenge_1_different_speeds/)
(from `ch07_animation_lab`)

**Goal:** find where an animation's speed is decided, and see that a new animation needs no new art.

`src/scenes/PreloadScene.ts`
```ts
this.anims.create({
  key: BAT_FLAP,
  frames: this.anims.generateFrameNumbers(BAT_SHEET, { start: 0, end: 3 }),
  frameRate: 24,                   // CHALLENGE 1: twice as fast (was 12)
  repeat: -1,
});
...
// CHALLENGE 1: the same frames as hero-run, faster - a new animation needs no new pictures
this.anims.create({
  key: HERO_SPRINT,
  frames: this.anims.generateFrameNumbers(HERO_SHEET, { start: 2, end: 7 }),
  frameRate: 20,
  repeat: -1,
});
```

`src/scenes/LabScene.ts`
```ts
keyboard.on("keydown-SEVEN", () => this.hero.play(HERO_SPRINT)); // CHALLENGE 1
```

plus the ghost's `frameRate: 2`, the new `HERO_SPRINT` key in `assets.ts`, the two labels, the help
line and `index.html`.

**Look for:** the new key added to `assets.ts` as a constant, not typed as a string in two places.
Changing the frame rate *where the animation is made* rather than setting `timeScale` on the sprite -
both work, but only one changes the animation for every sprite that plays it. Tested with the
harness: key 7 plays `hero-sprint` at 20 fps; `game.anims.get("bat-flap").frameRate` is 24.

---

## 2. Coin run

**Project:** [solutions/ch07_challenge_2_coin_run](solutions/ch07_challenge_2_coin_run/)
(from `ch07_hero_animations`)

**Goal:** load a second sprite sheet and animation; a simple distance test; a tween that cleans up
after itself.

`coin_spin.png` is copied into `public/assets/spritesheets/`, loaded in `PreloadScene`, and given a
looping `coin-spin` animation there. The scene makes the coins:

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 2: a row of spinning coins, alternately low and high
COIN_XS.forEach((x, i) => {
  const y = i % 2 === 0 ? COIN_LOW_Y : COIN_HIGH_Y;
  const coin = this.add.sprite(x, y, COIN_SHEET).setScale(COIN_SCALE);
  coin.play(COIN_SPIN);
  this.coins.push(coin);
});
```

and checks them every frame, measuring from the middle of the hero's body (its `y` is its feet):

```ts
private checkCoins(): void {
  const heroMiddleY = this.hero.y - this.hero.displayHeight / 2;
  for (const coin of [...this.coins]) {          // a copy: collect() removes coins from the list
    const distance = Phaser.Math.Distance.Between(this.hero.x, heroMiddleY, coin.x, coin.y);
    if (distance < PICKUP_DISTANCE) {
      this.collect(coin);
    }
  }
}

private collect(coin: Phaser.GameObjects.Sprite): void {
  this.coins = this.coins.filter((c) => c !== coin);
  this.collected = this.collected + 1;
  this.coinText.setText(`Coins: ${this.collected} / ${COIN_XS.length}`);

  this.tweens.add({
    targets: coin,
    y: coin.y - 80,
    alpha: 0,
    scale: COIN_SCALE * 1.5,
    duration: 500,
    ease: "Quad.easeOut",
    onComplete: () => {
      coin.destroy();
    },
  });
}
```

**Look for:**
- the coin taken **out of the list at once**, before its tween. The most common bug is to destroy it
  only in `onComplete` while it is still in the list: the next frames count it again, and one coin
  scores ten or twenty times
- `destroy()` in `onComplete` (or the faded coins stay in the scene)
- `init()` resetting the list and the count, in case the scene is restarted (Chapter 2's trap)
- measuring from the hero's `y` (its feet) without noticing - it half works, which makes it hard to
  spot. A good moment to revisit origins from Chapter 1

Tested with the harness: running along the ground collects the low coins; jumping collects the high
ones; the count matches.

---

## 3. Title sequence

**Project:** [solutions/ch07_challenge_3_title_sequence](solutions/ch07_challenge_3_title_sequence/)
(from `ch07_tweens_and_particles`)

**Goal:** a `tweens.chain` of several steps, and making it safe to restart.

`src/scenes/PlaygroundScene.ts`
```ts
private playTitle(): void {
  this.tweens.killTweensOf(this.title);
  this.title.setPosition(TITLE_X, TITLE_START_Y).setScale(1).setAngle(0).setAlpha(1);

  this.tweens.chain({
    targets: this.title,
    tweens: [
      { y: TITLE_Y, duration: 1000, ease: "Bounce.easeOut" },
      { scale: 1.3, duration: 200, ease: "Quad.easeOut", yoyo: true },
      { angle: { from: -6, to: 6 }, duration: 100, yoyo: true, repeat: 3 },
      { angle: 0, duration: 60 },
      { alpha: 0, delay: 800, duration: 500 },        // delay: hold still, then fade
    ],
  });
  this.show("T: a chain of five tweens on the title");
}
```

The title is made once in `create()`, above the top of the screen, and T calls `playTitle()`.

- `{ from, to }` sets the start value as well as the end: the wobble starts at -6 degrees
  wherever the angle was
- `delay` on the last tween is the "hold for a moment"; a `hold` on the tween before would also work
- `killTweensOf` stops the chain as well as single tweens

**Look for:** the reset before the chain - without it, a second T part way through starts from
wherever the title had got to (half faded, or tilted). Accept `onComplete` callbacks nested inside
each other, but show the chain as the tidier answer. Tested with the harness: T, then T again after
half a second, leaves exactly one tween running and the title lands at `y = 110`.

---

## 4. Sparkle trail

**Project:** [solutions/ch07_challenge_4_sparkle_trail](solutions/ch07_challenge_4_sparkle_trail/)
(from `ch07_tweens_and_particles`)

**Goal:** a flowing emitter, following something, turned on and off.

`src/scenes/PlaygroundScene.ts`
```ts
private addTrail(): void {
  this.trail = this.add.particles(0, 0, PARTICLE_KEY, {
    speed: { min: 5, max: 40 },
    lifespan: 600,
    scale: { start: 1.5, end: 0 },
    alpha: { start: 0.8, end: 0 },
    tint: [0xa8dadc, 0xffffff, 0xffd166],
    blendMode: "ADD",
    frequency: 15,           // a burst every 15 milliseconds...
    quantity: 2,             // ...of two particles
    emitting: false,         // not until the pointer is in the playground
  });
  this.trail.startFollow(this.input.activePointer);

  // only in the playground: stop over the buttons (and when the pointer leaves the game)
  this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    this.trail.emitting = pointer.x > PLAY_LEFT;
  });
  this.input.on("gameout", () => {
    this.trail.emitting = false;
  });
}
```

- the explosion emitter uses `emitting: false` + `explode()`; this one **flows** (`frequency`,
  `quantity`) and is switched with `emitting`
- `startFollow` takes anything with an `x` and a `y` - the pointer, a sprite, a plain object
- particles already alive carry on when `emitting` goes false, so the trail fades out rather than
  vanishing

**Look for:** one emitter, made once. A common wrong answer calls `this.add.particles(...)` inside
`pointermove`, making a new emitter dozens of times a second - it works for a minute, then the game
slows to a crawl. Another is `emitter.stop()`/`start()` every move; it works, but `emitting` says
what is meant. Tested with the harness: moving across the playground gives 60+ live particles;
moving onto the buttons sets `emitting` to false and they are all gone within a second.

---

## 5. Speed you can see

**Project:** [solutions/ch07_challenge_5_speed_you_can_see](solutions/ch07_challenge_5_speed_you_can_see/)
(from `ch07_hero_animations`)

**Goal:** acceleration with `delta`, and an animation's playback speed driven by the game.

`src/objects/Hero.ts`
```ts
private readKeys(seconds: number): void {
  let direction = 0;
  if (this.cursors.left.isDown) {
    direction = -1;
  } else if (this.cursors.right.isDown) {
    direction = 1;
  }

  if (direction !== 0) {
    // pushing against the way the hero is going: brake AND accelerate, for a quick turn
    const turning = this.velocityX * direction < 0;
    const rate = turning ? ACCELERATION + DECELERATION : ACCELERATION;
    this.velocityX = Phaser.Math.Clamp(this.velocityX + direction * rate * seconds, -RUN_SPEED, RUN_SPEED);
  } else {
    // slow down towards 0 - and stop exactly AT 0, not just past it
    const slowBy = DECELERATION * seconds;
    if (Math.abs(this.velocityX) <= slowBy) {
      this.velocityX = 0;
    } else {
      this.velocityX = this.velocityX - Math.sign(this.velocityX) * slowBy;
    }
  }
  ...
```

```ts
private matchStrideToSpeed(): void {
  if (this.currentState === "run") {
    this.anims.timeScale = Math.max(MIN_TIME_SCALE, Math.abs(this.velocityX) / RUN_SPEED);
  } else {
    this.anims.timeScale = 1;
  }
}
```

`matchStrideToSpeed()` is called at the end of `preUpdate()`. The state machine did not change: the
hero is `"run"` while `velocityX` is not 0, and `"idle"` when it is.

**Look for:**
- slowing down that **snaps to exactly 0**. Without it the speed wobbles either side of zero for
  ever (-0.3, 0.2, -0.1...), the hero never becomes idle, and it twitches left and right as the flip
  follows the sign
- `timeScale` put back to 1 in other states - otherwise the next animation keeps the last run speed
  (a jump after a slow start plays slowly)
- a minimum `timeScale`: at a speed of 2 pixels a second, a `timeScale` of 0.008 looks frozen
- `delta` used for both acceleration and deceleration

Tested with the harness: holding RIGHT, the speed goes 50, 140, 260 with `timeScale` 0.30, 0.54,
1.00; after letting go the hero is still `run` at 170, then `idle` at 0.

---

## 6. Stomp

**Project:** [solutions/ch07_challenge_6_stomp](solutions/ch07_challenge_6_stomp/)
(from `ch07_hero_animations`)

**Goal:** bring the chapter together - a second animated class, animation events, particles - and
keep the state machine in charge of the hero.

A new `Slime` class (`src/objects/Slime.ts`) is a `Sprite` that patrols between two x positions in
its own `preUpdate()` - calling `super.preUpdate()`. `PreloadScene` loads `slime.png`,
`explosion.png` and `particle.png` and makes `slime-walk` and `explode`. `Hero` gains three things
the scene can ask for:

`src/objects/Hero.ts`
```ts
// CHALLENGE 6: true while coming down from a jump - the only time a slime can be stomped
public isFalling(): boolean {
  return this.currentState === "fall";
}

// CHALLENGE 6: called by the scene after a stomp - spring back up off the slime
public bounceOff(): void {
  this.velocityY = -STOMP_BOUNCE;
  this.changeState("jump");
}
```

and `hurt(fromX?: number)`, which knocks the hero away from where the hurt came from. The scene
decides what a touch means:

`src/scenes/GameScene.ts`
```ts
private checkSlimes(): void {
  const heroBounds = this.hero.getBounds();
  for (const slime of [...this.slimes]) {         // a copy: squash() removes slimes from the list
    if (!Phaser.Geom.Intersects.RectangleToRectangle(heroBounds, slime.getBounds())) {
      continue;
    }
    if (this.hero.isFalling()) {
      this.squash(slime);
      this.hero.bounceOff();
    } else {
      this.hero.hurt(slime.x);                     // does nothing if already hurt
    }
  }
}

private squash(slime: Slime): void {
  this.slimes = this.slimes.filter((s) => s !== slime);
  const centreY = slime.y - slime.displayHeight / 2;

  const boom = this.add.sprite(slime.x, centreY, EXPLOSION_SHEET);
  boom.play(EXPLODE);
  boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
    boom.destroy();
  });
  this.sparks.explode(SPARKS, slime.x, centreY);

  slime.destroy();
  this.showSlimesLeft();
}
```

- "cannot be hurt again until the hurt state is over" comes free: `hurt()` already returns at once
  if the hero is hurt
- `isFalling()` is `"fall"`, not "`velocityY > 0`": a hero knocked into the air by a hurt is falling
  too, but should not stomp
- `bounceOff()` goes through `changeState`, so the jump animation plays and the state machine stays
  the only thing that changes the hero's state

**Look for:**
- the scene **asking** the hero (`isFalling()`) and **telling** it (`bounceOff()`, `hurt()`), not
  setting `hero.velocityY` - the fields are private, so a student who tries gets
  `Property 'velocityY' is private and only accessible within class 'Hero'`. Some will make the
  fields public to get round it; this is the moment to talk about why not
- a separate `Slime` class, rather than slime movement written into the scene's `update()`
- the explosion sprite destroying itself, and one emitter reused for every squash
- the slime list copied before looping (`[...this.slimes]`), because squashing removes from it

Tested with the harness: dropping the hero onto a slime removes it, bounces the hero into `jump`, and
shows "Slimes left: 2"; walking into a slime gives `hurt` with the knockback away from it. With the
keys, running left and jumping after 0.1 seconds lands on the first slime.
