// Synthesises every sound effect and music loop in assets/audio/ - no downloads, no licences.
//
//   deno run -A tools/make_audio.ts
//
// Each sound is built from simple waves (square, triangle, sine) and noise, shaped by an
// envelope, and written as a 22050 Hz, 16 bit, mono WAV file.

import { dirname, fromFileUrl, join } from "jsr:@std/path@^1";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const OUT = join(ROOT, "assets/audio");
const RATE = 22050;

type Wave = "square" | "triangle" | "sine" | "saw" | "noise";

let noiseSeed = 1;
function noise() {
  noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
  return (noiseSeed / 0x7fffffff) * 2 - 1;
}

function osc(wave: Wave, phase: number): number {
  const p = phase - Math.floor(phase);
  switch (wave) {
    case "square":
      return p < 0.5 ? 0.6 : -0.6;
    case "triangle":
      return 1 - 4 * Math.abs(p - 0.5);
    case "sine":
      return Math.sin(p * Math.PI * 2);
    case "saw":
      return 2 * p - 1;
    case "noise":
      return noise();
  }
}

// a tone whose frequency slides from f1 to f2, with a quick attack and a decay to silence
function tone(
  buf: Float32Array,
  start: number,
  length: number,
  wave: Wave,
  f1: number,
  f2 = f1,
  volume = 0.5,
  attack = 0.005,
  release = 1,
) {
  const s0 = Math.floor(start * RATE), n = Math.floor(length * RATE);
  let phase = 0;
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / n;
    const f = f1 * Math.pow(f2 / f1, t);
    phase += f / RATE;
    const a = Math.min(1, (i / RATE) / attack);
    const d = release >= 1 ? 1 - t : Math.min(1, (1 - t) / release);
    buf[s0 + i] += osc(wave, phase) * volume * a * d;
  }
}

// noise, optionally smoothed (a crude low-pass: bigger `smooth` = duller)
function hiss(buf: Float32Array, start: number, length: number, volume = 0.5, smooth = 0, swell = false) {
  const s0 = Math.floor(start * RATE), n = Math.floor(length * RATE);
  let last = 0;
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / n;
    last = last * smooth + noise() * (1 - smooth);
    const env = swell ? Math.sin(t * Math.PI) : (1 - t) * (1 - t);
    buf[s0 + i] += last * volume * env * (smooth > 0 ? 1 + smooth * 3 : 1);
  }
}

async function save(name: string, buf: Float32Array) {
  // normalise gently, so nothing clips
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0.9 ? 0.9 / peak : 1;
  const data = new DataView(new ArrayBuffer(44 + buf.length * 2));
  const str = (o: number, s: string) => [...s].forEach((ch, i) => data.setUint8(o + i, ch.charCodeAt(0)));
  str(0, "RIFF");
  data.setUint32(4, 36 + buf.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, 1, true);
  data.setUint32(24, RATE, true);
  data.setUint32(28, RATE * 2, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  str(36, "data");
  data.setUint32(40, buf.length * 2, true);
  buf.forEach((v, i) => data.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v * gain)) * 32767, true));
  await Deno.writeFile(join(OUT, name), new Uint8Array(data.buffer));
}

