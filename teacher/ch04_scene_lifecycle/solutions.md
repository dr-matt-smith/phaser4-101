# Chapter 4 - The life of a scene: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. Count the frames drawn

**Project:** [solutions/ch04_challenge_1_count_the_frames](solutions/ch04_challenge_1_count_the_frames/)
(from `ch04_lifecycle_logger`)

**Goal:** listen for a scene event; see for yourself that a paused scene is drawn and a sleeping one
is not; and notice which scene can report on which.

`src/scenes/DemoScene.ts`
```ts
private onRender(): void {
  // CHALLENGE 1: RENDER happens once each time the scene is drawn - even while it is paused
  this.renders = this.renders + 1;
```

```ts
public getUpdates(): number {
  return this.updates;
}

public getRenders(): number {
  return this.renders;
}
```

`src/scenes/LogScene.ts`
```ts
// CHALLENGE 1: ask DemoScene for its counts
counts = `     updates: ${demo.getUpdates()}   renders: ${demo.getRenders()}`;
```

plus `this.renders = 0;` in `init()`, so a restart starts the count again.

Why not in `DemoScene`'s own text? Its text is changed in `update()` - and `update()` is exactly what
stops when the scene is paused. The count would freeze on screen even though it is still going up.
`LogScene` is always running, so it can show it.

Tested with the harness: after 1 second paused, updates stayed at 32 while renders went from 32 to
76; after putting the scene to sleep, both stopped (35 and 89, unchanged a second later).

**Look for:** the counter reset in `init()`; getters rather than making the fields public (both
work - the getters say "read only"); a correct answer to "which numbers stop" - paused: updates;
asleep: both. Students who put the count in `update()` (`renders++` there) have counted updates
twice, not renders - a good discussion point.

---

## 2. Thirty frames a second

**Project:** [solutions/ch04_challenge_2_thirty_fps](solutions/ch04_challenge_2_thirty_fps/)
(from `ch04_pause_and_hud`)

**Goal:** the `fps` config, and understanding what `actualFps` does and does not measure.

`src/main.ts`
```ts
fps: {
  target: 60,
  limit: 30,
},
```

`src/scenes/HudScene.ts`
```ts
override update(_time: number, delta: number): void {
  this.framesCounted = this.framesCounted + 1;
  this.timeCounted = this.timeCounted + delta;

  if (this.timeCounted >= 1000) {
    const fps = this.framesCounted * 1000 / this.timeCounted;
    this.fpsText.setText(`fps: ${fps.toFixed(1)}   (browser: ${this.game.loop.actualFps.toFixed(1)})`);
    this.framesCounted = 0;
    this.timeCounted = 0;
  }
}
```

With a limit, Phaser still receives every browser frame; it just skips calling the game step until
enough time has built up. `actualFps` counts every browser frame, so it stays near 60. The HUD's
`update()` runs once per real game step, so counting its calls gives the true rate. The HUD is a good
home for it because it keeps running while the game is paused.

Tested with the harness (the headless browser offers about 48 frames a second): the HUD showed
`fps: 26.5   (browser: 48.6)`. On a 60 Hz screen it shows 30. Holding the right arrow for a second
moved the player about the same distance with and without the limit.

**Look for:** the counter based on `delta`, or on `time` differences - both fine; resetting the
counters in `init()`. Many students will first display `actualFps`, see 60, and decide the limit
"does not work" - worth letting them find that, then asking what `actualFps` is counting.

---

## 3. How long was I away?

**Project:** [solutions/ch04_challenge_3_time_away](solutions/ch04_challenge_3_time_away/)
(from `ch04_pause_and_hud`)

**Goal:** a scene that runs while another is paused; passing data with `resume`; a listener on
`this.events` that must be removed.

