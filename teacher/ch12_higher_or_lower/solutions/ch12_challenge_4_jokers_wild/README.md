# Chapter 12, challenge 4 - Jokers wild

**Teacher's solution to Chapter 12, challenge 4.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 4` comment.

(Originally: Higher or Lower - Intermediate)

Higher or lower as a proper little game: a title screen, a real shuffled deck, cards that turn
over with a flip animation, HIGHER and LOWER buttons, a streak of five lights, sounds, and a game
over screen for winning and losing. Five right in a row wins; one wrong guess and you are out. It
goes with **Chapter 12 - Higher or lower**.

## Controls

| Control | Does |
|---|---|
| mouse | click PLAY, HIGHER, LOWER, PLAY AGAIN and MENU |
| H | guess higher |
| L | guess lower |

## What to look at

- `src/Card.ts`, `src/Deck.ts`, `src/rules.ts` - the model: plain TypeScript, no Phaser. `Deck`
  has the Fisher-Yates `shuffle()` and `draw()`
- `src/objects/CardSprite.ts` - the view of a card: `frameFor()`, and `flipTo()`, a tween chain
  that squashes the card, changes its picture and opens it again
- `src/objects/Button.ts` - a `Container` holding an image and a label, with hover and pressed
  pictures and `setEnabled()`
- `src/scenes/GameScene.ts` - the `GameState` union type, and how every handler checks it first
- `src/scenes/GameOverScene.ts` - one scene for both endings, told which by its data

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
