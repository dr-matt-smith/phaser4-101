# Chapter 5, challenge 1 - More pads

**Teacher's solution to Chapter 5, challenge 1.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 1` comment.

(Originally: Sound Board)

Twelve pads that play sound effects, and keys that change how they sound: volume, rate (speed),
detune (pitch), a random pitch for every play, pan by the pad's position, and an echo. Below the
pads, a music track you can play, pause, resume, stop, loop and skip through, with a bar showing
where it has got to. It goes with **Chapter 5 - Audio**.

## Controls

| Control | Does |
|---|---|
| 1 - 9, or click a pad | plays that pad's sound (pads 10 - 12: click only) |
| UP / DOWN | volume up / down |
| LEFT / RIGHT | rate (speed) down / up |
| W / S | detune (pitch) up / down, a semitone at a time |
| R | random pitch on / off |
| P | pan by position on / off |
| E | echo on / off |
| Z | puts every setting back to normal |
| M | music: play, pause, carry on |
| N | music: stop |
| L | music: loop on / off |
| J | music: skip forward 2 seconds |

## What to look at

- `src/scenes/SoundBoardScene.ts` - `preload()` loads the sounds; `playPad()` turns the settings
  into a `SoundConfig`; the echo uses `this.sound.play(key, config)` with a `delay`; the music is one
  sound object made with `this.sound.add()` and controlled with `play`, `pause`, `resume`, `stop`,
  `setVolume`, `setRate`, `setDetune`, `setLoop` and `setSeek`
- `src/objects/SoundPad.ts` - `play()` makes a sound with `add()`, listens for its `"complete"` event
  to stop glowing, then destroys it
- `src/GameSound.ts` - the type of a sound made by `this.sound.add()`
- `src/assets.ts` - every sound's key and file

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
