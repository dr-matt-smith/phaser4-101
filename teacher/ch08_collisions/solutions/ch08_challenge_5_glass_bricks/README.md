# Chapter 8, challenge 5 - Glass bricks

**Teacher's solution to Chapter 8, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Breakout)

The classic bat-and-ball game: knock every brick out of the wall, and do not let the ball past
your paddle. The bricks are a static group, the ball bounces off them with a collider, and the
paddle sends the ball off at an angle that depends on where it lands - with a process callback so
that only a falling ball bounces. It goes with **Chapter 8 - Collisions**.

## Controls

| Control | Does |
|---|---|
| mouse or LEFT / RIGHT | move the paddle |
| click or SPACE | serve the ball; play again at the end |

## What to look at

- `src/scenes/BreakoutScene.ts` - `create()` sets up the two colliders (the paddle's has a process
  callback) and opens the bottom of the world with `setBoundsCollision`; `hitBrick()`;
  `makeTextures()` draws the paddle and bricks with `Graphics` and `generateTexture`
- `src/objects/Ball.ts` - a circular body (`setCircle`), bounce 1, and `bounceOff()`, which aims the
  ball by where it hit the paddle
- `src/objects/Paddle.ts` - an immovable body, moved by the keys or the mouse

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
