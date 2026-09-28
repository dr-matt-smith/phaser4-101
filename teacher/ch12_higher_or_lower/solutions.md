# Chapter 12 - Higher or lower: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment (`<!-- CHALLENGE n -->`
in HTML).

---

## 1. Aces high

**Project:** [solutions/ch12_challenge_1_aces_high](solutions/ch12_challenge_1_aces_high/)
(from `ch12_higher_or_lower_simple`)

**Goal:** see the point of `value` being separate from `rank`.

`src/Card.ts`
```ts
// what "higher" and "lower" compare.
// CHALLENGE 1: aces are high - an ace is worth 14, one more than a king. The rank stays 1, so the
// ace's picture (and toString) are unchanged: only the rules see the difference.
public get value(): number {
  return this.rank === 1 ? 14 : this.rank;
}
```

plus the rule text at the bottom of `GameScene` changed to "Aces are high".

One line of rules. `judge()` compares `value`, so it needs no change; `frameFor()` uses `rank`, so the
ace still shows the ace picture. Tested with the harness: king face up, H, an ace drawn - "Ace of
clubs - right!".

**Look for:** the change made in `value`, not `rank`. The most common wrong answer is to make an
ace's **rank** 14 (in `random()` or the constructor). The rules then work, but the picture breaks:
`frameFor()` gives `suit * 13 + 13`, the *next* suit's ace - and the ace of spades becomes frame 52,
a card back. This is the model/view point of the chapter in miniature; worth showing the class.

---

## 2. Cards left

**Project:** [solutions/ch12_challenge_2_cards_left](solutions/ch12_challenge_2_cards_left/)
(from `ch12_higher_or_lower_intermediate`)

**Goal:** add to a class's public interface without exposing its insides.

`src/Deck.ts`
```ts
// CHALLENGE 2: how many cards are still in the deck. A getter, so it reads like a field -
// deck.size - but cannot be changed from outside.
public get size(): number {
  return this.cards.length;
}
```

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 2: called after every draw()
private showCardsLeft(): void {
  this.cardsLeftText.setText(`Cards left: ${this.deck.size}`);
}
```

`showCardsLeft()` is called straight after both `draw()` calls (the first card in `create()`, and in
`guess()`). Tested: 51 at the start, 50 after one guess.

**Look for:** a getter or method on `Deck`, not `cards` made `public` - that would let the scene
push and pop cards itself. A student who updates the text in `update()` every frame has a working
answer; ask whether it needs to change 60 times a second.

---

## 3. Probability hint

**Project:** [solutions/ch12_challenge_3_probability_hint](solutions/ch12_challenge_3_probability_hint/)
(from `ch12_higher_or_lower_intermediate`)

**Goal:** ask the model a question by passing it a function.

`src/Deck.ts`
```ts
// CHALLENGE 3: how many of the cards left pass a test. The test is a function that takes a card
// and says true or false - e.g.  deck.countWhere((card) => card.value > 7)
public countWhere(test: (card: Card) => boolean): number {
  return this.cards.filter(test).length;
}
```

`src/scenes/GameScene.ts`
```ts
private showChances(): void {
  const current = this.currentCard.value;
  const higher = this.deck.countWhere((card) => card.value > current);
  const lower = this.deck.countWhere((card) => card.value < current);
  this.higherHint.setText(`${this.percent(higher)} chance`);
  this.lowerHint.setText(`${this.percent(lower)} chance`);
}