const make = (seconds: number) => new Float32Array(Math.ceil(seconds * RATE));
const note = (n: string) => {
  // "C4", "F#5" ... -> Hz
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const m = n.match(/^([A-G]#?)(\d)$/)!;
  const semis = names.indexOf(m[1]) + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
};

await Deno.mkdir(OUT, { recursive: true });

// ---------------- sound effects ----------------
let b = make(0.06);
tone(b, 0, 0.06, "square", 1100, 1100, 0.4);
await save("click.wav", b);

b = make(0.12);
tone(b, 0, 0.12, "sine", 500, 1200, 0.7);
await save("pop.wav", b);

b = make(0.2);
tone(b, 0, 0.2, "square", 280, 720, 0.4);
await save("jump.wav", b);

b = make(0.3);
tone(b, 0, 0.08, "square", note("B5"), note("B5"), 0.35);
tone(b, 0.07, 0.22, "square", note("E6"), note("E6"), 0.35);
await save("coin.wav", b);

b = make(0.18);
hiss(b, 0, 0.12, 0.6);
tone(b, 0, 0.18, "sine", 220, 80, 0.6);
await save("hit.wav", b);

b = make(0.8);
hiss(b, 0, 0.8, 0.9, 0.85);
tone(b, 0, 0.4, "sine", 90, 40, 0.5);
await save("explosion.wav", b);

b = make(0.15);
tone(b, 0, 0.15, "square", 1200, 220, 0.35);
await save("shoot.wav", b);

b = make(0.5);
["C5", "E5", "G5", "C6", "E6"].forEach((n, i) => tone(b, i * 0.07, 0.14, "square", note(n), note(n), 0.3));
await save("powerup.wav", b);

b = make(1.3);
[["C5", 0], ["E5", 0.15], ["G5", 0.3], ["C6", 0.45]].forEach(([n, t]) =>
  tone(b, t as number, 0.3, "square", note(n as string), note(n as string), 0.3)
);
tone(b, 0.6, 0.7, "triangle", note("C6"), note("C6"), 0.5);
tone(b, 0.6, 0.7, "square", note("G5"), note("G5"), 0.2);
await save("win.wav", b);

b = make(1.2);
[["G4", 0], ["F#4", 0.25], ["F4", 0.5]].forEach(([n, t]) =>
  tone(b, t as number, 0.25, "square", note(n as string), note(n as string), 0.3)
);
tone(b, 0.75, 0.45, "square", note("E4"), note("C4"), 0.3);
await save("lose.wav", b);

b = make(0.1);
hiss(b, 0, 0.1, 0.5, 0.5, true);
await save("flip.wav", b);

b = make(0.12);
tone(b, 0, 0.12, "sine", 180, 90, 0.8);
hiss(b, 0, 0.04, 0.3, 0.6);
await save("card_place.wav", b);

b = make(0.14);
hiss(b, 0, 0.08, 0.7, 0.4);
tone(b, 0, 0.14, "sine", 160, 60, 0.8);
await save("punch.wav", b);

b = make(0.2);
hiss(b, 0, 0.1, 0.6, 0.6);
tone(b, 0, 0.2, "sine", 110, 45, 0.9);
await save("kick.wav", b);

b = make(0.3);
hiss(b, 0, 0.3, 0.6, 0.7, true);
await save("whoosh.wav", b);

b = make(0.3);
tone(b, 0, 0.3, "square", 420, 140, 0.35);
await save("hurt.wav", b);

b = make(0.4);
tone(b, 0, 0.4, "triangle", 150, 420, 0.6);
hiss(b, 0, 0.25, 0.15, 0.8);
await save("door.wav", b);

b = make(0.06);
hiss(b, 0, 0.05, 0.35, 0.7);
await save("step.wav", b);

b = make(0.25);
tone(b, 0, 0.25, "triangle", note("A5"), note("A5"), 0.5);
tone(b, 0, 0.25, "sine", note("E6"), note("E6"), 0.25);
await save("correct.wav", b);

b = make(0.35);
tone(b, 0, 0.35, "square", 180, 150, 0.3);
tone(b, 0, 0.35, "square", 190, 160, 0.3);
await save("wrong.wav", b);

// ---------------- music loops ----------------
// a loop has to end exactly where it started, so every note is placed on a beat grid
function music(
  bpm: number,
  bars: number,
  bass: string[],
  melody: (string | null)[],
  leadWave: Wave,
  chordRoots: string[],
) {
  const beat = 60 / bpm, length = bars * 4 * beat;
  const buf = make(length);
  // bass: one note per beat, walking the pattern
  for (let i = 0; i < bars * 4; i++) {
    const n = bass[i % bass.length];
    tone(buf, i * beat, beat * 0.9, "triangle", note(n), note(n), 0.45, 0.01, 0.3);
  }
  // melody: eighth notes
  for (let i = 0; i < bars * 8; i++) {
    const n = melody[i % melody.length];
    if (n) tone(buf, i * beat / 2, beat / 2 * 0.85, leadWave, note(n), note(n), 0.16, 0.01, 0.4);
  }
  // soft chord pad: a root and fifth held for each bar
  for (let bar = 0; bar < bars; bar++) {
    const r = note(chordRoots[bar % chordRoots.length]);
    tone(buf, bar * 4 * beat, 4 * beat, "sine", r, r, 0.08, 0.2, 0.2);
    tone(buf, bar * 4 * beat, 4 * beat, "sine", r * 1.5, r * 1.5, 0.06, 0.2, 0.2);
  }
  // hi-hat on every off beat
  for (let i = 0; i < bars * 4; i++) hiss(buf, i * beat + beat / 2, 0.04, 0.12);
  return buf;
}

await save(
  "music_game.wav",
  music(
    128,
    8,
    ["C3", "C3", "G2", "G2", "A2", "A2", "F2", "G2"],
    ["E5", "G5", "C6", "G5", "E5", "D5", "C5", "D5", "E5", "G5", "A5", "G5", "E5", "D5", "E5", null,
      "C5", "E5", "A5", "E5", "F5", "A5", "C6", "A5", "G5", "F5", "E5", "D5", "D5", "E5", "D5", null],
    "square",
    ["C4", "C4", "A3", "F3"],
  ),
);
await save(
  "music_menu.wav",
  music(
    90,
    4,
    ["A2", "E3", "F2", "C3", "D2", "A2", "E2", "E3"],
    ["A4", "C5", "E5", "C5", "F4", "A4", "C5", "A4", "D4", "F4", "A4", "F4", "E4", "G#4", "B4", "E5"],
    "triangle",
    ["A3", "F3", "D3", "E3"],
  ),
);
await save(
  "music_action.wav",
  music(
    150,
    8,
    ["E2", "E3", "E2", "E3", "C2", "C3", "D2", "D3"],
    ["E5", null, "E5", "G5", "E5", "D5", "B4", null, "C5", null, "C5", "E5", "D5", "C5", "B4", null,
      "E5", "G5", "B5", "G5", "A5", "G5", "E5", "D5", "C5", "D5", "E5", null, "B4", null, "B4", null],
    "saw",
    ["E3", "C3", "D3", "E3"],
  ),
);

console.log("Made the audio in assets/audio/");
