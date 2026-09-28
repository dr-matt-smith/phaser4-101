import Phaser from "phaser";
import {
  CARDS_KEY,
  COIN_KEY,
  CORRECT_KEY,
  FLIP_KEY,
  HEART_KEY,
  PARTICLE_KEY,
  PLACE_KEY,
  TABLE_KEY,
  WRONG_KEY,
} from "../assets.ts";
import type { Card } from "../Card.ts";
import { Deck } from "../Deck.ts";
import { Button } from "../objects/Button.ts";
import { BACK_FRAME, CardSprite } from "../objects/CardSprite.ts";
import { HistoryRow } from "../objects/HistoryRow.ts";
import { Records } from "../Records.ts";
import { type Guess, judge, pointsFor, riskMultiplier } from "../rules.ts";
import type { GameOverData } from "./GameOverScene.ts";
import { GAME_OVER_SCENE, GAME_SCENE } from "./keys.ts";

// GameScene - one game, played right through a single shuffled deck
//
// Every right guess adds points to the POT - more for a risky guess, and more the longer the run.
// CASH OUT banks the pot into the score, safe for good. A wrong guess loses the pot AND a life.
// The game ends when the last life goes, or when the deck runs out (and the pot is banked).

const DECK_X = 130;            // the face-down deck the cards are dealt from
const CURRENT_X = 360;
const NEXT_X = 590;
const CARD_Y = 210;
const CARD_SCALE = 1.4;
const START_LIVES = 3;
const PAUSE = 900;             // how long a result stays on screen before play moves on (ms)
const END_PAUSE = 1600;        // ... and before the game over screen

// What the game is doing right now. Only "waiting" accepts a guess or a cash out.
// CHALLENGE 5: "gambling" - a double-or-nothing card is being dealt; no guesses or cash outs
type GameState = "dealing" | "waiting" | "revealing" | "gambling" | "over";