// CHALLENGE 3: e.g. 31 of 50 cards -> "62%"
private percent(count: number): string {
  return `${Math.round((count / this.deck.size) * 100)}%`;
}
```

`showChances()` is called at the end of `waitForGuess()`, and `guess()` clears both hints. Tested:
king of diamonds face up, 51 cards left - "0% chance" and "94% chance" (48 of 51).

**Look for:**
- counting the *deck*, not the 13 ranks - the challenge says so, and it is what makes the hint
  interesting late in a game
- the two chances not adding up to 100%: the cards of the same rank are ties. A good discussion
  point
- `(card: Card) => boolean` as a parameter type - Java's `Predicate<Card>`. A student who adds
  `countHigher(value)` and `countLower(value)` to `Deck` has a fine answer; `countWhere` is more
  general
- hints hidden during the reveal (otherwise they show stale numbers for the old card)

---

## 4. Jokers wild

**Project:** [solutions/ch12_challenge_4_jokers_wild](solutions/ch12_challenge_4_jokers_wild/)
(from `ch12_higher_or_lower_intermediate`)

**Goal:** extend the model and the view in step, and make a texture in code.

The model - `src/Card.ts`, `src/Deck.ts`, `src/rules.ts`:
```ts
// CHALLENGE 4: a third parameter with a default value, so every existing  new Card(suit, rank)
// still works and makes an ordinary card
constructor(suit: Suit, rank: number, isJoker: boolean = false) {
...
// CHALLENGE 4: two jokers, shuffled in with the rest
this.cards.push(Card.joker(), Card.joker());
...
// CHALLENGE 4: jokers are wild - whatever you guessed, a joker makes it right
if (next.isJoker) {
  return "right";
}
```

The picture - `src/scenes/PreloadScene.ts` draws a cream card with a gold star using `Graphics`, and
saves it:
```ts
graphics.generateTexture(JOKER_KEY, CARD_WIDTH, CARD_HEIGHT);
graphics.destroy();
```

The view - `src/objects/CardSprite.ts`:
```ts
// CHALLENGE 4: a joker is a different texture, so setTexture (picture AND frame), not just setFrame
public showFace(card: Card): void {
  if (card.isJoker) {
    this.setTexture(JOKER_KEY);
  } else {
    this.setTexture(CARDS_KEY, CardSprite.frameFor(card));
  }
}
```

and `showBack()` becomes `setTexture(CARDS_KEY, BACK_FRAME)`, or a sprite that once showed a joker
could never show the back again.

The scene - `src/scenes/GameScene.ts`:
```ts
// CHALLENGE 4: a card that can be guessed against - jokers drawn here are put aside
private drawPlayable(): Card {
  let card = this.deck.draw();
  while (card.isJoker) {
    card = this.deck.draw();
  }
  return card;
}
```

used for the first card, and in `moveOn()` when the revealed card is a joker. Tested with a rigged
deck: 2 face up, L, a joker - "Joker - right!", streak 1; the next card to beat is the 9 under it,
and the next card turns back to the blue back (texture `cards`, frame 52).

**Look for:**
- the default parameter, so no existing `new Card(...)` call changed
- `setTexture` rather than `setFrame` - a student who writes `setFrame(JOKER_KEY)` gets the console
  warning `Texture "cards" has no frame "joker"`, and the sprite shows frame 0 (the ace of clubs)
  instead
- the joker handled in `judge()` (the model), not by special-casing the scene's messages
- the texture made after loading, in `create()` (or at the start of `GameScene`), with the
  `Graphics` destroyed afterwards
- a joker never becoming the card to beat - otherwise `judge()` compares against rank 0, and
  "lower" can never win

---

## 5. Double or nothing

**Project:** [solutions/ch12_challenge_5_double_or_nothing](solutions/ch12_challenge_5_double_or_nothing/)
(from `ch12_higher_or_lower_advanced`)

**Goal:** add a new state to the state machine, and a new action that uses the existing pieces.

`src/Card.ts`
```ts
// CHALLENGE 5: diamonds and hearts are the red suits
public get isRed(): boolean {
  return this.suit === "diamonds" || this.suit === "hearts";
}
```

`src/scenes/GameScene.ts`
```ts
// CHALLENGE 5: "gambling" - a double-or-nothing card is being dealt; no guesses or cash outs
type GameState = "dealing" | "waiting" | "revealing" | "gambling" | "over";
...
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
```

`settleGamble(card)` doubles and banks the pot on red (with the cash-out coin sound and sparkles),
or empties it on black (with the wrong sound and a shake), sets `inARow` to 0, and after a pause adds
the card to the history row, hides the next-card sprite, and either ends the game (deck empty) or
calls `waitForGuess()`. The card to beat does not change. D is added to the keys line, the controls
in `index.html` and the README.

Tested with a rigged deck: D with an empty pot does nothing; H (pot 10), D, queen of hearts - score
20; H pressed during the gamble is ignored; H (pot 20), D, 3 of clubs - pot gone, score still 20,
lives still 3.

**Look for:**
- a new state (not reusing `"revealing"`) and the existing `state !== "waiting"` checks doing the
  rest - H, L and C are all blocked during the gamble with no extra code
- `isRed` in `Card` (the model) rather than checking suits in the scene
- the deck-empty case handled - a gamble can draw the last card
- reuse of `dealTo()`, `floatText()`, `pulse()` and the sparkles rather than copies

---

## 6. The computer plays the odds

**Project:** [solutions/ch12_challenge_6_computer_player](solutions/ch12_challenge_6_computer_player/)
(from `ch12_higher_or_lower_advanced`)

**Goal:** drive the game from code through the same methods the player uses, and write a simple
strategy.

`Deck` gains `countWhere()` (as in challenge 3) and a `size` getter. In `src/scenes/GameScene.ts`,
the end of `waitForGuess()`:
```ts
// CHALLENGE 6: every time the game is ready for a move, the computer (if playing) makes one
if (this.autoPlay) {
  this.scheduleComputerMove();
}
```

and the strategy:
```ts
private computerMove(): void {
  if (!this.autoPlay || this.state !== "waiting") {
    return; // switched off while thinking, or something else is happening
  }
  const current = this.currentCard.value;
  const higher = this.deck.countWhere((card) => card.value > current);
  const lower = this.deck.countWhere((card) => card.value < current);
  const chance = Math.max(higher, lower) / this.deck.size;

  if (this.pot > 0 && chance < CASH_OUT_BELOW) {
    this.cashOut(); // cashOut() calls waitForGuess(), which schedules the next move
    return;
  }
  // (only equal counts - e.g. both 0 when every card left is a tie - need the multiplier check,
  // so the computer never picks a guess the game will refuse, such as "higher" on a king)
  const guess: Guess = higher > lower || riskMultiplier("lower", this.currentCard) === 0 ? "higher" : "lower";
  this.guess(guess);
}
```

`scheduleComputerMove()` is a `this.time.delayedCall(THINK_TIME, ...)`. The A key toggles
`autoPlay`, shows "COMPUTER PLAYING", and schedules a move straight away if the game is waiting.
`autoPlay` is reset in `init()`, so each game starts with the player in charge.

Tested by switching the computer on and letting it play a whole game with the scene's clocks sped up
(`time.timeScale` and `tweens.timeScale` set to 4 from the harness): it played 36 cards on its own,
cashed out several times, and finished "Out of lives!" with 990 points and a longest run of 10.

**Look for:**
- the computer calling `guess()` and `cashOut()` - the same methods as the keys - so it cannot
  cheat or skip the state checks
- the check at the top of `computerMove()`: without it, pressing A twice quickly schedules two
  moves, or the computer moves after being switched off
- no `update()` polling ("is it waiting now? now?") - the event-driven version is simpler
- a guess the game would refuse (`riskMultiplier` 0) would leave the computer stuck waiting for a
  move that never happens - ask students how they would spot that bug
- extension: run many games and print the average score for different `CASH_OUT_BELOW` values -
  a real experiment in strategy
