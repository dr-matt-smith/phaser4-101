import Phaser from "phaser";
import { CRATE_KEY, EXPLODE, EXPLOSION_SHEET, PARTICLE_KEY, STAR_KEY } from "../assets.ts";
import { Button } from "../objects/Button.ts";
import { EASING_SCENE, PLAYGROUND_SCENE } from "./keys.ts";

// PlaygroundScene - buttons that set off tweens, and clicks that set off explosions
//
// A TWEEN changes one or more values of an object - x, scale, alpha, angle... - from what they
// are now to what you ask for, smoothly, over a time you choose. You describe it; Phaser's tween
// manager (this.tweens) does the changing, every frame, and then throws the tween away.

const PLAY_LEFT = 220;             // the buttons are to the left of this; the playground to the right
const CRATE_SCALE = 1.5;
const HOME_X = 510;                // where the crate starts
const HOME_Y = 200;
const STAR_COUNT = 9;
const STAR_Y = 455;
const SPARKS = 40;                 // particles in each explosion

// the keys that press each button, in order - "keydown-ONE" and so on
const KEY_NAMES = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

// CHALLENGE 3: the title - where it starts (above the screen) and where it lands
const TITLE_X = 510;
const TITLE_START_Y = -60;
const TITLE_Y = 110;

export class PlaygroundScene extends Phaser.Scene {
  private crate!: Phaser.GameObjects.Image;
  private stars: Phaser.GameObjects.Image[] = [];
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private description!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;            // CHALLENGE 3
  private score = 0;
  // where the crate rests between tweens (the Move button changes it)
  private restX = HOME_X;
  private restY = HOME_Y;

  constructor() {
    super(PLAYGROUND_SCENE);
  }

  init(): void {
    this.stars = [];
    this.score = 0;
    this.restX = HOME_X;
    this.restY = HOME_Y;
  }

  create(): void {
    this.add.rectangle(0, 0, PLAY_LEFT, 600, 0x262c3b).setOrigin(0, 0);

    this.crate = this.add.image(HOME_X, HOME_Y, CRATE_KEY).setScale(CRATE_SCALE);

    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars.push(this.add.image(290 + i * 55, STAR_Y, STAR_KEY));
    }

