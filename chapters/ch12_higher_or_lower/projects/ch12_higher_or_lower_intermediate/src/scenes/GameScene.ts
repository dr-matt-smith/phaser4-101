import Phaser from "phaser";
import { CORRECT_KEY, FLIP_KEY, PLACE_KEY, TABLE_KEY, WRONG_KEY } from "../assets.ts";
import type { Card } from "../Card.ts";
import { Deck } from "../Deck.ts";
import { Button } from "../objects/Button.ts";
import { CardSprite } from "../objects/CardSprite.ts";
import { type Guess, judge } from "../rules.ts";
import type { GameOverData } from "./GameOverScene.ts";
import { GAME_OVER_SCENE, GAME_SCENE } from "./keys.ts";

// GameScene - one game: a fresh shuffled deck, five right in a row to win, one wrong and you lose
//
// Cards come from a Deck, so no card can turn up twice. The next card turns over with a flip
// animation, and while it does, the buttons and keys are ignored: the scene is "revealing".

const CURRENT_X = 270;
const NEXT_X = 530;
const CARD_Y = 260;
const CARD_SCALE = 1.6;
const IN_A_ROW_TO_WIN = 5;
const PIP_SPACING = 50;
const PAUSE = 900;             // how long a result stays on screen before play moves on (ms)

const PIP_OFF = 0x1d3557;
const PIP_ON = 0xffd166;

// What the game is doing right now. Only "waiting" accepts a guess.
type GameState = "waiting" | "revealing" | "won" | "lost";

export class GameScene extends Phaser.Scene {
  private deck!: Deck;
  private currentCard!: Card;
  private currentSprite!: CardSprite;
  private nextSprite!: CardSprite;
  private higherButton!: Button;
  private lowerButton!: Button;
  private messageText!: Phaser.GameObjects.Text;
  private pips: Phaser.GameObjects.Arc[] = [];
  private state: GameState = "revealing";
  private inARow = 0;

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.state = "revealing";
    this.inARow = 0;
    this.pips = [];
  }

  create(): void {
    this.add.image(400, 300, TABLE_KEY);

    const style = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff", align: "center" };
    this.add.text(400, 35, "Higher or Lower", { ...style, fontSize: "36px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);

    // the streak: five dots that light up, one for each right guess
    this.add.text(250, 95, "In a row:", style).setOrigin(1, 0.5);
    for (let i = 0; i < IN_A_ROW_TO_WIN; i++) {
      const pip = this.add.circle(300 + i * PIP_SPACING, 95, 15, PIP_OFF).setStrokeStyle(3, 0xffffff);
      this.pips.push(pip);
    }

    this.add.text(CURRENT_X, 140, "This card", { ...style, color: "#a8dadc" }).setOrigin(0.5);
    this.add.text(NEXT_X, 140, "Next card", { ...style, color: "#a8dadc" }).setOrigin(0.5);
    this.currentSprite = new CardSprite(this, CURRENT_X, CARD_Y, CARD_SCALE);
    this.nextSprite = new CardSprite(this, NEXT_X, CARD_Y, CARD_SCALE);

    this.messageText = this.add.text(400, 395, "", { ...style, fontSize: "30px" }).setOrigin(0.5);

    this.higherButton = new Button(this, 250, 480, "HIGHER", () => {
      this.guess("higher");
    });
    this.lowerButton = new Button(this, 550, 480, "LOWER", () => {
      this.guess("lower");
    });
    this.add.text(400, 565, "Keys:  H = higher,  L = lower", { ...style, fontSize: "18px", color: "#a8dadc" })
      .setOrigin(0.5);

    this.input.keyboard!.on("keydown-H", () => {
      this.guess("higher");
    });
    this.input.keyboard!.on("keydown-L", () => {
      this.guess("lower");
    });

    // a new, shuffled deck every game; turn over the first card to start
    this.deck = new Deck();
    this.currentCard = this.deck.draw();
    this.setButtonsEnabled(false);
    this.sound.play(FLIP_KEY);
    this.currentSprite.flipTo(this.currentCard, () => {
      this.waitForGuess();
    });
  }

  private waitForGuess(): void {
    this.state = "waiting";
    this.setButtonsEnabled(true);
    this.messageText.setText("Higher or lower?");
  }

  private guess(guess: Guess): void {
    if (this.state !== "waiting") {
      return; // a card is turning over, or the game is over: ignore the click or key
    }
    this.state = "revealing";
    this.setButtonsEnabled(false);
    this.messageText.setText("");

    const next = this.deck.draw();
    this.sound.play(FLIP_KEY);
    this.nextSprite.flipTo(next, () => {
      this.reveal(guess, next);
    });
  }

  // the next card is face up: was the guess right?
  private reveal(guess: Guess, next: Card): void {
    const outcome = judge(guess, this.currentCard, next);

    if (outcome === "wrong") {
      this.state = "lost";
      this.sound.play(WRONG_KEY);
      this.messageText.setText(`${next.toString()} - wrong!`);
      this.time.delayedCall(PAUSE * 2, () => {
        this.gameOver(false, next);
      });
      return;
    }

    if (outcome === "tie") {
      this.sound.play(PLACE_KEY);
      this.messageText.setText(`${next.toString()} - a tie. It does not count.`);
    } else {
      this.inARow = this.inARow + 1;
      this.sound.play(CORRECT_KEY);
      this.messageText.setText(`${next.toString()} - right!`);
      this.lightPip(this.inARow - 1);
    }

    if (this.inARow >= IN_A_ROW_TO_WIN) {
      this.state = "won";
      this.time.delayedCall(PAUSE * 2, () => {
        this.gameOver(true, next);
      });
    } else {
      this.time.delayedCall(PAUSE, () => {
        this.moveOn(next);
      });
    }
  }

  // the card just revealed becomes the card to beat; the next card turns face down again
  private moveOn(next: Card): void {
    this.currentCard = next;
    this.currentSprite.showFace(next);
    this.sound.play(PLACE_KEY);
    this.nextSprite.flipTo(null, () => {
      this.waitForGuess();
    });
  }

  private lightPip(index: number): void {
    const pip = this.pips[index];
    pip.setFillStyle(PIP_ON);
    this.tweens.add({ targets: pip, scale: 1.4, duration: 120, yoyo: true });
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.higherButton.setEnabled(enabled);
    this.lowerButton.setEnabled(enabled);
  }

  private gameOver(won: boolean, lastCard: Card): void {
    const data: GameOverData = { won: won, inARow: this.inARow, lastCard: lastCard.toString() };
    this.scene.start(GAME_OVER_SCENE, data);
  }
}
