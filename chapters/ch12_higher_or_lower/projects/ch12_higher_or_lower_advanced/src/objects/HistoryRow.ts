import Phaser from "phaser";
import { CARDS_KEY } from "../assets.ts";
import type { Card } from "../Card.ts";
import { CardSprite } from "./CardSprite.ts";

// HistoryRow - a row of small cards along the bottom of the table: the cards played so far, newest
// on the right. When the row is full, the oldest fades away and the rest slide along.
//
// A Container, so the whole row can be placed (and moved) as one; the cards' positions inside it
// are relative to its left end.

const MAX_CARDS = 12;
const SPACING = 56;
const SCALE = 0.6;
const SLIDE_TIME = 250;

export class HistoryRow extends Phaser.GameObjects.Container {
  private images: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
  }

  // (Container already has a method called add(), for adding game objects - hence addCard.)
  public addCard(card: Card): void {
    // the new card starts one place to the right of the end of the row, invisible...
    const image = this.scene.add.image(this.images.length * SPACING, 0, CARDS_KEY, CardSprite.frameFor(card))
      .setScale(SCALE)
      .setAlpha(0);
    this.add(image);
    this.images.push(image);

    // ...the oldest fades out if there are too many...
    if (this.images.length > MAX_CARDS) {
      const oldest = this.images.shift()!; // shift() takes the first item off an array
      this.scene.tweens.add({
        targets: oldest,
        alpha: 0,
        duration: SLIDE_TIME,
        onComplete: () => {
          oldest.destroy();
        },
      });
    }

    // ...and every card slides into its place, fading in
    this.images.forEach((cardImage, index) => {
      this.scene.tweens.add({
        targets: cardImage,
        x: index * SPACING,
        alpha: 1,
        duration: SLIDE_TIME,
        ease: "Cubic.easeOut",
      });
    });
  }
}