    this.description = this.add.text(510, 340, "Press a button (or 1 - 9), or click over here", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
      align: "center",
      wordWrap: { width: 540 },
    }).setOrigin(0.5);

    this.scoreText = this.add.text(510, 545, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.addButtons();
    this.addExplosions();

    // CHALLENGE 3: the title is made once, out of sight, and the T key plays its sequence
    this.title = this.add.text(TITLE_X, TITLE_START_Y, "ANIMATIONS", {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffd166",
      stroke: "#1d3557",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(2);
    this.input.keyboard!.on("keydown-T", () => this.playTitle());
  }

  // CHALLENGE 3: drop in with a bounce, grow and shrink, wobble, hold, fade - one chain.
  // Pressing T again part way through stops the old chain and puts the title back at the start.
  private playTitle(): void {
    this.tweens.killTweensOf(this.title);
    this.title.setPosition(TITLE_X, TITLE_START_Y).setScale(1).setAngle(0).setAlpha(1);

    this.tweens.chain({
      targets: this.title,
      tweens: [
        { y: TITLE_Y, duration: 1000, ease: "Bounce.easeOut" },
        { scale: 1.3, duration: 200, ease: "Quad.easeOut", yoyo: true },
        { angle: { from: -6, to: 6 }, duration: 100, yoyo: true, repeat: 3 },
        { angle: 0, duration: 60 },
        { alpha: 0, delay: 800, duration: 500 },        // delay: hold still, then fade
      ],
    });
    this.show("T: a chain of five tweens on the title");
  }

  private addButtons(): void {
    const buttons: [string, () => void][] = [
      ["Move", () => this.move()],
      ["Pulse", () => this.pulse()],
      ["Fade", () => this.fade()],
      ["Spin", () => this.spin()],
      ["Bounce", () => this.bounce()],
      ["Chain", () => this.chain()],
      ["Stagger", () => this.stagger()],
      ["Counter", () => this.count()],
      ["Easing...", () => this.scene.start(EASING_SCENE)],
    ];

    buttons.forEach(([label, action], i) => {
      new Button(this, PLAY_LEFT / 2, 60 + i * 60, label, action);
      this.input.keyboard!.on(`keydown-${KEY_NAMES[i]}`, action);
    });
  }

  // Before each tween on the crate: stop any tween still running on it, and put it back as it
  // was. Otherwise two tweens fight over the same values - and "there and back" tweens would
  // come back to wherever the last one had got to.
  private resetCrate(): void {
    this.tweens.killTweensOf(this.crate);
    this.crate.setPosition(this.restX, this.restY);
    this.crate.setScale(CRATE_SCALE).setAlpha(1).setAngle(0);
  }

  private show(text: string): void {
    this.description.setText(text);
  }

  // 1. x and y, to somewhere new
  private move(): void {
    this.resetCrate();
    this.restX = Phaser.Math.Between(PLAY_LEFT + 60, 740);
    this.restY = Phaser.Math.Between(80, 260);

    this.tweens.add({
      targets: this.crate,
      x: this.restX,
      y: this.restY,
      duration: 800,
      ease: "Cubic.easeInOut",
    });
    this.show("x and y to a random place - 800 ms, Cubic.easeInOut");
  }

  // 2. bigger, then back again: yoyo plays the tween forwards, then backwards
  private pulse(): void {
    this.resetCrate();
    this.tweens.add({
      targets: this.crate,
      scale: CRATE_SCALE * 1.6,
      duration: 250,
      ease: "Back.easeOut",
      yoyo: true,
    });
    this.show("scale x 1.6 - 250 ms, Back.easeOut, yoyo");
  }

  // 3. fade out, wait, fade back in
  private fade(): void {
    this.resetCrate();
    this.tweens.add({
      targets: this.crate,
      alpha: 0,
      duration: 500,
      hold: 400,               // wait this long at alpha 0 before the yoyo
      yoyo: true,
    });
    this.show("alpha to 0 - 500 ms, hold 400 ms, yoyo");
  }

  // 4. one whole turn. angle is in degrees; "+=360" means "360 more than now"
  private spin(): void {
    this.resetCrate();
    this.tweens.add({
      targets: this.crate,
      angle: "+=360",
      duration: 900,
      ease: "Cubic.easeInOut",
    });
    this.show('angle "+=360" - 900 ms, Cubic.easeInOut');
  }

  // 5. up and down three times: repeat 2 means "and twice more"
  private bounce(): void {
    this.resetCrate();
    this.tweens.add({
      targets: this.crate,
      y: this.restY - 100,
      duration: 300,
      ease: "Quad.easeOut",
      yoyo: true,
      repeat: 2,
    });
    this.show("y up 100 - 300 ms, Quad.easeOut, yoyo, repeat 2");
  }

  // 6. a chain: each tween starts when the one before it finishes
  private chain(): void {
    this.resetCrate();
    this.tweens.chain({
      targets: this.crate,
      tweens: [
        { y: this.restY - 120, duration: 400, ease: "Quad.easeOut" },
        { angle: 360, duration: 500, ease: "Cubic.easeInOut" },
        { y: this.restY, duration: 700, ease: "Bounce.easeOut" },
        { scaleX: CRATE_SCALE * 1.4, scaleY: CRATE_SCALE * 0.6, duration: 120, yoyo: true },
      ],
    });
    this.show("a chain: up, spin, drop with Bounce.easeOut, squash");
  }

  // 7. one tween, nine targets - each one starting 60 ms after the one before
  private stagger(): void {
    this.tweens.killTweensOf(this.stars);
    for (const star of this.stars) {
      star.y = STAR_Y;
    }

    this.tweens.add({
      targets: this.stars,
      y: STAR_Y - 80,
      duration: 300,
      ease: "Quad.easeOut",
      yoyo: true,
      delay: this.tweens.stagger(60),
    });
    this.show("nine stars, one tween: y up 80, delay: this.tweens.stagger(60)");
  }

  // 8. a tween with no target - just a number, counting from one value to another
  private count(): void {
    const from = this.score;
    const gain = Phaser.Math.Between(100, 500);
    this.score = this.score + gain;
    this.floatText(`+${gain}`);

    this.tweens.addCounter({
      from: from,
      to: this.score,
      duration: 1200,
      ease: "Cubic.easeOut",
      onUpdate: (tween) => {
        // getValue() is number | null; "?? 0" means "or 0, if it is null"
        this.scoreText.setText(`Score: ${Math.round(tween.getValue() ?? 0)}`);
      },
    });
    this.show(`addCounter from ${from} to ${this.score} - 1200 ms, Cubic.easeOut`);
  }

  // a "+123" that floats up from the score and fades away - then removes itself
  private floatText(text: string): void {
    const popup = this.add.text(this.scoreText.x + 120, this.scoreText.y, text, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: popup.y - 70,
      alpha: 0,
      duration: 900,
      ease: "Quad.easeOut",
      onComplete: () => {
        popup.destroy();       // finished with: remove it from the scene
      },
    });
  }

  // clicks in the playground (not on a button): an explosion animation, plus a burst of particles
  private addExplosions(): void {
    // ONE emitter, made now, emitting nothing (emitting: false) until explode() is called
    this.sparks = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 80, max: 360 },            // a random speed for each particle...
      angle: { min: 0, max: 360 },             // ...in a random direction
      lifespan: { min: 400, max: 900 },        // milliseconds each particle lives
      scale: { start: 2.5, end: 0 },           // shrinks away...
      alpha: { start: 1, end: 0 },             // ...and fades, over its life
      tint: [0xffd166, 0xf4a261, 0xe63946, 0xffffff],   // one of these colours each
      gravityY: 300,
      blendMode: "ADD",                        // overlapping particles add up to brighter light
      emitting: false,
    });
    this.sparks.setDepth(1);                   // drawn in front of everything else

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length === 0 && pointer.x > PLAY_LEFT) {
        this.explode(pointer.x, pointer.y);
      }
    });
  }

  private explode(x: number, y: number): void {
    // a new sprite for every explosion, which removes itself when its animation completes
    const boom = this.add.sprite(x, y, EXPLOSION_SHEET).setScale(1.5);
    boom.play(EXPLODE);
    boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      boom.destroy();
    });

    this.sparks.explode(SPARKS, x, y);
    this.cameras.main.shake(150, 0.006);
  }
}
