# Space Shooter Deluxe

The space shooter, grown into a full game: three levels of enemy waves, each ending with a boss
that has a health bar; enemies that shoot back; power-ups (spread shot, rapid fire, extra life)
dropped by destroyed ships; a HUD in its own scene; music; and a high-score table that is still
there next time. It goes with **Chapter 14 - Catch, avoid and shoot**, where it is the advanced
version.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT arrows | move the ship |
| SPACE | start; hold to fire; play again |
| M | music and sound on / off |
| ESC | quit to the menu (from the game or the game over screen) |

## What to look at

- `src/levels.ts` - the levels as data: the waves in each, how often enemies fire, the boss's
  health and speed
- `src/scenes/GameScene.ts` - `startLevel()`, `nextWave()`, `enemyGone()` and `startBoss()` move
  the game through its phases; `enemyFires()` and `bossFires()`; `collect()` for power-ups; every
  change the HUD needs is sent with `this.events.emit(...)`
- `src/WaveSpawner.ts` - the three wave patterns, including `swoop()`, which sends ships along a
  `Phaser.Curves.Spline`
- `src/objects/Enemy.ts` - `followPath()` and `preUpdate()`: a tween moves `pathProgress` from 0 to
  1, and the enemy places itself at that point on the path
- `src/objects/Boss.ts` - an entry tween, then a side-to-side tween that repeats for ever; a white
  flash with `setTintMode(Phaser.TintModes.FILL)`
- `src/objects/PlayerShip.ts` - power-ups as "active until" times on the scene's clock
- `src/scenes/HudScene.ts` - listens to GameScene's events, and removes its listeners when it shuts
  down
- `src/HighScores.ts` - the top five, saved in `localStorage` and checked when loaded back
- `src/music.ts` - one music track at a time, across scenes

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
