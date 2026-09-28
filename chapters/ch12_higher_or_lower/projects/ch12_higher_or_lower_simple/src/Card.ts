// Card - one playing card, as DATA: a suit and a rank, and nothing about how it is drawn
//
// This class knows nothing about Phaser. It does not know where the card is on the screen, which
// picture shows it, or whether it is face up. That is the job of the scene (and, in the
// intermediate version, of a CardSprite). Keeping the two apart is called model/view separation.

// A union of string literals: a Suit can only ever be one of these four strings. A typo such as
// "heart" is a build error.
export type Suit = "clubs" | "diamonds" | "hearts" | "spades";

// in the same order as the rows of cards.png
export const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];

const RANK_NAMES = ["", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

export class Card {
  // readonly: set once, in the constructor, and never changed - a card does not turn into another
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

  // e.g. "Queen of hearts"
  public toString(): string {
    return `${RANK_NAMES[this.rank]} of ${this.suit}`;
  }

  // any card at all - there is no deck in this version, so the same card can come up twice
  public static random(): Card {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const rank = Math.floor(Math.random() * 13) + 1;
    return new Card(suit, rank);
  }
}
