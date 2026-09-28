# Chapter 6, challenge 5 - Chasing the record

**Teacher's solution to Chapter 6, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: High Score Table)

The coin collector game from `ch06_coin_collector`, with a top-ten high score table that lasts:
it is saved in the browser's local storage, so it is still there after the page - or the browser -
is closed. A score that makes the table asks for the player's initials, typed on the keyboard. The
title screen shows the table, with the newest entry flashing. It goes with **Chapter 6 - Scoring**.

## Controls

| Control | Does |
|---|---|
| SPACE | starts the game; plays again from the game over screen |
| mouse | click coins (10 points) and gems (50 points); clicking nothing breaks your combo |
| A - Z | type your initials after a high score (up to three) |
| BACKSPACE | rub out the last letter |
| ENTER | save your initials |
| ESC | back to the high scores, from the game over screen |

## What to look at

- `src/HighScoreTable.ts` - `load()` reads and **checks** the saved table (`JSON.parse`, the
  `isHighScore` type guard); `save()`, `qualifies()` and `add()`
- `src/scenes/NameEntryScene.ts` - listens for every `keydown` and reads `event.key`
- `src/scenes/TitleScene.ts` - shows the table, highlighting the row named in its data
- `src/scenes/GameScene.ts` - `endGame()` chooses the name entry or game over scene

To start the table again, open the browser's developer tools, find **Local Storage** (under
Application in Chrome and Edge, Storage in Firefox and Safari) and delete the key
`phaser4-guide.coin-collector.high-scores`.

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
