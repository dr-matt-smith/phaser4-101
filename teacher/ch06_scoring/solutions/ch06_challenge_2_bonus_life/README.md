# Chapter 6, challenge 2 - Bonus life

**Teacher's solution to Chapter 6, challenge 2.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 2` comment.

(Originally: Coin Collector)

Coins and gems pop up and vanish again; click them before they go. Five in a row raises your score
multiplier, every ten pickups is a new, faster level, and three that get away end the game. The
score, level, combo and lives are shown by a HUD scene running on top of the game, which listens to
a `ScoreManager` - a plain class that owns the numbers and announces every change as an event. It
goes with **Chapter 6 - Scoring**.

## Controls

| Control | Does |
|---|---|
| SPACE | starts the game; plays again from the game over screen |
| mouse | click coins (10 points) and gems (50 points); clicking nothing breaks your combo |
| ESC | back to the title screen, from the game over screen |

## What to look at

- `src/ScoreManager.ts` - the rules of scoring (`collect()`, `loseLife()`, `breakCombo()`,
  `getMultiplier()`) and the events it sends
- `src/scenes/GameScene.ts` - makes a new `ScoreManager` in `init()`, launches the HUD with it,
  and reports clicks and escapes to it; `scheduleNextPickup()` speeds up with the level
- `src/scenes/HudScene.ts` - listens to the `ScoreManager`; `countUpTo()` counts the score up
  with a counter tween; stops listening on `SHUTDOWN`
- `src/objects/Coin.ts` - a pickup that pops in, blinks, and sends `COIN_EXPIRED` if it gets away
- `src/objects/FloatingText.ts` - the "+10" that drifts up and removes itself

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
