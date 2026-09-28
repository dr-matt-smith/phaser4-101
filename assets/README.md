# The asset library

Every picture and sound used by the guide's projects. A project copies the files it needs into its
own `public/assets/` folder, keeping the same sub-folder, so in a project a file is loaded as, for
example, `assets/images/ball.png`.

Everything here is generated - see [CREDITS.md](CREDITS.md). To change the art, edit
`tools/make_images.ts` or `tools/make_audio.ts` and run it again.

## images/ - single pictures

| File | Size | What |
|---|---|---|
| `ball.png`, `ball_blue.png` | 64 x 64 | shiny red / blue ball |
| `ball_small.png` | 24 x 24 | small white ball |
| `star.png`, `coin.png`, `gem.png`, `heart.png` | 32 x 32 | pickups |
| `fruit.png` | 32 x 32 | a red fruit, for catching |
| `bomb.png` | 36 x 36 | a bomb, for avoiding |
| `basket.png` | 96 x 48 | a basket, for catching |
| `player_ship.png` | 64 x 48 | player's ship, pointing up |
| `enemy_ship.png` | 56 x 40 | enemy ship, pointing down |
| `bullet.png` | 8 x 20 | player bullet |
| `enemy_bullet.png` | 10 x 10 | enemy bullet |
| `rock.png` | 48 x 48 | asteroid |
| `crate.png` | 48 x 48 | wooden crate |
| `platform.png` | 200 x 32 | grassy floating platform |
| `ground.png` | 800 x 64 | grassy ground strip, the width of the game |
| `sky.png` | 800 x 600 | daytime sky with hills |
| `space.png` | 800 x 600 | starfield with a planet |
| `table.png` | 800 x 600 | green card table |
| `arena.png` | 800 x 600 | fighting-game arena, floor at y = 470 |
| `cloud.png` | 128 x 64 | cloud |
| `particle.png` | 16 x 16 | soft white dot, for particle effects |
| `button.png`, `button_over.png`, `button_down.png` | 220 x 64 | a button: normal, hovered, pressed |
| `panel.png` | 400 x 300 | a dark translucent panel for menus and dialogs |
| `logo.png` | 480 x 140 | "PHASER 4 - a guide for OO programmers" |
| `player.png` | 48 x 48 | a friendly blue blob |
| `enemy.png` | 48 x 48 | an angry red triangle |
| `target.png` | 64 x 64 | a bullseye |
| `arrow_left.png`, `arrow_right.png` | 64 x 64 | round arrow buttons |
| `sound_on.png`, `sound_off.png` | 48 x 48 | mute button, both states |

## spritesheets/ - pictures made of equal-sized frames, left to right

Load with `this.load.spritesheet(key, file, { frameWidth, frameHeight })`.

| File | Frame size | Frames |
|---|---|---|
| `coin_spin.png` | 32 x 32 | 0-5: a coin turning round |
| `explosion.png` | 64 x 64 | 0-7: an explosion, growing and fading |
| `hero.png` | 32 x 48 | 0-1 idle, 2-7 run, 8 jump, 9 fall, 10 hurt (faces right) |
| `slime.png` | 32 x 32 | 0-3: squash and stretch |
| `bat.png` | 32 x 32 | 0-3: flapping |
| `ghost.png` | 32 x 32 | 0-3: bobbing |
| `topdown_hero.png` | 32 x 32 | 0-2 walk down, 3-5 walk left, 6-8 walk right, 9-11 walk up (frame 0, 3, 6, 9 = standing) |
| `topdown_enemy.png` | 32 x 32 | same layout as `topdown_hero.png`, in orange |
| `fighter_red.png`, `fighter_blue.png` | 96 x 128 | 0-1 idle, 2-5 walk, 6-8 punch, 9-11 kick, 12 block, 13 hurt, 14 knocked out (face right). **Frame 7's fist reaches past the frame's right edge into frame 8** - Chapter 17's `fixPunchFrames()` shows how to re-cut the two frames after loading |
| `items.png` | 32 x 32 | 0 key, 1 red potion, 2 blue potion, 3 chest closed, 4 chest open, 5 sword, 6 shield, 7 gold |
| `cards.png` | 80 x 112 | 13 per row, A 2 3 ... 10 J Q K. Rows: clubs (0-12), diamonds (13-25), hearts (26-38), spades (39-51); 52 = blue back, 53 = red back. Frame = suit * 13 + (rank - 1) |
| `memory_tiles.png` | 100 x 100 | 0 = back ("?"), 1-12 = twelve different pictures |

## tilesets/ - 32 x 32 tiles for tilemaps

Tile numbers start at 0, left to right, top to bottom. (In a Tiled map they start at the tileset's
`firstgid`, usually 1.)

`simple_tiles.png` (4 x 1): 0 grass, 1 water, 2 wall, 3 sand

`platform_tiles.png` (8 x 2):

| 0 grass top | 1 dirt | 2 grass left edge | 3 grass right edge | 4 brick | 5 stone | 6 spikes | 7 ladder |
|---|---|---|---|---|---|---|---|
| **8 water** | **9 lava** | **10 crate** | **11 door top** | **12 door** | **13 flag** | **14 bush** | **15 sign** |

`dungeon_tiles.png` (8 x 2):

| 0 floor | 1 floor, cracked | 2 floor, mossy | 3 wall | 4 wall top | 5 door closed | 6 door open | 7 stairs down |
|---|---|---|---|---|---|---|---|
| **8 chest** | **9 spikes** | **10 water** | **11 pillar** | **12 rubble** | **13 wall with torch** | **14 carpet** | **15 void (black)** |

## audio/ - 22050 Hz mono WAV

| Sound effects | |
|---|---|
| `click.wav`, `pop.wav` | UI click, a bubbly pop |
| `jump.wav`, `coin.wav`, `powerup.wav` | platformer staples |
| `hit.wav`, `hurt.wav`, `explosion.wav`, `shoot.wav` | action |
| `win.wav`, `lose.wav`, `correct.wav`, `wrong.wav` | results |
| `flip.wav`, `card_place.wav` | cards |
| `punch.wav`, `kick.wav`, `whoosh.wav` | fighting |
| `door.wav`, `step.wav` | exploring |

| Music (loops seamlessly) | |
|---|---|
| `music_menu.wav` | calm, 90 bpm, about 10 seconds |
| `music_game.wav` | cheerful, 128 bpm, 15 seconds |
| `music_action.wav` | driving, 150 bpm, about 13 seconds |
