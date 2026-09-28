import Phaser from "phaser";
import { Card, SUITS } from "../Card.ts";

// GameScene - the whole game, in one scene
//
// One card is face up. Press H if you think the next card will be higher, L if lower. The next
// card is turned over, and after a short pause it becomes the card to beat. Get five right in a row
// to win; a wrong guess sends you back to zero. Same rank again is a tie: it does not count either
// way.

const CARDS_KEY = "cards";
const CARDS_FILE = "assets/spritesheets/cards.png";
const TABLE_KEY = "table";
const TABLE_FILE = "assets/images/table.png";
const FLIP_KEY = "flip";
const FLIP_FILE = "assets/audio/flip.wav";
const CORRECT_KEY = "correct";
const CORRECT_FILE = "assets/audio/correct.wav";
const WRONG_KEY = "wrong";
const WRONG_FILE = "assets/audio/wrong.wav";
const WIN_KEY = "win";
const WIN_FILE = "assets/audio/win.wav";

const CARD_WIDTH = 80;         // one frame of cards.png
const CARD_HEIGHT = 112;
const BACK_FRAME = 52;         // the blue back, after the 52 faces
const CARD_SCALE = 1.5;
const CURRENT_X = 280;         // where the card to beat sits
const NEXT_X = 520;            // where the next card is turned over
const CARD_Y = 290;
const IN_A_ROW_TO_WIN = 5;
const REVEAL_TIME = 1200;      // how long the turned-over card is shown before play moves on (ms)

type Guess = "higher" | "lower";
type Outcome = "right" | "wrong" | "tie";

// What the game is doing right now. While a card is being revealed, H and L are ignored - otherwise
// a fast player could guess again before seeing the result.
type GameState = "waiting" | "revealing" | "won";

export class GameScene extends Phaser.Scene {
  // The ! says "this is set before it is used" - in create() rather than in the constructor.
  private currentCard!: Card;
  private currentImage!: Phaser.GameObjects.Image;
  private nextImage!: Phaser.GameObjects.Image;
  private messageText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private state: GameState = "waiting";
  private inARow = 0;

  constructor() {
    super("GameScene");
  }

  // runs every time the scene starts - including after "play again" (see Chapter 2)
  init(): void {
    this.state = "waiting";
    this.inARow = 0;
  }

  preload(): void {
    this.load.spritesheet(CARDS_KEY, CARDS_FILE, { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT });
    this.load.image(TABLE_KEY, TABLE_FILE);
    this.load.audio(FLIP_KEY, FLIP_FILE);
    this.load.audio(CORRECT_KEY, CORRECT_FILE);
    this.load.audio(WRONG_KEY, WRONG_FILE);
    this.load.audio(WIN_KEY, WIN_FILE);
  }

  create(): void {
    this.add.image(400, 300, TABLE_KEY);

    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff", align: "center" };
    this.add.text(400, 50, "Higher or Lower", { ...style, fontSize: "44px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(400, 105, "Will the next card be higher or lower?   H = higher,  L = lower", style)
      .setOrigin(0.5);
    this.add.text(CURRENT_X, 175, "This card", { ...style, fontSize: "20px", color: "#a8dadc" }).setOrigin(0.5);
    this.add.text(NEXT_X, 175, "Next card", { ...style, fontSize: "20px", color: "#a8dadc" }).setOrigin(0.5);

    // the first card to beat, face up; the next card, face down
    this.currentCard = Card.random();
    this.currentImage = this.add.image(CURRENT_X, CARD_Y, CARDS_KEY, this.frameFor(this.currentCard))
      .setScale(CARD_SCALE);
    this.nextImage = this.add.image(NEXT_X, CARD_Y, CARDS_KEY, BACK_FRAME).setScale(CARD_SCALE);

    this.messageText = this.add.text(400, 430, "Higher or lower?", { ...style, fontSize: "30px" }).setOrigin(0.5);
    this.streakText = this.add.text(400, 485, "", style).setOrigin(0.5);
    // CHALLENGE 1: the rule on screen matches the new rule
    this.add.text(400, 560, "Same rank again is a tie - it does not count either way. Aces are high.", {
      ...style,
      fontSize: "18px",
      color: "#a8dadc",
    }).setOrigin(0.5);
    this.showStreak();

    this.input.keyboard!.on("keydown-H", () => {
      this.guess("higher");
    });
    this.input.keyboard!.on("keydown-L", () => {
      this.guess("lower");
    });
    this.input.keyboard!.on("keydown-SPACE", () => {
      if (this.state === "won") {
        this.scene.restart();
      }
    });
  }

  // The picture of a card is frame  suit * 13 + (rank - 1)  of cards.png: one row per suit, ace to
  // king. The Card does not know this - pictures are the scene's business, not the card's.
  private frameFor(card: Card): number {
    return SUITS.indexOf(card.suit) * 13 + (card.rank - 1);
  }

  private guess(guess: Guess): void {
    if (this.state !== "waiting") {
      return; // a card is still being revealed, or the game is over
    }
    this.state = "revealing";

    // turn over the next card
    const next = Card.random();
    this.nextImage.setFrame(this.frameFor(next));
    this.sound.play(FLIP_KEY);

    const outcome = this.judge(guess, this.currentCard, next);
    if (outcome === "right") {
      this.inARow = this.inARow + 1;
      this.sound.play(CORRECT_KEY);
      this.messageText.setText(`${next.toString()} - right!`);
    } else if (outcome === "wrong") {
      this.inARow = 0;
      this.sound.play(WRONG_KEY);
      this.messageText.setText(`${next.toString()} - wrong! Back to zero.`);
    } else {
      this.messageText.setText(`${next.toString()} - a tie. Go again.`);
    }
    this.showStreak();

    // leave the result on screen for a moment, then the next card becomes the one to beat
    this.time.delayedCall(REVEAL_TIME, () => {
      this.moveOn(next);
    });
  }

  // Was the guess right? The rules of the game, in one place.
  private judge(guess: Guess, current: Card, next: Card): Outcome {
    if (next.value === current.value) {
      return "tie";
    }
    const wentHigher = next.value > current.value;
    if ((guess === "higher" && wentHigher) || (guess === "lower" && !wentHigher)) {
      return "right";
    }
    return "wrong";
  }

  private moveOn(next: Card): void {
    this.currentCard = next;
    this.currentImage.setFrame(this.frameFor(next));
    this.nextImage.setFrame(BACK_FRAME);

    if (this.inARow >= IN_A_ROW_TO_WIN) {
      this.state = "won";
      this.sound.play(WIN_KEY);
      this.messageText.setText("Five in a row - you win!\nPress SPACE to play again");
    } else {
      this.state = "waiting";
      this.messageText.setText("Higher or lower?");
    }
  }

  private showStreak(): void {
    this.streakText.setText(`Right in a row: ${this.inARow} / ${IN_A_ROW_TO_WIN}`);
  }
}
