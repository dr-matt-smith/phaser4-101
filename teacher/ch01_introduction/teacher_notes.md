# Chapter 1 - Introduction: teacher notes

## Overview

The first contact with Phaser, Deno and TypeScript. By the end, students have built and run two
projects, can find their way round a project folder, and can read (and make small changes to) a
config, a scene, and a game object class. Nothing here is hard; the risk in this chapter is
**tooling friction** and **TypeScript surprises** for Java programmers, so leave time for both.

## Prerequisites

- comfortable writing classes, constructors, fields and methods in Java (or C#)
- has seen a little JavaScript or HTML - not essential
- Deno 2.4 or later installed (`deno --version`); Celbridge installed, or any editor plus a terminal
- a network connection for the **first** build of the first project (Phaser is downloaded once, into
  Deno's cache, and shared by every project after that)

## Learning outcomes

Students can:

1. build and serve a Phaser project, and explain why it has to be served rather than opened as a
   file
2. identify the config, the scenes and the game objects in a project, and say what each is for
3. read and write the TypeScript used in the chapter: typed fields and parameters, `const`/`let`,
   classes with `extends`/`super`/`override`, `this.`, arrow functions, template strings,
   `import`/`export`
4. place game objects using the coordinate system and `setOrigin`
5. describe the game loop, and use `delta` to move something at a speed in pixels per second

## Suggested session plan (2 x 1 hour, or one 2 hour lab)

| Time | Activity |
|---|---|
| 0:00 - 0:15 | Slides 1-6: what Phaser is, the tools, the build pipeline. **Live demo**: open `ch01_hello_phaser` in Celbridge, build, serve, open the webview |
| 0:15 - 0:35 | Students do the same. Circulate - this is where tooling problems surface (see below) |
| 0:35 - 0:55 | Slides 7-11: TypeScript for Java programmers; config, scene, game objects. Walk through `HelloScene.ts` line by line |
| 0:55 - 1:10 | Challenges 1-3 |
| 1:10 - 1:25 | Slides 12-15: coordinates and origins, the game loop, `delta`. **Live demo**: change `speedX` in `ch01_moving_ball`; then change the movement to "4 pixels a frame" and discuss why that is wrong |
| 1:25 - 1:55 | Challenges 4-6 (6 is a stretch; fine to set as homework) |
| 1:55 - 2:00 | Recap: the three parts of a game; the loop |

## Key points to stress

- **The game is always 800 x 600 inside**, whatever size it appears. Students who make the browser
  window small and then try to "fix" coordinates have misunderstood the scale manager
- **You never draw.** You add game objects and change them; Phaser draws them every frame. Java
  students who have used `paint(Graphics g)` expect to redraw things themselves
- **`this.` is compulsory** inside a class. Forgetting it is the single most common error this week
- **Speeds are per second, and `delta` is in milliseconds.** Get this right now and Chapter 4 and
  Chapter 8 are much easier

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| Blank page, or the page loads with no game | opened `dist/index.html` as a file, or the server is not running | run `deno task serve`, and open http://127.0.0.1:8000/ |
| `address already in use` when serving | another project's server is still running (often in another terminal tab) | stop it with Ctrl+C, or just use it - it serves whichever `dist/` it was started in, so stop it before switching project |
| Old version of the game after changing the code | forgot to rebuild, or the browser cached the page | build, then refresh (Ctrl+Shift+R forces it). Suggest `deno task dev` |
| `Cannot find name 'message'` | wrote `message` instead of `this.message` | fields always need `this.` |
| `This member must have an 'override' modifier` | wrote `update(...)` in a scene without `override` | add `override`. Worth explaining: the compiler is checking that the method really replaces one |
| `This member cannot have an 'override' modifier because it is not declared in the base class 'Image'. Did you mean 'update'?` | copied `override` onto `Ball.preUpdate` | `Image` has no `preUpdate()`; remove `override` (Chapter 4 explains when it is needed) |
| `Property 'message' has no initializer and is not definitely assigned in the constructor` | left the `!` off a field set in `create()` | add the `!`, and explain what it promises |
| `Module not found "file:///.../HelloScene"` | import without `.ts` | Deno needs the full file name |
| A picture shows as a green-and-black box, and the console says `Failed to process file: image "logo"` | wrong path in `this.load.image`, or the file was not copied into `public/assets/` | paths are relative to `index.html`; check `public/assets/images/` |
| Keys do nothing | the game does not have keyboard focus | click the game first |

## Discussion questions

- Why does the build still produce a game when there are type errors? When is that helpful, and
  when is it dangerous?
- The ball moves itself in `preUpdate()`; the scene could move it in `update()` instead. What is
  gained by putting the code in `Ball`? (Encapsulation; many balls for free - challenge 4.)
- What would happen to a game written as "move 4 pixels a frame" on a 144 Hz monitor? On a slow
  school PC that manages 30 frames a second?

## Extension ideas

- Look at `game.loop.actualFps` in the Moving Ball project with the browser's developer tools
  performance throttling turned on: the ball's speed should not change
- Read `build.ts` together - it is short, and shows how Deno runs other commands
- Try `type: Phaser.CANVAS` in the config and compare; discuss why WebGL is the default

## Assessment ideas

- A short practical: "make a scene with your name centred at the top, a picture in the bottom right
  corner using `setOrigin`, and a key that changes the text"
- Code reading: give students `Ball.ts` with `this.` removed in three places and the `!` missing
  from a field, and ask them to predict the compiler's messages
- Explain, in two or three sentences, why speeds are multiplied by `delta / 1000`

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
