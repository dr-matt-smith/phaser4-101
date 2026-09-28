# Chapter 7, challenge 1 - Different speeds

**Teacher's solution to Chapter 7, challenge 1.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 1` comment.

(Originally: Animation Lab)

A place to try out Phaser's animation controls and see exactly what they do. Along the top, one
sprite from each of five sprite sheets plays its looping animation. On the left is a big hero whose
animation you control from the keyboard; on the right, what its animation state says right now,
and a log of the animation events it sends. Along the bottom, every frame of `hero.png`, with the
one on show picked out. It goes with **Chapter 7 - Animations**.

## Controls

| Control | Does |
|---|---|
| 1 | play the idle animation |
| 2 | play run - from its first frame, every time |
| 3 | play run - but not if it is already playing (`play(key, true)`) |
| 4 / 5 / 6 | play jump / fall / hurt |
| 7 | play sprint - the run frames at 20 fps (challenge 1) |
| C | hurt, then idle (`chain`) |
| A | idle, once the current loop has finished (`playAfterRepeat`) |
| S | stop |
| P | pause / resume |
| F | flip left / right |
| UP / DOWN | twice as fast / half as fast (`timeScale`) |

## What to look at

- `src/scenes/PreloadScene.ts` - `this.load.spritesheet(...)`, then every animation made with
  `this.anims.create(...)` and `generateFrameNumbers(...)`, once, before the lab starts
- `src/scenes/LabScene.ts` - `addKeys()`: `play`, `play(key, true)`, `chain`, `playAfterRepeat`,
  `stop`, `pause`/`resume`, `setFlipX`, `timeScale`
- `src/scenes/LabScene.ts` - `addHero()`: listening for `Phaser.Animations.Events`; `update()`:
  reading `anims.currentAnim`, `anims.currentFrame` and `anims.isPlaying`
- `src/scenes/LabScene.ts` - `addFrameStrip()`: an `Image` showing one frame of a sprite sheet

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
