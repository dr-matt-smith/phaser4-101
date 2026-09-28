# Chapter 9, challenge 4 - Rocks that split

**Teacher's solution to Chapter 9, challenge 4.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 4` comment.

(Originally: Space Ship)

An Asteroids-style game made entirely with Arcade Physics: a ship that turns with angular
acceleration, thrusts with acceleration, drifts with damping and never goes faster than its top
speed; rocks that drift, spin and bounce off each other; bullets; and a world that wraps round at
the edges. It goes with **Chapter 9 - 2D physics**.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT | turn |
| UP | thrust |
| SPACE | fire (hold it down to keep firing) |
| R | start again |

## What to look at

- `src/objects/Ship.ts` - `turn()` sets an angular acceleration; `thrust()` uses
  `velocityFromRotation()` to point the acceleration the way the ship faces; damping, `setMaxSpeed`
  and angular drag in the constructor
- `src/objects/Rock.ts` - a scaled circle body, `velocityFromAngle()`, `setAngularVelocity()`
- `src/scenes/SpaceScene.ts` - `this.physics.world.wrap(...)` in `update()`; `fire()` adds the
  ship's velocity to the bullet's; `overlap` with a process callback while the ship is safe;
  `disableBody` / `enableBody` for losing a life; `this.physics.pause()` at game over

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
