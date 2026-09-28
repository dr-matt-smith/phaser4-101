// Theme.ts - what a set of tiles has to provide, so the game can play with any of them
//
// The game does not care whether it is matching pictures or playing cards. It needs a sprite sheet,
// the size of its frames, which frame is the back, and a way to make a set of pairs. Anything
// that provides those - any class that `implements Theme` - can be played with.
// (Interfaces describe objects with methods as well as data, just as in Java.)

// one tile's face: what it shows, and what it matches
export interface TileFace {
  frame: number;       // the sprite sheet frame shown when the tile is face up
  matchKey: string;    // two tiles match when their matchKeys are the same
}

export interface Theme {
  readonly label: string;         // shown on the menu
  readonly texture: string;       // the sprite sheet's key...
  readonly file: string;          // ...and file
  readonly tileWidth: number;     // the size of one frame
  readonly tileHeight: number;
  readonly backFrame: number;
  readonly maxPairs: number;      // how many different pairs the theme can make
  readonly background?: string;   // optional (the ?): a picture to put behind the board

  // pairs x 2 faces, each pair next to each other (the game shuffles them)
  makeFaces(pairs: number): TileFace[];
}
