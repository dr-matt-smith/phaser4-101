---
marp: true
theme: default
paginate: true
title: "Chapter 8 - Collisions"
---

# Chapter 8
## Collisions

When this touches that

![bg right:45% 90%](../../chapters/ch08_collisions/images/breakout_playing.png)

---

## Today

- collisions **by hand**: `Phaser.Geom` shapes and `Intersects` tests
- why rectangles are **unfair** to round things
- **Arcade Physics**: bodies, and `debug` to see them
- fitting a body to its picture
- `collider` or `overlap`? Groups against groups
- process callbacks, and switching collisions off
- a complete **breakout**

---

## Shapes made of numbers

![w:880](../../chapters/ch08_collisions/images/rect_and_circle_tests.svg)

`Phaser.Geom.Rectangle`, `Circle`, `Triangle`... - never drawn.
`Phaser.Geom.Intersects.RectangleToRectangle(a, b)`, `CircleToCircle`, `CircleToRectangle`

---

## Which test?

```ts
if (a instanceof Phaser.GameObjects.Arc && b instanceof Phaser.GameObjects.Arc) {
  return intersects.CircleToCircle(circleOf(a), circleOf(b));
}
if (a instanceof Phaser.GameObjects.Arc) {
  return intersects.CircleToRectangle(circleOf(a), b.getBounds());
}
if (b instanceof Phaser.GameObjects.Arc) {
  return intersects.CircleToRectangle(circleOf(b), a.getBounds());
}
return intersects.RectangleToRectangle(a.getBounds(), b.getBounds());
```

- `getBounds()` - any game object's **bounding box**
- `instanceof` **narrows** the type: `a.radius` is allowed inside the `if`
- every pair, once: `for (j = i + 1 ...)` - 6 shapes, 15 pairs; 100 shapes, 4,950

---

## Unfair corners

![w:520](../../chapters/ch08_collisions/images/shapes_boxes.png) ![w:520](../../chapters/ch08_collisions/images/unfair_corners.svg)

Round things: test **circles**. Boxy things: rectangles are exact.

---

## Clicking a circle

```ts
circle.setInteractive({
  hitArea: new Phaser.Geom.Circle(radius, radius, radius),
  hitAreaCallback: Phaser.Geom.Circle.Contains,
  draggable: true,
  useHandCursor: true,
});
```

- default hit area: the **rectangle** - a click in the corner picks it up
- hit area coordinates: `(0, 0)` is the **top-left**, so the centre is `(radius, radius)`
- `Contains(shape, x, y)` - on every `Phaser.Geom` class

---

## Try it: Hand-made Collisions

- build, serve, drag the shapes together
- press SPACE: bounding boxes only. Find a "hit" that is not a hit
- click just outside a circle, diagonally. Does it move?

![bg right:45% 90%](../../chapters/ch08_collisions/images/shapes_real.png)

---

## Arcade Physics

```ts
// main.ts
physics: {
  default: "arcade",
  arcade: {
    debug: false,     // true: draw every body
  },
},
```

```ts
this.physics.add.image(x, y, key);       // a new Image, with a body
this.physics.add.sprite(x, y, key);      // a new Sprite, with a body
this.physics.add.existing(gameObject);   // a body for an object you have
```

---

## Bodies - and seeing them

![bg right:50% 95%](../../chapters/ch08_collisions/images/collect_debug.png)

```ts
export class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);
```

- move with **velocity**: `this.setVelocity(speedX, speedY)`
- pink: dynamic bodies; blue: static

---

## Fitting the body

![w:700](../../chapters/ch08_collisions/images/body_size_offset.svg)

```ts
star.setCircle(12, 4, 5);   // radius, then offset from the top-left
```

---

## Collider or overlap?

![w:1000](../../chapters/ch08_collisions/images/collider_vs_overlap.svg)

**Should these two push each other apart?**

---

## All the collisions - set up once, in `create()`

```ts
this.physics.add.collider(this.player, this.crates);
this.physics.add.collider(this.enemies, this.crates);
this.physics.add.collider(this.enemies, this.enemies);   // a group against itself

this.physics.add.overlap(this.player, this.stars, (_player, star) => {
  this.collectStar(star as Phaser.Physics.Arcade.Sprite);
});
this.enemyOverlap = this.physics.add.overlap(this.player, this.enemies, () => {
  this.hurtPlayer();
});
```

No collision code in `update()` at all

---

## Groups

```ts
this.crates = this.physics.add.staticGroup();      // never move
...
this.enemies = this.physics.add.group({             // dynamic
  bounceX: 1,
  bounceY: 1,
  collideWorldBounds: true,
});
...
const crate = this.crates.create(x, y, CRATE_KEY) as Phaser.Physics.Arcade.Sprite;
crate.setScale(CRATE_SCALE);
crate.refreshBody();   // a static body does not follow its game object
```

---

## Callbacks, casts, and switching off

`TS2339: Property 'disableBody' does not exist on type 'Body | StaticBody | Tile | GameObjectWithBody'`
-> `star as Phaser.Physics.Arcade.Sprite`

```ts
star.disableBody(true, true);                         // body off, hidden
...
star.enableBody(true, spot.x, spot.y, true, true);    // back, somewhere else
...
this.enemyOverlap.active = false;   // stop checking for a while
...
this.enemyOverlap.active = true;    // ...and start again
```

An overlap fires **every frame** they touch

---

## Try it: Collect and Avoid

- arrow keys; stars in, triangles out
- set `debug: true` in `main.ts`, rebuild
- replace the stars' overlap with
  `this.physics.add.collider(this.player, this.stars)`. What happens?

![bg right:45% 90%](../../chapters/ch08_collisions/images/collect_playing.png)

---

## Try it: Breakout

- paddle: dynamic, **immovable**
- ball: `setCircle`, `setBounce(1)`, world bounds
- bricks: a **static group**, destroyed when hit

```ts
// no bottom edge: the ball falls out
this.physics.world.setBoundsCollision(true, true, true, false);
```

![bg right:40% 90%](../../chapters/ch08_collisions/images/breakout_debug.png)

---

## A process callback

```ts
this.physics.add.collider(
  this.ball,
  this.paddle,
  () => {
    this.ball.bounceOff(this.paddle);
    this.sound.play(PADDLE_SOUND);
  },
  () => {
    return this.ball.isFalling();   // false: no collision at all
  },
);
```

Runs **first**. Only exactly `false` cancels - forget the `return` and everything collides

---

## Aiming the ball

![w:620](../../chapters/ch08_collisions/images/paddle_angle.svg)

```ts
const where = Phaser.Math.Clamp((this.x - paddle.x) / halfWidth, -1, 1);
this.setDirection(where * MAX_BOUNCE_ANGLE);
```

---

## Summary

- `Phaser.Geom` + `Intersects`; `getBounds()`; circles for round things
- physics config; `this.physics.add.image / sprite / existing`; `debug`
- `setSize` + `setOffset`, `setCircle` - from the **top-left**
- `collider` separates; `overlap` reports. Once, in `create()`
- `group` / `staticGroup`; `refreshBody()`; cast callback objects with `as`
- process callbacks; `collider.active`; `disableBody` / `enableBody`; `destroy()`

---

## Challenges

1. **Debug key** - D toggles debug drawing
2. **Hover highlight** - outline the shape under the pointer, fairly
3. **Tough bricks** - the top row takes two hits
4. **Wide paddle** - a falling power-up widens the paddle for 10 s
5. **Glass bricks** - smashed, but no bounce
6. **Fair triangles** - only a real touch of the triangle counts

Next: **Chapter 9 - 2D physics**
