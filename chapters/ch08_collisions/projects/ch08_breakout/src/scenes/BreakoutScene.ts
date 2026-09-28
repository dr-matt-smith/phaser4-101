import Phaser from "phaser";
import {
  BALL_FILE, BALL_KEY, BRICK_KEY, BRICK_SOUND, BRICK_SOUND_FILE, LOSE_SOUND, LOSE_SOUND_FILE, PADDLE_KEY,
  PADDLE_SOUND, PADDLE_SOUND_FILE, WIN_SOUND, WIN_SOUND_FILE,
} from "../assets.ts";
import { Ball } from "../objects/Ball.ts";
import { Paddle } from "../objects/Paddle.ts";

// BreakoutScene - knock out every brick with the ball, without letting it past the paddle
//
// Three colliders do all the work: ball and bricks, ball and paddle, and the walls of the world.

const PADDLE_Y = 550;
const PADDLE_WIDTH = 104;
const PADDLE_HEIGHT = 20;

const BRICK_WIDTH = 64;
const BRICK_HEIGHT = 24;
const BRICK_GAP = 6;
const BRICK_COLUMNS = 10;
const BRICK_TOP = 90;
// one colour per row, top to bottom
const ROW_COLOURS = [0xe63946, 0xf4a261, 0xe9c46a, 0x2a9d8f, 0x457b9d, 0xa8dadc];
const POINTS_PER_BRICK = 10;

const START_LIVES = 3;

export class BreakoutScene extends Phaser.Scene {
  private paddle!: Paddle;
  private ball!: Ball;
  private bricks!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hud!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;

  private score = 0;
  private lives = START_LIVES;
  // true while the ball sits on the paddle, waiting to be served
  private serving = true;
  private playing = true;

  constructor() {
    super("BreakoutScene");
  }

