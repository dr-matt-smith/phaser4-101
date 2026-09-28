// rating.ts - how many stars a game earns
//
// A move is two tiles turned over. With perfect luck every move finds a pair - one move per
// pair - but nobody is that lucky: the first time you see a face, you cannot know where its
// partner is. So the limits are set a little above that.

const THREE_STARS = 1.5;    // up to 1.5 moves per pair: three stars
const TWO_STARS = 2.25;     // up to 2.25 moves per pair: two stars (anything more: one)

export function starsFor(moves: number, pairs: number): number {
  if (moves <= Math.ceil(pairs * THREE_STARS)) {
    return 3;
  }
  if (moves <= Math.ceil(pairs * TWO_STARS)) {
    return 2;
  }
  return 1;
}
