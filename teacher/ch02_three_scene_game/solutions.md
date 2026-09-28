# Chapter 2 - A three-scene game: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. Restyle

**Project:** [solutions/ch02_challenge_1_restyle](solutions/ch02_challenge_1_restyle/)
(from `ch02_click_the_ball`)

**Goal:** find where each thing is decided - the picture, the speed, the words - and change it.

`src/objects/Ball.ts`
```ts
export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball_blue.png";
```

`src/scenes/PlayScene.ts`
```ts
const BALL_SPEED = 520;
```

plus new wording and colours in `StartScene.create()` and `WinScene.create()`, and
`ball_blue.png` copied from `assets/images/` into the project's `public/assets/images/`.

**Look for:** the file copied into `public/` (the most common failure: the path is right but the
file is not there, and Phaser shows a green-and-black "missing texture" square). Changing
`BALL_FILE` but keeping the key `"ball"` is fine - the key is just a name.

---

## 2. Enter works too

**Project:** [solutions/ch02_challenge_2_enter_works_too](solutions/ch02_challenge_2_enter_works_too/)
(from `ch02_click_the_ball`)

**Goal:** two listeners, one action - and no duplicated code.

`src/scenes/StartScene.ts` (and the same pattern in `WinScene.ts`)
```ts
this.input.keyboard!.once("keydown-SPACE", () => {
  this.next();
});
this.input.keyboard!.once("keydown-ENTER", () => {
  this.next();
});
}

private next(): void {
  this.scene.start(PLAY_SCENE);
}
```

**Look for:** the action in one method rather than written twice; the on-screen messages updated
to match. Some students look for a single event for "SPACE or ENTER" - there is not one, and two
listeners is the normal answer. A student who uses `this.input.keyboard!.on("keydown", (event) => ...)`
and checks `event.code` has found a valid alternative.

---

## 3. Give up

**Project:** [solutions/ch02_challenge_3_give_up](solutions/ch02_challenge_3_give_up/)
(from `ch02_click_the_ball`)

**Goal:** a new way out of a scene, and confidence that restarting a scene rebuilds it.

`src/scenes/PlayScene.ts`
```ts
this.input.keyboard!.once("keydown-ESC", () => {
  this.scene.start(START_SCENE);
});
```

The start scene "works exactly as it did the first time" because its `create()` runs again, making
fresh text and a fresh SPACE listener. Nothing needs resetting: `StartScene` has no fields.

**Look for:** the import of `START_SCENE`. Tested with the harness: SPACE, ESC, SPACE goes
Start -> Play -> Start -> Play.

---

## 4. Too slow!

**Project:** [solutions/ch02_challenge_4_too_slow](solutions/ch02_challenge_4_too_slow/)
(from `ch02_click_the_ball`)

**Goal:** a timer event, and a scene that shows two different outcomes from its data.

`src/scenes/PlayScene.ts`
```ts
const TIME_LIMIT = 5000;
...
this.time.delayedCall(TIME_LIMIT, () => {
  this.lose();
});
...
private win(): void {
  const seconds = (this.time.now - this.startTime) / 1000;
  const data: WinData = { won: true, seconds: seconds };
  this.scene.start(WIN_SCENE, data);
}

private lose(): void {
  const data: WinData = { won: false, seconds: TIME_LIMIT / 1000 };
  this.scene.start(WIN_SCENE, data);
}
```

`src/scenes/WinScene.ts`
```ts
export interface WinData {
  won: boolean;
  seconds: number;
}
...
const heading = this.won ? "You got it!" : "Too slow!";
const detail = this.won ? `in ${this.seconds.toFixed(2)} seconds` : `You had ${this.seconds} seconds`;
```

The timer belongs to the play scene's clock, so when the player wins and the scene shuts down, the
timer is thrown away with it - it can never fire after a win. Worth asking students *why* it does
not.

**Look for:** adding `won` to the interface - the compiler then insists both `win()` and `lose()`
say which it is. Checking elapsed time in `update()` instead of `delayedCall` also works; accept it,
but point out the timer is simpler and cannot be forgotten.

---

## 5. The decoy

**Project:** [solutions/ch02_challenge_5_the_decoy](solutions/ch02_challenge_5_the_decoy/)
(from `ch02_click_the_ball_plus`)

**Goal:** reuse a class with a parameter; understand how the "missed everything" listener sees the
world.

`src/objects/Ball.ts`
```ts
export const DECOY_KEY = "decoy";
export const DECOY_FILE = "assets/images/ball_blue.png";
...
constructor(scene: Phaser.Scene, x: number, y: number, speedX: number, speedY: number, key: string = BALL_KEY) {
  super(scene, x, y, key);
```

`src/scenes/PlayScene.ts`
```ts
const decoy = new Ball(this, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500),
  Math.cos(decoyAngle) * DECOY_SPEED, Math.sin(decoyAngle) * DECOY_SPEED, DECOY_KEY);
decoy.setInteractive({ useHandCursor: true });
decoy.on("pointerdown", () => {
  for (let i = 0; i < DECOY_MISSES; i++) {
    this.miss();
  }
});
```

The decoy is interactive, so a click on it puts it in the `over` list - the scene-wide listener
does **not** count it as a miss, and the decoy's own listener counts two. Tested with the harness:
decoy, ball, empty space gives 1 hit and 3 misses.

**Look for:**
- a **default parameter** (`key: string = BALL_KEY`) so the existing call still works - or a new
  subclass `Decoy extends Ball`, which is also a good answer
- the blue picture loaded in `StartScene`
- a common wrong answer: making the decoy *not* interactive and relying on the "missed everything"
  listener - that counts it as **one** miss, not two

---

## 6. Top five

**Project:** [solutions/ch02_challenge_6_top_five](solutions/ch02_challenge_6_top_five/)
(from `ch02_click_the_ball_plus`)

**Goal:** keep a structured value (an array) in the registry; basic array work.

`src/scenes/WinScene.ts`
```ts
const times: number[] = this.registry.get(BEST_TIMES) ?? [];
times.push(total);
times.sort((a, b) => a - b);
const top = times.slice(0, TABLE_SIZE);
this.registry.set(BEST_TIMES, top);

const place = top.indexOf(total) + 1;
```

`src/scenes/StartScene.ts`
```ts
const times: number[] = this.registry.get(BEST_TIMES) ?? [];
let table = "BEST TIMES\n";
if (times.length === 0) {
  table = table + "none yet";
}
times.forEach((time, index) => {
  table = table + `${index + 1}.  ${time.toFixed(2)} s\n`;
});
```

- `??` is the **nullish coalescing** operator: "this, unless it is `null` or `undefined`, in which case
  that"
- `sort()` on its own sorts numbers **as text** (so 10 comes before 9) - hence the compare function.
  This catches out nearly everyone; a great discussion point
- `indexOf` gives `-1` when the value is not there, so `place` is `0` when the time missed the table

**Look for:** the compare function in `sort`; `slice` so the table never grows past five; a sensible
message when the time does not make the table. Sharp students notice `indexOf(total)` finds the
*first* equal time if two totals tie exactly - fine to accept.
