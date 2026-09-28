// Cave - makes a random cave: a grid of cells, each either rock (solid) or open floor
//
// This is only data - it knows nothing about Phaser, tiles or pictures. The scene turns it into a
// tilemap. Keeping the two apart means the cave can be tested, or drawn a different way, on its own.
//
// How it works ("cellular automata" - a common way to make natural-looking caves):
//   1. fill the grid with random rock, a little under half of it
//   2. smooth it a few times: a cell becomes rock if 5 or more of the 9 cells around it (itself
//      included) are rock, and floor otherwise. Lone rocks vanish; clumps grow into walls
//   3. clear a space at the start, then fill in any floor the player could never walk to

const ROCK_CHANCE = 0.47;
const SMOOTHING_PASSES = 5;
const ROCK_NEIGHBOURS = 5;
const START_CLEARING = 2;         // cells cleared on each side of the start

export interface Cell {
  column: number;
  row: number;
}

export class Cave {
  public readonly columns: number;
  public readonly rows: number;
  public readonly start: Cell;

  // solid[row][column] - true for rock. Rows first, like a tilemap's data
  private solid: boolean[][];

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.start = { column: Math.floor(columns / 2), row: Math.floor(rows / 2) };

    this.solid = this.randomRock();
    for (let pass = 0; pass < SMOOTHING_PASSES; pass++) {
      this.solid = this.smooth();
    }
    this.clearStart();
    this.fillUnreachable();
  }

  // rock, or outside the grid (which counts as rock, so the cave always has walls round it)
  public isSolid(column: number, row: number): boolean {
    const inside = column >= 0 && column < this.columns && row >= 0 && row < this.rows;
    return !inside || this.solid[row][column];
  }

  // every floor cell - all of them can be reached from the start
  public openCells(): Cell[] {
    const cells: Cell[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        if (!this.solid[row][column]) {
          cells.push({ column, row });
        }
      }
    }
    return cells;
  }

  // step 1: random rock, and a solid border
  private randomRock(): boolean[][] {
    const grid: boolean[][] = [];
    for (let row = 0; row < this.rows; row++) {
      const line: boolean[] = [];
      for (let column = 0; column < this.columns; column++) {
        const border = column === 0 || row === 0 || column === this.columns - 1 || row === this.rows - 1;
        line.push(border || Math.random() < ROCK_CHANCE);
      }
      grid.push(line);
    }
    return grid;
  }

  // step 2: one smoothing pass. It builds a NEW grid, so every cell is judged on the old one
  private smooth(): boolean[][] {
    const grid: boolean[][] = [];
    for (let row = 0; row < this.rows; row++) {
      const line: boolean[] = [];
      for (let column = 0; column < this.columns; column++) {
        let rock = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (this.isSolid(column + dx, row + dy)) {
              rock++;
            }
          }
        }
        line.push(rock >= ROCK_NEIGHBOURS);
      }
      grid.push(line);
    }
    return grid;
  }

  // step 3a: make sure the player does not start inside rock
  private clearStart(): void {
    for (let row = this.start.row - START_CLEARING; row <= this.start.row + START_CLEARING; row++) {
      for (let column = this.start.column - START_CLEARING; column <= this.start.column + START_CLEARING; column++) {
        this.solid[row][column] = false;
      }
    }
  }

  // step 3b: a "flood fill" from the start finds every floor cell the player can walk to. Any
  // floor it does not reach is a cave cut off from the rest - turn it into rock
  private fillUnreachable(): void {
    const reached: boolean[][] = this.solid.map((line) => line.map(() => false));
    const toVisit: Cell[] = [this.start];
    reached[this.start.row][this.start.column] = true;

    while (toVisit.length > 0) {
      const cell = toVisit.pop()!;       // pop() says "maybe undefined"; the loop test says it is not
      const neighbours: Cell[] = [
        { column: cell.column + 1, row: cell.row },
        { column: cell.column - 1, row: cell.row },
        { column: cell.column, row: cell.row + 1 },
        { column: cell.column, row: cell.row - 1 },
      ];
      for (const next of neighbours) {
        if (!this.isSolid(next.column, next.row) && !reached[next.row][next.column]) {
          reached[next.row][next.column] = true;
          toVisit.push(next);
        }
      }
    }

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        if (!reached[row][column]) {
          this.solid[row][column] = true;
        }
      }
    }
  }
}