  // the scene object is reused when it restarts (Chapter 2): put everything back
  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.serving = true;
    this.playing = true;
  }

  preload(): void {
    this.load.image(BALL_KEY, BALL_FILE);
    this.load.audio(PADDLE_SOUND, PADDLE_SOUND_FILE);
    this.load.audio(BRICK_SOUND, BRICK_SOUND_FILE);
    this.load.audio(LOSE_SOUND, LOSE_SOUND_FILE);
    this.load.audio(WIN_SOUND, WIN_SOUND_FILE);
  }

  create(): void {
    this.makeTextures();

    this.paddle = new Paddle(this, 400, PADDLE_Y);
    this.ball = new Ball(this, 400, PADDLE_Y - 30);
    this.makeBricks();

    // The ball bounces off the left, right and top edges of the world - but not the bottom:
    // there it falls out, and a life is lost
    this.physics.world.setBoundsCollision(true, true, true, false);

    // ball and bricks: a COLLIDER, so the ball bounces. The callback runs after the bounce
    this.physics.add.collider(this.ball, this.bricks, (_ball, brick) => {
      // Phaser's types allow for a body or a tile too; we passed the bricks group, so it is one
      // of its members - and a group makes Arcade Sprites unless told otherwise
      this.hitBrick(brick as Phaser.Physics.Arcade.Sprite);
    });

    // ball and paddle: a collider with a PROCESS CALLBACK (the second function). Phaser asks it
    // first, and if it answers false the two do not collide at all. Only a FALLING ball bounces
    // off the paddle - so a ball that clips the paddle's end on its way up is not turned round
    this.physics.add.collider(
      this.ball,
      this.paddle,
      () => {
        this.ball.bounceOff(this.paddle);
        this.sound.play(PADDLE_SOUND);
      },
      () => {
        return this.ball.isFalling();
      },
    );

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.paddle.moveTo(pointer.x);
    });
    this.input.on("pointerdown", () => {
      this.serveOrRestart();
    });
    this.input.keyboard!.on("keydown-SPACE", () => {
      this.serveOrRestart();
    });

    const style = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff" };
    this.hud = this.add.text(10, 10, "", style);
    this.message = this.add.text(400, 380, "", { ...style, fontSize: "30px", color: "#ffd166", align: "center" });
    this.message.setOrigin(0.5);
    this.showHud();
    this.message.setText("Click or press SPACE to serve");
  }

  override update(): void {
    if (!this.playing) {
      return;
    }
    this.paddle.moveWithKeys(this.cursors);

    // waiting to serve: the ball rides on the paddle
    if (this.serving) {
      this.ball.setPosition(this.paddle.x, PADDLE_Y - 30);
      this.ball.setVelocity(0, 0);
      return;
    }

    // fallen off the bottom of the screen?
    if (this.ball.y > this.scale.height + this.ball.height) {
      this.loseLife();
    }
  }

  private serveOrRestart(): void {
    if (!this.playing) {
      this.scene.restart();
    } else if (this.serving) {
      this.serving = false;
      this.message.setText("");
      this.ball.launch();
    }
  }

  private hitBrick(brick: Phaser.Physics.Arcade.Sprite): void {
    this.sound.play(BRICK_SOUND);

    // gone for good: destroy() removes the brick from the scene, its body from the physics world,
    // and the brick from the group
    brick.destroy();

    this.score += POINTS_PER_BRICK;
    this.showHud();

    if (this.bricks.countActive() === 0) {
      this.endGame("You cleared the wall!", WIN_SOUND);
    }
  }

  private loseLife(): void {
    this.lives--;
    this.showHud();
    if (this.lives <= 0) {
      this.endGame("Game over", LOSE_SOUND);
      return;
    }
    this.sound.play(LOSE_SOUND);
    this.serving = true;
    this.message.setText("Click or press SPACE to serve");
  }

  private endGame(heading: string, sound: string): void {
    this.sound.play(sound);
    this.playing = false;
    this.ball.disableBody(true, true);
    this.paddle.setVelocityX(0);
    this.message.setText(`${heading}\nScore: ${this.score}\n\nClick or press SPACE to play again`);
  }

  private makeBricks(): void {
    this.bricks = this.physics.add.staticGroup();

    const rowWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
    const left = (this.scale.width - rowWidth) / 2 + BRICK_WIDTH / 2;

    ROW_COLOURS.forEach((colour, row) => {
      for (let column = 0; column < BRICK_COLUMNS; column++) {
        const x = left + column * (BRICK_WIDTH + BRICK_GAP);
        const y = BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP);
        const brick = this.bricks.create(x, y, BRICK_KEY) as Phaser.Physics.Arcade.Sprite;
        brick.setTint(colour);   // the brick picture is white, so the tint is its colour
      }
    });
  }

  // Draw the paddle and a brick with Graphics, and save each as a texture - a picture Phaser can
  // use by key, exactly like a loaded image. The scene restarts, so only make them once.
  private makeTextures(): void {
    if (this.textures.exists(PADDLE_KEY)) {
      return;
    }
    const graphics = this.make.graphics({}, false);   // false: made, but not added to the scene

    graphics.fillStyle(0xf1faee);
    graphics.fillRoundedRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    graphics.fillStyle(0xa8dadc);
    graphics.fillRoundedRect(4, PADDLE_HEIGHT - 7, PADDLE_WIDTH - 8, 4, 2);
    graphics.generateTexture(PADDLE_KEY, PADDLE_WIDTH, PADDLE_HEIGHT);

    graphics.clear();
    graphics.fillStyle(0xdddddd);
    graphics.fillRoundedRect(0, 0, BRICK_WIDTH, BRICK_HEIGHT, 4);
    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(3, 3, BRICK_WIDTH - 6, 6, 3);
    graphics.generateTexture(BRICK_KEY, BRICK_WIDTH, BRICK_HEIGHT);

    graphics.destroy();
  }

  private showHud(): void {
    this.hud.setText(`Score: ${this.score}    Lives: ${this.lives}`);
  }
}