export class GameScene extends Phaser.Scene {
  private deck!: Deck;
  private currentCard!: Card;
  private currentSprite!: CardSprite;
  private nextSprite!: CardSprite;
  private deckPile!: Phaser.GameObjects.Image;
  private history!: HistoryRow;
  private hearts: Phaser.GameObjects.Image[] = [];
  private higherButton!: Button;
  private lowerButton!: Button;
  private cashOutButton!: Button;
  private scoreText!: Phaser.GameObjects.Text;
  private potText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private sparkles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private state: GameState = "dealing";
  private lives = START_LIVES;
  private score = 0;             // banked: safe
  private pot = 0;               // at risk until cashed out
  private inARow = 0;
  private bestInARow = 0;        // the longest run this game
  private cardsPlayed = 0;

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.state = "dealing";
    this.lives = START_LIVES;
    this.score = 0;
    this.pot = 0;
    this.inARow = 0;
    this.bestInARow = 0;
    this.cardsPlayed = 0;
    this.hearts = [];
  }

  create(): void {
    this.add.image(400, 300, TABLE_KEY);
    this.createHud();
    this.createTable();
    this.createControls();

    // a burst of sparkles for cashing out (Chapter 7) - it waits, emitting nothing, until explode()
    this.sparkles = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 80, max: 260 },
      lifespan: 700,
      scale: { start: 0.8, end: 0 },
      tint: 0xffd166,
      emitting: false,
    });

    // a new, shuffled deck every game; deal the first card
    this.deck = new Deck();
    this.currentCard = this.deck.draw();
    this.cardsPlayed = 1;
    this.dealTo(this.currentSprite, CURRENT_X, this.currentCard, () => {
      this.waitForGuess();
    });
  }

  // ---- building the screen ----

  private createHud(): void {
    const style = { fontFamily: "Arial", fontSize: "28px", fontStyle: "bold", color: "#ffffff" };
    this.scoreText = this.add.text(20, 28, "", style).setOrigin(0, 0.5);
    this.potText = this.add.text(400, 28, "", { ...style, color: "#ffd166" }).setOrigin(0.5);
    this.streakText = this.add.text(400, 64, "", { ...style, fontSize: "20px", fontStyle: "normal", color: "#a8dadc" })
      .setOrigin(0.5);

    for (let i = 0; i < START_LIVES; i++) {
      this.hearts.push(this.add.image(700 + i * 40, 28, HEART_KEY));
    }
    this.updateHud();
  }

  private createTable(): void {
    const style = { fontFamily: "Arial", fontSize: "20px", color: "#a8dadc" };
    this.add.text(DECK_X, 100, "Deck", style).setOrigin(0.5);
    this.add.text(CURRENT_X, 100, "This card", style).setOrigin(0.5);
    this.add.text(NEXT_X, 100, "Next card", style).setOrigin(0.5);

    this.deckPile = this.add.image(DECK_X, CARD_Y, CARDS_KEY, BACK_FRAME).setScale(CARD_SCALE);
    this.currentSprite = new CardSprite(this, DECK_X, CARD_Y, CARD_SCALE);
    this.nextSprite = new CardSprite(this, DECK_X, CARD_Y, CARD_SCALE).setVisible(false);

    this.messageText = this.add.text(400, 322, "", { ...style, fontSize: "26px", color: "#ffffff" }).setOrigin(0.5);

    this.add.text(400, 488, "Cards played", { ...style, fontSize: "16px" }).setOrigin(0.5);
    this.history = new HistoryRow(this, 92, 545);
  }

  private createControls(): void {
    this.higherButton = new Button(this, 160, 395, "HIGHER", () => {
      this.guess("higher");
    });
    this.cashOutButton = new Button(this, 400, 395, "CASH OUT", () => {
      this.cashOut();
    });
    this.lowerButton = new Button(this, 640, 395, "LOWER", () => {
      this.guess("lower");
    });
    this.setButtonsEnabled(false);

    // CHALLENGE 5: D for double or nothing
    this.add.text(400, 448, "Keys:  H = higher,  L = lower,  C = cash out,  D = double or nothing", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    this.input.keyboard!.on("keydown-H", () => {
      this.guess("higher");
    });
    this.input.keyboard!.on("keydown-L", () => {
      this.guess("lower");
    });
    this.input.keyboard!.on("keydown-C", () => {
      this.cashOut();
    });
    // CHALLENGE 5
    this.input.keyboard!.on("keydown-D", () => {
      this.doubleOrNothing();
    });
  }

  // ---- playing ----

  // Deal a card: it slides face down from the deck to x, then flips over. It is brought to the top
  // of the display list, so it passes OVER the card to beat on its way across.
  private dealTo(sprite: CardSprite, x: number, card: Card, onComplete: () => void): void {
    this.children.bringToTop(sprite);
    sprite.setPosition(DECK_X, CARD_Y).setVisible(true);
    sprite.showBack();
    this.sound.play(PLACE_KEY);
    sprite.slideTo(x, CARD_Y, () => {
      this.sound.play(FLIP_KEY);
      sprite.flipTo(card, onComplete);
    });
  }

  private waitForGuess(): void {
    this.state = "waiting";
    // CHALLENGE 5: remind the player that D is possible once there is a pot
    this.messageText.setText(this.pot > 0 ? "Higher, lower, cash out - or D: double or nothing?" : "Higher or lower?");

    // show what each guess would pay; a guess that cannot win ("higher" on a king) is switched off
    const higher = riskMultiplier("higher", this.currentCard);
    const lower = riskMultiplier("lower", this.currentCard);
    this.higherButton.setText(higher > 0 ? `HIGHER  x${higher}` : "HIGHER");
    this.lowerButton.setText(lower > 0 ? `LOWER  x${lower}` : "LOWER");
    this.higherButton.setEnabled(higher > 0);
    this.lowerButton.setEnabled(lower > 0);
    this.cashOutButton.setEnabled(this.pot > 0);
  }

  private guess(guess: Guess): void {
    const multiplier = riskMultiplier(guess, this.currentCard);
    if (this.state !== "waiting" || multiplier === 0) {
      return;
    }
    this.state = "revealing";
    this.setButtonsEnabled(false);
    this.messageText.setText("");

    const next = this.deck.draw();
    this.cardsPlayed = this.cardsPlayed + 1;
    this.deckPile.setVisible(!this.deck.isEmpty()); // the last card leaves an empty space
    this.dealTo(this.nextSprite, NEXT_X, next, () => {
      this.reveal(guess, next, multiplier);
    });
  }

  // the next card is face up: was the guess right?
  private reveal(guess: Guess, next: Card, multiplier: number): void {
    const outcome = judge(guess, this.currentCard, next);

    if (outcome === "right") {
      this.inARow = this.inARow + 1;
      this.bestInARow = Math.max(this.bestInARow, this.inARow);
      const points = pointsFor(multiplier, this.inARow);
      this.pot = this.pot + points;
      this.sound.play(CORRECT_KEY);
      this.messageText.setText(`${next.toString()} - right!`);
      this.floatText(`+${points}`, NEXT_X, CARD_Y - 40, "#ffd166");
      this.pulse(this.potText);
    } else if (outcome === "tie") {
      this.sound.play(PLACE_KEY);
      this.messageText.setText(`${next.toString()} - a tie. It does not count.`);
    } else {
      this.loseLife(next);
    }
    this.updateHud();

    this.time.delayedCall(PAUSE, () => {
      this.moveOn(next);
    });
  }

  private loseLife(next: Card): void {
    const lost = this.pot;
    this.lives = this.lives - 1;
    this.pot = 0;
    this.inARow = 0;
    this.sound.play(WRONG_KEY);
    this.cameras.main.shake(250, 0.01);
    this.messageText.setText(lost > 0 ? `${next.toString()} - wrong! The pot of ${lost} is lost.` : `${next.toString()} - wrong!`);

    // the heart for the life just lost pops and fades
    const heart = this.hearts[this.lives];
    this.tweens.add({ targets: heart, scale: 1.8, alpha: 0, duration: 400, ease: "Cubic.easeOut" });
  }

  // The revealed card slides across to become the card to beat. The old one goes into the history
  // row. The two CardSprites swap jobs, so no game objects are made or destroyed.
  private moveOn(next: Card): void {
    this.history.addCard(this.currentCard);
    this.currentCard = next;

    const oldCurrent = this.currentSprite;
    this.currentSprite = this.nextSprite;
    this.nextSprite = oldCurrent;
    this.nextSprite.setVisible(false);

    this.currentSprite.slideTo(CURRENT_X, CARD_Y, () => {
      if (this.lives === 0) {
        this.endGame("Out of lives!");
      } else if (this.deck.isEmpty()) {
        this.endGame("That was the last card!");
      } else {
        this.waitForGuess();
      }
    });
  }

  private cashOut(): void {
    if (this.state !== "waiting" || this.pot === 0) {
      return;
    }
    const banked = this.pot;
    this.score = this.score + this.pot;
    this.pot = 0;
    this.inARow = 0; // cashing out ends the run: the next right guess starts the pot again
    this.sound.play(COIN_KEY);
    this.sparkles.explode(30, this.scoreText.x + this.scoreText.width / 2, this.scoreText.y);
    this.pulse(this.scoreText);
    this.updateHud();
    this.waitForGuess();
    this.messageText.setText(`${banked} banked! Higher or lower?`);
  }

  // CHALLENGE 5: instead of cashing out, gamble the pot on the colour of one card. Red doubles it
  // and banks it; black loses it. Either way the run is over, as with cashing out.
  private doubleOrNothing(): void {
    if (this.state !== "waiting" || this.pot === 0) {
      return;
    }
    this.state = "gambling";
    this.setButtonsEnabled(false);
    this.messageText.setText("Double or nothing: red doubles the pot, black loses it...");

    const card = this.deck.draw();
    this.cardsPlayed = this.cardsPlayed + 1;
    this.deckPile.setVisible(!this.deck.isEmpty());
    this.dealTo(this.nextSprite, NEXT_X, card, () => {
      this.settleGamble(card);
    });
  }

  // CHALLENGE 5: the gamble card is face up - pay out or take the pot
  private settleGamble(card: Card): void {
    const pot = this.pot;
    if (card.isRed) {
      this.score = this.score + pot * 2;
      this.sound.play(COIN_KEY);
      this.sparkles.explode(40, this.scoreText.x + this.scoreText.width / 2, this.scoreText.y);
      this.floatText(`+${pot * 2}`, NEXT_X, CARD_Y - 40, "#ffd166");
      this.pulse(this.scoreText);
      this.messageText.setText(`${card.toString()} - red! ${pot * 2} banked.`);
    } else {
      this.sound.play(WRONG_KEY);
      this.cameras.main.shake(250, 0.01);
      this.messageText.setText(`${card.toString()} - black. The pot of ${pot} is gone.`);
    }
    this.pot = 0;
    this.inARow = 0;
    this.updateHud();

    // the gamble card joins the history; the card to beat stays where it is
    this.time.delayedCall(PAUSE * 1.5, () => {
      this.history.addCard(card);
      this.nextSprite.setVisible(false);
      if (this.deck.isEmpty()) {
        this.endGame("That was the last card!");
      } else {
        this.waitForGuess();
      }
    });
  }

  private endGame(reason: string): void {
    this.state = "over";
    this.setButtonsEnabled(false);

    // whatever is still in the pot when the deck runs out is yours; lost lives already emptied it
    this.score = this.score + this.pot;
    this.pot = 0;
    this.updateHud();
    this.messageText.setText(reason);

    const records = new Records();
    const newRecords = records.submit(this.score, this.bestInARow);
    const data: GameOverData = {
      reason: reason,
      score: this.score,
      bestInARow: this.bestInARow,
      cardsPlayed: this.cardsPlayed,
      ...newRecords,
    };
    this.time.delayedCall(END_PAUSE, () => {
      this.scene.start(GAME_OVER_SCENE, data);
    });
  }

  // ---- polish ----

  private updateHud(): void {
    this.scoreText.setText(`Score ${this.score}`);
    this.potText.setText(`Pot ${this.pot}`);
    this.streakText.setText(`In a row: ${this.inARow}     Best this game: ${this.bestInARow}`);
  }

  // a bit of text that rises and fades away, e.g. "+30"
  private floatText(text: string, x: number, y: number, colour: string): void {
    const label = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "34px",
      fontStyle: "bold",
      color: colour,
      stroke: "#1b1f2a",
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: label,
      y: y - 60,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => {
        label.destroy();
      },
    });
  }

  // a quick grow-and-shrink, to draw the eye to something that changed
  private pulse(target: Phaser.GameObjects.Text): void {
    this.tweens.add({ targets: target, scale: 1.25, duration: 120, yoyo: true });
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.higherButton.setEnabled(enabled);
    this.lowerButton.setEnabled(enabled);
    this.cashOutButton.setEnabled(enabled);
  }
}
