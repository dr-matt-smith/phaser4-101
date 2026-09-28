// Card - one playing card, as DATA: a suit and a rank, and nothing about how it is drawn
//
// This class knows nothing about Phaser. Where a card is on the screen, which picture shows it and
// whether it is face up are the business of CardSprite (src/objects/CardSprite.ts). Keeping the
// two apart is called model/view separation.

// A union of string literals: a Suit can only ever be one of these four strings.
export type Suit = "clubs" | "diamonds" | "hearts" | "spades";

// in the same order as the rows of cards.png
export const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];

const RANK_NAMES = ["", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

export class Card {
  public readonly suit: Suit;
  public readonly rank: number; // 1 = ace, 2 - 10, 11 = jack, 12 = queen, 13 = king

  constructor(suit: Suit, rank: number) {
    this.suit = suit;
    this.rank = rank;
  }

  // what "higher" and "lower" compare. Aces are low, so the value is just the rank.
  public get value(): number {
    return this.rank;
  }

  // CHALLENGE 5: diamonds and hearts are the red suits
  public get isRed(): boolean {
    return this.suit === "diamonds" || this.suit === "hearts";
  }

  // e.g. "Queen of hearts"
  public toString(): string {
    return `${RANK_NAMES[this.rank]} of ${this.suit}`;
  }
}
