# Chapter 14, challenge 3 - Zig zag

**Teacher's solution to Chapter 14, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Space Shooter)

Waves of enemy ships fly in from the top of the screen. Slide your ship left and right and hold
SPACE to shoot them down; don't let them crash into you. Odd waves are a row of ships that swoops
into line and then creeps down; even waves are a stream of ships dropping, one at a time, from above
wherever you are. Every wave is bigger and faster than the last. It goes with **Chapter 14 - Catch,
avoid and shoot**, where it is the intermediate version.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT arrows | move the ship |
| SPACE | start; hold to fire; play again |
| ESC | back to the title screen, from the game over screen |

## What to look at

- `src/scenes/GameScene.ts` - the two pools (`this.physics.add.group({ classType, maxSize })`),
  `fire()` asking the pool for a bullet with `get()`, `startNextWave()`, `rowWave()` (tweens with a
  stagger), `streamWave()` (a timer with `repeat`), `enemyGone()` counting the wave down, and
  `explode()` (an animation plus a particle burst)
- `src/objects/Bullet.ts` and `src/objects/Enemy.ts` - pooled objects: `fire()`/`spawn()` switch
  them on with `enableBody`, `kill()` switches them off with `disableBody`
- `src/objects/PlayerShip.ts` - the fire rate (`tryToFire`) and the flashing after a hit
  (`makeInvulnerable`)
- `src/objects/StarLayer.ts` - a `TileSprite` that scrolls itself; two of them make the parallax
  starfield, from textures drawn with `Graphics` and `generateTexture`

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
