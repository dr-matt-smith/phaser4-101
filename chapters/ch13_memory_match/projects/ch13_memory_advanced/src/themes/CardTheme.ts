import Phaser from "phaser";
import { TABLE_KEY } from "../assets.ts";
import type { Theme, TileFace } from "./Theme.ts";

// CardTheme - playing cards from cards.png: a pair is two cards of the same RANK and COLOUR
//
// So the seven of hearts matches the seven of diamonds (both red), and the king of clubs matches
// the king of spades (both black) - but the seven of hearts does NOT match the seven of spades.
// The two tiles of a pair show DIFFERENT pictures: that is why a tile's face has a matchKey,
// and not just a frame number.
//
// cards.png has 13 cards per row (A 2 3 ... 10 J Q K), one row per suit: clubs, diamonds,
// hearts, spades. Frame = suit * 13 + (rank - 1). Frame 52 is a blue back.

const CLUBS = 0;
const DIAMONDS = 1;
const HEARTS = 2;
const SPADES = 3;
const RANKS = 13;

export class CardTheme implements Theme {
  public readonly label = "Cards";
  public readonly texture = "cards";
  public readonly file = "assets/spritesheets/cards.png";
  public readonly tileWidth = 80;
  public readonly tileHeight = 112;
  public readonly backFrame = 52;
  public readonly maxPairs = RANKS * 2;     // every rank, in red and in black
  public readonly background = TABLE_KEY;

  public makeFaces(pairs: number): TileFace[] {
    // every pair there could be - 13 ranks x 2 colours - in a random order
    const kinds: { rank: number; red: boolean }[] = [];
    for (let rank = 1; rank <= RANKS; rank++) {
      kinds.push({ rank: rank, red: true }, { rank: rank, red: false });
    }
    Phaser.Utils.Array.Shuffle(kinds);

    const faces: TileFace[] = [];
    for (const kind of kinds.slice(0, pairs)) {
      const suits = kind.red ? [HEARTS, DIAMONDS] : [CLUBS, SPADES];
      const matchKey = `${kind.rank} ${kind.red ? "red" : "black"}`;
      for (const suit of suits) {
        faces.push({ frame: suit * RANKS + (kind.rank - 1), matchKey: matchKey });
      }
    }
    return faces;
  }
}