`src/scenes/PauseScene.ts`
```ts
// CHALLENGE 3: this scene is running while the game is paused, so its update() does the counting
override update(_time: number, delta: number): void {
  this.pausedFor = this.pausedFor + delta;
  this.awayText.setText(`Paused for ${(this.pausedFor / 1000).toFixed(1)} s`);
}

// resume the game, and take this scene away
private carryOn(): void {
  // CHALLENGE 3: resume() can hand data to the scene it resumes - it arrives with the RESUME event
  const data: ResumeData = { pausedFor: this.pausedFor };
  this.scene.resume(GAME_SCENE, data);
  this.scene.stop();
}
```

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 3: hear about each resume, and the data PauseScene sends with it
this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
```

```ts
// CHALLENGE 3: listeners on this.events outlive a shutdown - without this, every restart
// would add another, and a pause would be counted twice, three times, ...
this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
```

```ts
// CHALLENGE 3: the RESUME event's listener is given the scene's Systems, then the data
private onResume(_sys: Phaser.Scenes.Systems, data: ResumeData): void {
  this.timePaused = this.timePaused + data.pausedFor;
  this.events.emit(PAUSED_CHANGED, this.timePaused / 1000);
}
```

and the HUD listens for `PAUSED_CHANGED` like the other three events (and removes that listener in
its `SHUTDOWN` handler too).

The "counted once" requirement is the point of the challenge: the `RESUME` listener is on
`GameScene`'s own `this.events`, which Phaser does not clear on shutdown. Tested with the harness:
two restarts, then a pause - the HUD showed one pause's worth of time, and
`listenerCount("resume")` was 1.

**Look for:** `pausedFor` reset in `init()` (the pause scene object is reused for every pause); the
`off` in `SHUTDOWN`. Other good answers: the pause scene writes the total into the registry, or emits
an event on `GameScene`'s emitter. A tempting wrong answer: read `this.time.now` in `GameScene` on
`PAUSE` and on `RESUME`, and subtract. It always gives 0 (checked with the harness) - the scene's
clock only updates its `now` when the scene steps, and `RESUME` arrives before the first step.
(`this.game.loop.time` would work.) A good puzzle to set the class.

---

## 4. Settings

**Project:** [solutions/ch04_challenge_4_settings_overlay](solutions/ch04_challenge_4_settings_overlay/)
(from `ch04_pause_and_hud`)

**Goal:** `sleep` and `wake` between two overlay scenes; `setVisible` on another scene; a setting in
the registry that outlives every scene.

`src/scenes/PauseScene.ts`
```ts
keyboard.on("keydown-S", () => {
  this.scene.launch(SETTINGS_SCENE);
  this.scene.sleep();
});
```

`src/scenes/SettingsScene.ts`
```ts
keyboard.on("keydown-H", () => {
  const show = this.registry.get(SHOW_HUD) === false;     // it was hidden: show it
  this.registry.set(SHOW_HUD, show);
  this.scene.setVisible(show, HUD_SCENE);                  // takes effect straight away
  this.showSettings();
});
```

```ts
// wake the pause menu, and take this scene away
private back(): void {
  this.scene.wake(PAUSE_SCENE);
  this.scene.stop();
}
```

`src/scenes/HudScene.ts`
```ts
this.scene.setVisible(this.registry.get(SHOW_HUD) !== false);
```

- the pause menu **sleeps**, so it is neither drawn nor listening to keys while the settings are
  open - and when it wakes, it is exactly as it was (its `once` listeners for P, R and Q are still
  waiting). Its S listener is `on`, so the settings can be opened again
- the HUD is hidden with `setVisible(false)`, not slept: it keeps running and keeps listening, so its
  numbers are right when it is shown again
- the setting lives in the registry; the HUD reads it in `create()`, so it survives the HUD being
  stopped and relaunched on a restart

Tested with the harness: S from the pause menu - `PauseScene` sleeping, `SettingsScene` running; H -
HUD hidden; ESC - pause menu awake; R - new round, HUD still hidden; score changed while hidden, then
H again - HUD visible showing the new score.

**Look for:** the pause menu slept, not stopped (stopping it would lose its data - the score, the
title); the setting surviving a restart. `this.scene.sleep(HUD_SCENE)` for the HUD also works, but a
student should be able to say what is different (a sleeping HUD would still receive the events - its
listeners are still on `GameScene` - but would not be updated or drawn).

---

## 5. Fade in, fade out

**Project:** [solutions/ch04_challenge_5_fade_in_fade_out](solutions/ch04_challenge_5_fade_in_fade_out/)
(from `ch04_pause_and_hud`)

**Goal:** camera fades and their completion event; and the subtle part - a paused scene's camera
does not run its effects.

`src/scenes/MenuScene.ts`
```ts
this.input.keyboard!.once("keydown-SPACE", () => {
  this.cameras.main.fadeOut(FADE_TIME);
  this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    this.scene.start(GAME_SCENE);
  });
});
```

`src/scenes/PauseScene.ts`
```ts
// CHALLENGE 5: fade to black, then do `next`.
//
// It is THIS scene's camera that fades. GameScene is paused, and a paused scene's cameras are
// not updated either - a fade started on its camera would never finish. A camera's fade covers
// everything under it, so fading the top scene fades the whole screen.
private fadeOutThen(next: () => void): void {
  if (this.leaving) {
    return;
  }
  this.leaving = true;
  this.cameras.main.fadeOut(FADE_TIME);
  this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, next);
}
```

plus `this.cameras.main.fadeIn(FADE_TIME)` at the start of `create()` in `MenuScene`, `GameScene`
and `HudScene` (the HUD has its own camera, so it needs its own fade).

Tested with the harness: a fade started on the paused `GameScene`'s camera stayed at
`fadeEffect.progress` 0 for a full second; fading `PauseScene`'s camera darkened the whole screen,
game and HUD included, and the restart happened when it finished. Pressing P and R during a Q fade
did nothing.

**Look for:** the scene change inside the `FADE_OUT_COMPLETE` listener, not straight after
`fadeOut()` (then there is no fade at all); protection against a second key during the fade (`once`
on the menu; the `leaving` flag in the pause menu, which also stops P "carrying on" into a scene
that is about to restart). Students who try to fade `GameScene`'s camera from the pause menu will
find it never finishes - excellent, if they can explain why.

---

## 6. Auto-pause, without a leak

**Project:** [solutions/ch04_challenge_6_auto_pause](solutions/ch04_challenge_6_auto_pause/)
(from `ch04_pause_and_hud`)

**Goal:** listeners on the game's own emitter, and cleaning them up - proved, not assumed.

`src/scenes/GameScene.ts`
```ts
this.game.events.on(Phaser.Core.Events.BLUR, this.autoPause, this);
this.game.events.on(Phaser.Core.Events.HIDDEN, this.autoPause, this);
```

```ts
this.game.events.off(Phaser.Core.Events.BLUR, this.autoPause, this);
this.game.events.off(Phaser.Core.Events.HIDDEN, this.autoPause, this);
```

(in the `SHUTDOWN` handler, next to stopping the HUD)

```ts
private autoPause(): void {
  if (this.scene.isActive()) {
    this.pauseGame();
  }
}
```

`src/scenes/HudScene.ts`
```ts
override update(): void {
  const blur = this.game.events.listenerCount(Phaser.Core.Events.BLUR);
  const hidden = this.game.events.listenerCount(Phaser.Core.Events.HIDDEN);
  this.listenersText.setText(`game listeners - BLUR: ${blur}  HIDDEN: ${hidden}`);
}
```

`isActive()` is `false` while the scene is paused, so the pause menu is never opened twice, and
nothing happens on the game-over screen.

The counts are not 1: Phaser itself listens on the game's emitter (and some of its listeners belong
to whichever scenes are running), so the number to check is that it is **the same** in the same
situation, round after round. Tested with the harness: during play HIDDEN stayed at 2 and BLUR at 4
through three restarts (BLUR is 5 in the very first round - one of Phaser's own listeners goes away
after the first start, which is why "does not grow" is the test, not "stays exactly the same"). In a
copy with the `off` lines removed, three restarts took HIDDEN from 2 to 5 and BLUR from 5 to 7. `game.events.emit("blur")` (from the harness) opened the pause
menu during play, did nothing when already paused, and did nothing on the menu after quitting.

**Look for:** the `off` calls with the same method and context as the `on` calls (an arrow function
passed to both `on` and `off` removes nothing); the "only while playing" check; a test plan. `once`
is a plausible wrong answer: it would pause the first time only.
