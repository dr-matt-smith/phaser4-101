# Chapter 14, challenge 1 - Pointer control

**Teacher's solution to Chapter 14, challenge 1.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 1` comment.

(Originally: Fruit Catcher)

Fruit and bombs fall from the sky. Slide the basket along the bottom of the screen to catch the
fruit (10 points each) and dodge the bombs. Catching a bomb, or letting a fruit hit the ground,
costs one of your three lives. It goes with **Chapter 14 - Catch, avoid and shoot**, where it is the
simple version of the genre.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT arrows | move the basket |
| mouse / touch | the basket slides to the pointer (challenge 1) |
| SPACE | play again, after a game over |

## What to look at

- `src/scenes/GameScene.ts` - `this.time.addEvent({ delay, loop: true, callback })` drops something
  every 700 ms; `this.physics.add.group({ gravityY })` makes the fruit and bombs fall; two
  `overlap`s between the basket and the groups; `update()` throws away anything that falls off
  the bottom; `endGame()` stops the timer and pauses the physics
- `src/objects/Basket.ts` - an Arcade Physics image held on screen by `setCollideWorldBounds`, with
  a small body across its top so only things that fall *into* it count

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
