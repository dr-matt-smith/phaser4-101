import { Card, SUITS } from "./Card.ts";

// Deck - 52 cards, shuffled, dealt from the top one at a time
//
// Like Card, this is plain TypeScript with no Phaser in it: a deck is a list of cards and some
// rules, whatever the game looks like.

export class Deck {
  private cards: Card[] = [];

  constructor() {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  // The Fisher-Yates shuffle. Work backwards through the deck; swap each card with a card chosen
  // at random from the ones not yet placed (itself included). Every one of the 52! possible orders
  // is exactly as likely as every other.
  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // 0 to i, inclusive
      const swap = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = swap;
    }
  }

  // take the top card off the deck
  public draw(): Card {
    const card = this.cards.pop();
    if (card === undefined) {
      throw new Error("The deck is empty");
    }
    return card;
  }

  // CHALLENGE 2: how many cards are still in the deck. A getter, so it reads like a field -
  // deck.size - but cannot be changed from outside.
  public get size(): number {
    return this.cards.length;
  }

  public isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
