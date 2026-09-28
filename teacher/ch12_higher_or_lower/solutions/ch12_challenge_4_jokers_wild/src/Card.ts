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
  public readonly isJoker: boolean; // CHALLENGE 4

  // CHALLENGE 4: a third parameter with a default value, so every existing  new Card(suit, rank)
  // still works and makes an ordinary card
  constructor(suit: Suit, rank: number, isJoker: boolean = false) {
    this.suit = suit;
    this.rank = rank;
    this.isJoker = isJoker;
  }

  // CHALLENGE 4: a joker has no real suit or rank - these are never looked at
  public static joker(): Card {
    return new Card("spades", 0, true);
  }

  // what "higher" and "lower" compare. Aces are low, so the value is just the rank.
  public get value(): number {
    return this.rank;
  }

  // e.g. "Queen of hearts"
  public toString(): string {
    if (this.isJoker) {
      return "Joker"; // CHALLENGE 4
    }
    return `${RANK_NAMES[this.rank]} of ${this.suit}`;
  }
}
