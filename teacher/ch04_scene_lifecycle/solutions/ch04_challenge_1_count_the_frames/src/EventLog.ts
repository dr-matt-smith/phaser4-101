// EventLog - the list of messages shown in the log panel
//
// A plain class, not a scene. There is one EventLog for the whole game (the `eventLog` constant
// at the bottom), and any file can import it and add to it - even a scene's constructor, which
// runs before the scene has a registry, an event emitter or anything else of Phaser's to use.

// how many messages to keep; older ones are thrown away
const MAX_LINES = 200;

export class EventLog {
  private lines: string[] = [];

  // counts every change, so a reader can tell cheaply whether there is anything new to show
  private version = 0;

  // add a message; `frame` is the game's frame number, when there is one
  public add(message: string, frame?: number): void {
    const frameText = frame === undefined ? "    -" : String(frame).padStart(5);
    this.lines.push(`${frameText} ${message}`);

    if (this.lines.length > MAX_LINES) {
      this.lines.shift();
    }
    this.version = this.version + 1;
  }

  public clear(): void {
    this.lines = [];
    this.version = this.version + 1;
  }

  // the newest `count` messages, oldest first
  public getLast(count: number): string[] {
    return this.lines.slice(-count);
  }

  public getVersion(): number {
    return this.version;
  }
}

// the one log the whole game shares
export const eventLog = new EventLog();
