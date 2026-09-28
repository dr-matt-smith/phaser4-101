# Chapter 7, challenge 2 - Coin run

**Teacher's solution to Chapter 7, challenge 2.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 2` comment.

(Originally: Hero Animations)

The hero from `hero.png` on a strip of ground: run left and right (the picture flips to face the
way you are going), jump, and fall back down - with a different animation for each. The hero is
driven by a small state machine (idle, run, jump, fall, hurt), and the state and animation are
shown at the top of the screen. There is no physics engine: the hero moves itself, with a speed and
a pretend gravity. It goes with **Chapter 7 - Animations**.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT | run |
| UP | jump |
| run and jump | collect the coins (challenge 2) |
| H | get hurt: knocked back and tinted red until the hurt animation ends |

## What to look at

- `src/scenes/PreloadScene.ts` - the hero's five animations, made once, for the whole game
- `src/objects/Hero.ts` - the `HeroState` type, `changeState()` (the only place an animation is
  started), `updateState()` (the rules for leaving each state), and `hurt()`, which listens for the
  hurt animation's `ANIMATION_COMPLETE_KEY` event
- `src/objects/Hero.ts` - `preUpdate()` overrides `Sprite`'s own, and calls `super.preUpdate()` so
  the animation keeps going
- `src/scenes/GameScene.ts` - builds the world, hands the arrow keys to the hero; clouds drift with
  a looping tween

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
