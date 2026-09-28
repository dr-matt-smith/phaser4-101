import Phaser from "phaser";
import { CARDS_KEY } from "../assets.ts";
import { type Card, SUITS } from "../Card.ts";

// CardSprite - a card on the table: the VIEW of a Card
//
// A Card (src/Card.ts) is the data - suit and rank. A CardSprite is a picture on the screen that
// can show a card's face or its back, and turn over with a flip animation. The scene keeps the two
// apart: the rules look at Cards, the player looks at CardSprites.

export const BACK_FRAME = 52;       // the blue back, after the 52 faces in cards.png
const FLIP_TIME = 300;               // the whole flip, in milliseconds - half to close, half to open

export class CardSprite extends Phaser.GameObjects.Image {
  // the scale the card is drawn at when it is not in the middle of a flip
  private baseScale: number;

  constructor(scene: Phaser.Scene, x: number, y: number, scale: number) {
    super(scene, x, y, CARDS_KEY, BACK_FRAME);
    this.baseScale = scale;
    this.setScale(scale);
    scene.add.existing(this);
  }

  // Which frame of cards.png shows this card: one row of 13 per suit, ace to king.
  public static frameFor(card: Card): number {
    return SUITS.indexOf(card.suit) * 13 + (card.rank - 1);
  }

  // change the picture straight away, with no animation
  public showFace(card: Card): void {
    this.setFrame(CardSprite.frameFor(card));
  }

  public showBack(): void {
    this.setFrame(BACK_FRAME);
  }

  // Turn the card over to show `card` (or its back, if card is null), then call onComplete.
  //
  // A card has no thickness, so a flip is a trick: squash it to nothing across (scaleX 0), change
  // the picture while it cannot be seen, and stretch it back out. A tween chain plays the two
  // halves one after the other (Chapter 7).
  public flipTo(card: Card | null, onComplete: () => void): void {
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        {
          scaleX: 0,
          duration: FLIP_TIME / 2,
          ease: "Sine.easeIn",
          onComplete: () => {
            if (card === null) {
              this.showBack();
            } else {
              this.showFace(card);
            }
          },
        },
        {
          scaleX: this.baseScale,
          duration: FLIP_TIME / 2,
          ease: "Sine.easeOut",
        },
      ],
      onComplete: onComplete,
    });
  }
}
