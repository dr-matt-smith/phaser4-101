# Chapter 8, challenge 6 - Fair triangles

**Teacher's solution to Chapter 8, challenge 6.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 6` comment.

(Originally: Collect and Avoid)

Move the blue blob round the crates with the arrow keys, collect the stars, and keep away from the
red triangles - every five stars, another one joins in. It is the chapter's first Arcade Physics
game: the crates are a static group, the stars and enemies are dynamic groups, and everything that
happens when two things touch is set up with `collider` and `overlap`. It goes with
**Chapter 8 - Collisions**.

## Controls

| Control | Does |
|---|---|
| arrow keys | move |
| SPACE | play again, after the game is over |

## What to look at

- `src/main.ts` - the `physics` settings that turn Arcade Physics on (set `debug: true` to see
  the bodies)
- `src/objects/Player.ts` - `scene.physics.add.existing(this)`, and a body resized with `setSize`
  and `setOffset` to fit the picture
- `src/scenes/GameScene.ts` - the groups, the three colliders and two overlaps in `create()`;
  `collectStar()` (`disableBody` / `enableBody`); `hurtPlayer()` switches an overlap off for a while
  with `collider.active`

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
