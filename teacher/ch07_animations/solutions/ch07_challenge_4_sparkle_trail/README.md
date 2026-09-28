# Chapter 7, challenge 4 - Sparkle trail

**Teacher's solution to Chapter 7, challenge 4.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 4` comment.

(Originally: Tweens and Particles)

A playground for tweens and particles. Each button on the left sets off a different tween -
moving, pulsing, fading, spinning, bouncing, a chain of tweens, a staggered wave along a row of
stars, and a score that counts up. Click anywhere in the playground for an explosion: an animated
sprite plus a burst of particles. The last button opens an easing gallery: the same tween run with
eight different eases side by side, each with a graph of its curve. It goes with
**Chapter 7 - Animations**.

## Controls

| Control | Does |
|---|---|
| mouse | click a button; click the playground for an explosion |
| move the mouse | a sparkle trail follows it round the playground (challenge 4) |
| 1 - 8 | the same as the buttons: move, pulse, fade, spin, bounce, chain, stagger, counter |
| 9 | the easing gallery |
| 1 / 2 / 3 | (gallery) easeIn / easeOut / easeInOut |
| SPACE | (gallery) start the race again |
| ESC | (gallery) back to the playground |

## What to look at

- `src/scenes/PlaygroundScene.ts` - one method per button: `this.tweens.add(...)` with `x`, `y`,
  `scale`, `alpha` and `angle`; `yoyo`, `hold`, `repeat`; `this.tweens.chain(...)`;
  `this.tweens.stagger(...)`; `this.tweens.addCounter(...)`; `resetCrate()` and `killTweensOf`
- `src/scenes/PlaygroundScene.ts` - `addExplosions()` and `explode()`: one particle emitter made
  with `emitting: false`, `explode(count, x, y)`, and an explosion sprite that destroys itself on
  `ANIMATION_COMPLETE`
- `src/scenes/EasingScene.ts` - eight tweens, eight eases; `GetEaseFunction` to draw each curve
- `src/objects/Button.ts` - a button made from an `Image` and a `Text`, with hover and pressed
  pictures

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
