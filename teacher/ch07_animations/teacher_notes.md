# Chapter 7 - Animations: teacher notes

## Overview

The chapter covers three separate tools that all make a game feel alive: **frame animations** from
sprite sheets (`this.anims`, `play`, animation events), **tweens** (`this.tweens`: easing, yoyo,
repeat, chains, stagger, counters) and **particles** (`this.add.particles`, `explode`). The design
idea is the **state machine** for a character's animations - the first time in the book that an
object's behaviour is organised around explicit states, and a pattern students will meet again in
Chapters 12, 13, 15 and 17. The TypeScript ideas are **string-literal union types** as enums,
`Record<K, V>`, `switch` on strings, `Partial<T>`, `??` and a justified `as`.

It is a full chapter. If time is short, the lab and the hero are the core; the tween playground can
be explored by students on their own with the README beside them.

## Prerequisites

- Chapter 1: `preUpdate` and `delta`, speeds in pixels per second, origins
- Chapter 2: `on`/`once`, `setInteractive`, scenes reused and reset in `init()`
- Chapter 3: loading sprite sheets (a quick recap is in the chapter)
- Chapter 4: `Sprite.preUpdate` and why `super.preUpdate` matters (the chapter points back to it)
- Chapter 6: floating text with a tween is referred to in passing

## Learning outcomes

Students can:

1. make named animations from a sprite sheet with `this.anims.create` and `generateFrameNumbers`,
   choosing `frameRate`, `repeat` and `yoyo`, and explain why they are made once, in a preload scene
2. play and control an animation on a sprite (`play`, `play(key, true)`, `chain`, `playAfterRepeat`,
   `stop`, `pause`, `timeScale`, `setFlipX`) and read its state (`currentAnim`, `currentFrame`)
3. react to animation events, including `ANIMATION_COMPLETE_KEY + key`
4. structure a character's animations as a state machine with a single `changeState` method
5. write tweens with `duration`, `ease`, `yoyo`, `hold`, `repeat`, `delay` and `onComplete`; use
   chains, stagger and counters; and prevent tweens fighting with `killTweensOf`
6. choose a suitable ease, and describe the difference between easeIn, easeOut and easeInOut
7. make a burst of particles with an emitter created once with `emitting: false`

## Suggested session plan (1 hour lecture + 2 hour lab)

**Lecture (1 hour)**

| Time | Activity |
|---|---|
| 0:00 - 0:05 | Show a still of the hero next to the running game. "What is different?" - frames, flipping, and movement |
| 0:05 - 0:20 | Slides 3-6: frame animation vs tween; the sprite sheet diagram; `anims.create`; global animations; Sprite vs Image |
| 0:20 - 0:30 | **Live demo** in `ch07_animation_lab`: press 2 repeatedly, then hold it - the hero freezes on frame 2. Then 3. Ask for an explanation before showing slide 7 |
| 0:30 - 0:40 | Slides 8-9: chain, playAfterRepeat, events. In the lab: C, then 2 followed by A, watching the event log |
| 0:40 - 0:55 | Slides 10-13: the state machine. Draw the states on the board with the class first, then show `changeState` and `updateState` |
| 0:55 - 1:00 | Slides 14 and 18 as a preview of tweens and particles, for the lab |

**Lab (2 hours)**

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Build and play all three projects. In the hero project, read `Hero.ts` from top to bottom in pairs |
| 0:15 - 0:30 | Challenge 1 (frame rates) - everyone |
| 0:30 - 0:50 | Tweens: slides 14-18 on screen; students press every button in the playground, then read the matching method. The easing gallery: 1, 2, 3 |
| 0:50 - 1:00 | **Live demo**: comment out `resetCrate()` in `pulse()`, press Pulse four times quickly - the crate ends up stuck at a bigger size (2.4 instead of 1.5). Ask why |
| 1:00 - 1:45 | Challenges 2-4, then 5 and 6 for those who are ahead |
| 1:45 - 2:00 | Show-and-tell of title sequences (challenge 3) and stomping (challenge 6) |

## Key points to stress

- **frames vs tweens.** A frame animation changes the picture; a tween changes a number. Students
  often try to "tween the frames" or "animate the position" - naming the difference early avoids it
- **animations belong to the game.** `this.anims` is the game's animation manager in every scene;
  making animations in a scene that restarts gives a console warning, not an error, so it can go
  unnoticed for a long time
- **`play` restarts.** The single most common animation bug is `play(key)` in `update()`, which
  restarts the animation every frame so it never gets past its first frame. Two cures: `play(key,
  true)`, or (better) only call `play` when the state changes
- **one place changes state.** The state machine's value comes from `changeState` being the only
  place the state and the animation change. If students set `currentState` in several places, the
  benefit is lost
- **`super.preUpdate`**: a `Sprite` subclass that overrides `preUpdate` without calling `super`
  shows a frozen frame and gives no error at all
- **ask, don't reach in** (from Chapter 2) returns in the hero: the scene calls `hero.hurt()`; it
  does not set the hero's velocity or state
- **effects clean up after themselves**: `onComplete: () => popup.destroy()`, and
  `once(ANIMATION_COMPLETE, () => boom.destroy())`. Otherwise the scene fills with invisible objects
- **make an emitter once**, and use `explode` or `emitting` - never a new emitter per burst

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| The character slides about frozen on one frame; no error | `preUpdate` overridden without `super.preUpdate(time, delta)` | call `super.preUpdate` first |
| The animation is stuck on its first frame while a key is held | `play(key)` called every frame (or on every key repeat) restarts it | `play(key, true)`, or play only when the state changes |
| `Property 'play' does not exist on type 'Image'.` | the object was made with `this.add.image` | `this.add.sprite` (or extend `Sprite`) |
| The sprite keeps its old animation; console: `Missing animation: hero-runn` | misspelled animation key | keep animation keys as constants |
| Console: `AnimationManager key already exists: hero-idle` | animations made in a scene that starts more than once | make them in the preload scene |
| `This member must have an 'override' modifier because it overrides a member in the base class 'Sprite'.` | `preUpdate` in a `Sprite` subclass without `override` | add `override` (and keep it `protected`) |
| `Class 'Hero' incorrectly extends base class 'Sprite'. Property 'state' is private in type 'Hero' but not in type 'Sprite'.` | a field named `state` - every game object already has one | another name, e.g. `currentState` (likewise a method called `setState`) |
| `Property 'hurt' is missing in type '{ idle: string; run: string; jump: string; fall: string; }' but required in type 'Record<HeroState, string>'.` | a state added to the union but not to the `Record` | this is the type doing its job - add the animation |
| An `ANIMATION_COMPLETE` listener never runs | the animation has `repeat: -1` and never completes | give it a finite `repeat`, or listen for `ANIMATION_REPEAT` / `ANIMATION_STOP` |
| After several hurts, the "hurt is over" code runs several times at once | `on` used where `once` was meant, adding a listener per hurt | `once` |
| A yoyo tween "comes back" to the wrong place, or the object creeps | a second tween started while the first was running, from a mid-way value | `killTweensOf` and reset first, or ignore the input while `isTweening` |
| The ease looks linear | misspelled ease string (`"Bounce.easout"`) - Phaser silently falls back to linear | check the spelling; no error is given |
| `Argument of type 'number \| null' is not assignable to parameter of type 'number'.` on `Math.round(tween.getValue())` | `getValue()` returns `number \| null` | `tween.getValue() ?? 0` |
| Particles appear at (0, 0) | `explode(count)` with no position, on an emitter made at (0, 0) | `explode(count, x, y)` |
| The game slows down after a minute of the trail/explosions | a new emitter made for every burst or every pointer move | make one emitter, in `create()` |

The error messages above were produced in scratch copies of the chapter projects.

## Suggested demos and live-coding moments

- **The stuck run.** In the lab, hold 2 then hold 3. Nothing explains `ignoreIfPlaying` as well
- **Delete `super.preUpdate`** in `Hero.ts`, build, run right. The hero glides, frozen. Put it back
- **Change one number**: the hurt animation's `frameRate` from 8 to 3. The hero stays hurt for
  longer, with no other change - the animation event ties game rules to animations
- **Pulse without `resetCrate`** (see the lab plan), then with it
- **Easing on the board.** Before showing the gallery, ask students to sketch how a door, a ball
  dropped on the floor, and a menu sliding in should move. Then find their curves in the gallery
- **Particle knobs**: in `addExplosions`, change `gravityY` to -300, `speed` to a single number,
  remove `blendMode: "ADD"`, make `quantity` 200. Discuss what each setting does to the "feel"

## Discussion questions

- The hero has five states. Which pairs of states can never follow each other directly? Where does
  the code make sure of that?
- Why is it `this.once(...)` in `hurt()` and not `this.on(...)` in the constructor? Could it be
  `on` in the constructor instead? (Yes - with the listener registered once. Both are defensible;
  discuss which is easier to follow.)
- What is the difference between `anims.timeScale` on a sprite and changing `frameRate` in
  `anims.create`?
- When would you use a tween to move a character, and when physics or `preUpdate`? (Tweens: a known
  start, end and time - cut-scenes, menus, platforms on rails. Physics: anything that responds to
  the player or to collisions.)
- `killTweensOf` then reset, or ignore the click while `isTweening`? Which feels better for a
  button? For a character's attack?

## Extension ideas

- give the hero a **land** state with a short squash (a `scaleY` tween, yoyo) between fall and idle
- add `this.anims.addMix(HERO_RUN, HERO_IDLE, 100)` and compare stopping with and without it
- a **particle trail** from the hero's feet while running (a flowing emitter with `startFollow`,
  switched by the state machine)
- use `anims.staggerPlay` to start a row of coins spinning out of step
- tween along a path: `Phaser.Curves.Path` and `this.add.follower` for an enemy that flies loops
- explore `Stepped` easing (`ease: "Stepped", easeParams: [5]`) for a deliberately jerky, retro look

## Assessment ideas

- **Practical:** "add a `duck` state to the hero: DOWN held on the ground shows frame 10 and stops
  running; releasing DOWN returns to idle". Marks for: the union, the `Record`, the transitions in
  `updateState`, no `play` outside `changeState`
- **Code reading:** show a `Sprite` subclass with `play(RUN)` in `preUpdate` and no `super` call;
  ask for both bugs and their symptoms
- **Short answer:** explain `yoyo`, `hold`, `repeat: 2` and `repeatDelay` by sketching the value
  against time (the timeline diagram in the chapter is the model answer)
- **Design:** draw the state machine for a door (closed, opening, open, closing, locked), naming the
  animation and the event that ends each state

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
