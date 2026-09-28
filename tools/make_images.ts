// Draws every image, sprite sheet and tileset in assets/ - no downloads, no licences to check.
//
//   deno run -A tools/make_images.ts
//
// Each picture is drawn with the browser's 2D canvas, in headless Chromium, and saved as a PNG.
// The drawing code is the JavaScript in DRAW below; edit it and run this again to change the art.

import { dirname, fromFileUrl, join } from "jsr:@std/path@^1";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const OUT = join(ROOT, "assets");

// ---------------------------------------------------------------------------------------------
// The drawing code. Runs in the browser. Every entry in ASSETS is
//   [file, width, height, draw(ctx)]
// and a sprite sheet is just a wide picture with the frames side by side.
// ---------------------------------------------------------------------------------------------
const DRAW = String.raw`
const ASSETS = [];
const add = (file, w, h, draw) => ASSETS.push([file, w, h, draw]);

// ---- helpers ----
function circle(c, x, y, r, fill, stroke, lw) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke(); }
}
function rrect(c, x, y, w, h, r, fill, stroke, lw) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke(); }
}
function poly(c, pts, fill, stroke, lw) {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke(); }
}
function line(c, x1, y1, x2, y2, stroke, lw) {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.lineWidth = lw || 2; c.strokeStyle = stroke; c.lineCap = "round"; c.stroke();
}
function text(c, s, x, y, size, fill, weight, align) {
  c.font = (weight || "bold") + " " + size + "px Arial, Helvetica, sans-serif";
  c.textAlign = align || "center"; c.textBaseline = "middle"; c.fillStyle = fill; c.fillText(s, x, y);
}
function shine(c, x, y, r) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
  g.addColorStop(0, "rgba(255,255,255,0.75)"); g.addColorStop(0.35, "rgba(255,255,255,0.1)");
  g.addColorStop(1, "rgba(0,0,0,0.25)");
  circle(c, x, y, r, g);
}
// a seeded random, so the art comes out the same every time
let seed = 12345;
function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

// ================= single images =================
add("images/ball.png", 64, 64, (c) => { circle(c, 32, 32, 30, "#e8413c", "#8f1d1a", 3); shine(c, 32, 32, 30); });
add("images/ball_blue.png", 64, 64, (c) => { circle(c, 32, 32, 30, "#3c8de8", "#1a468f", 3); shine(c, 32, 32, 30); });
add("images/ball_small.png", 24, 24, (c) => { circle(c, 12, 12, 11, "#f5f5f5", "#9aa4bd", 2); shine(c, 12, 12, 11); });
add("images/star.png", 32, 32, (c) => {
  const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 6.5 : 15; const a = -Math.PI / 2 + i * Math.PI / 5; p.push(16 + Math.cos(a) * r, 17 + Math.sin(a) * r); }
  poly(c, p, "#ffd23f", "#b8860b", 2);
});
add("images/coin.png", 32, 32, (c) => { circle(c, 16, 16, 14, "#ffcc33", "#b07d10", 2.5); circle(c, 16, 16, 9, null, "#e0a820", 2); text(c, "$", 16, 17, 13, "#b07d10"); });
add("images/gem.png", 32, 32, (c) => { poly(c, [16, 3, 29, 13, 16, 29, 3, 13], "#3fd0e8", "#157a8c", 2); poly(c, [16, 3, 22, 13, 16, 29, 10, 13], "rgba(255,255,255,0.35)"); });
add("images/heart.png", 32, 32, (c) => {
  c.beginPath(); c.moveTo(16, 28); c.bezierCurveTo(-4, 14, 6, -2, 16, 9); c.bezierCurveTo(26, -2, 36, 14, 16, 28);
  c.fillStyle = "#ff4d6d"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#a4133c"; c.stroke();
  circle(c, 10, 11, 3, "rgba(255,255,255,0.6)");
});
add("images/fruit.png", 32, 32, (c) => { circle(c, 16, 18, 12, "#e63946", "#8d1b24", 2); line(c, 16, 7, 18, 2, "#6b4226", 3); poly(c, [18, 6, 27, 2, 24, 9], "#52b788"); shine(c, 16, 18, 12); });
add("images/bomb.png", 36, 36, (c) => { circle(c, 17, 20, 13, "#2b2d42", "#000", 2); rrect(c, 14, 4, 7, 6, 1, "#555"); line(c, 18, 4, 24, -1, "#c9a227", 2); circle(c, 26, 2, 3, "#ff9f1c"); shine(c, 17, 20, 13); });
add("images/basket.png", 96, 48, (c) => {
  poly(c, [4, 10, 92, 10, 80, 46, 16, 46], "#c68b59", "#7a4a24", 3);
  for (let x = 16; x < 88; x += 12) line(c, x, 12, x - 2 + (x - 48) * 0.1, 44, "#9c6b3d", 2);
  line(c, 10, 26, 86, 26, "#9c6b3d", 2); rrect(c, 0, 4, 96, 10, 4, "#d9a066", "#7a4a24", 2);
});
add("images/player_ship.png", 64, 48, (c) => {
  poly(c, [32, 2, 60, 44, 32, 34, 4, 44], "#4cc9f0", "#1d6f8c", 3);
  poly(c, [32, 12, 40, 30, 32, 26, 24, 30], "#caf0f8");
  poly(c, [22, 38, 32, 34, 42, 38, 32, 47], "#ff9f1c");
});
add("images/enemy_ship.png", 56, 40, (c) => {
  poly(c, [4, 6, 52, 6, 44, 30, 28, 38, 12, 30], "#e63946", "#7f1d24", 3);
  circle(c, 28, 17, 7, "#ffe66d", "#7f1d24", 2); circle(c, 28, 17, 3, "#1b1f2a");
});
add("images/bullet.png", 8, 20, (c) => { rrect(c, 1, 1, 6, 18, 3, "#fff3b0", "#ff9f1c", 1.5); });
add("images/enemy_bullet.png", 10, 10, (c) => { circle(c, 5, 5, 4, "#ff4d6d", "#fff", 1.5); });
add("images/rock.png", 48, 48, (c) => {
  const p = []; for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; const r = 18 + rnd() * 5; p.push(24 + Math.cos(a) * r, 24 + Math.sin(a) * r); }
  poly(c, p, "#8d8d99", "#4a4a55", 3); circle(c, 18, 20, 4, "#6e6e7a"); circle(c, 30, 30, 5, "#6e6e7a"); circle(c, 29, 16, 2.5, "#6e6e7a");
});
add("images/crate.png", 48, 48, (c) => {
  rrect(c, 2, 2, 44, 44, 3, "#c68b59", "#6f4518", 3); rrect(c, 8, 8, 32, 32, 1, null, "#8d5a2b", 2);
  line(c, 8, 8, 40, 40, "#8d5a2b", 3); line(c, 40, 8, 8, 40, "#8d5a2b", 3);
});
add("images/platform.png", 200, 32, (c) => {
  rrect(c, 0, 8, 200, 24, 4, "#8d5a2b", "#5a3715", 2); rrect(c, 0, 0, 200, 12, 5, "#52b788", "#2d6a4f", 2);
  for (let x = 12; x < 200; x += 24) circle(c, x, 20, 2.5, "#6f4518");
});
add("images/ground.png", 800, 64, (c) => {
  c.fillStyle = "#8d5a2b"; c.fillRect(0, 14, 800, 50); c.fillStyle = "#52b788"; c.fillRect(0, 0, 800, 16);
  c.fillStyle = "#40916c"; for (let x = 0; x < 800; x += 16) poly(c, [x, 16, x + 8, 22, x + 16, 16], "#40916c");
  for (let i = 0; i < 60; i++) circle(c, rnd() * 800, 26 + rnd() * 34, 2 + rnd() * 2, "#6f4518");
});
add("images/sky.png", 800, 600, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, "#5aa9e6"); g.addColorStop(1, "#bde0fe");
  c.fillStyle = g; c.fillRect(0, 0, 800, 600);
  circle(c, 660, 110, 48, "#fff3b0"); circle(c, 660, 110, 62, "rgba(255,243,176,0.3)");
  c.fillStyle = "#95d5b2"; c.beginPath(); c.moveTo(0, 600);
  for (let x = 0; x <= 800; x += 10) c.lineTo(x, 470 - Math.sin(x / 130) * 45 - Math.sin(x / 47) * 12);
  c.lineTo(800, 600); c.fill();
  c.fillStyle = "#74c69d"; c.beginPath(); c.moveTo(0, 600);
  for (let x = 0; x <= 800; x += 10) c.lineTo(x, 520 - Math.sin(x / 90 + 2) * 30);
  c.lineTo(800, 600); c.fill();
});
add("images/space.png", 800, 600, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, "#0b0d21"); g.addColorStop(1, "#1f1147");
  c.fillStyle = g; c.fillRect(0, 0, 800, 600);
  for (let i = 0; i < 220; i++) circle(c, rnd() * 800, rnd() * 600, rnd() * 1.6 + 0.3, "rgba(255,255,255," + (0.3 + rnd() * 0.7) + ")");
  circle(c, 130, 470, 60, "#6a4c93"); circle(c, 118, 458, 60, "rgba(255,255,255,0.08)");
});
add("images/table.png", 800, 600, (c) => {
  const g = c.createRadialGradient(400, 300, 50, 400, 300, 520); g.addColorStop(0, "#2f8f5b"); g.addColorStop(1, "#14502f");
  c.fillStyle = g; c.fillRect(0, 0, 800, 600);
  for (let i = 0; i < 3000; i++) { c.fillStyle = "rgba(0,0,0," + rnd() * 0.06 + ")"; c.fillRect(rnd() * 800, rnd() * 600, 2, 2); }
});
add("images/arena.png", 800, 600, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, "#3a0ca3"); g.addColorStop(0.6, "#f72585"); g.addColorStop(1, "#ffb703");
  c.fillStyle = g; c.fillRect(0, 0, 800, 600);
  c.fillStyle = "#240046"; for (let x = 0; x < 800; x += 60) { const h = 80 + rnd() * 140; c.fillRect(x, 470 - h, 50, h); }
  c.fillStyle = "#5a189a"; c.fillRect(0, 470, 800, 130); c.fillStyle = "#7b2cbf"; c.fillRect(0, 470, 800, 8);
  for (let x = 0; x < 800; x += 40) line(c, x, 478, x - 30, 600, "rgba(255,255,255,0.08)", 2);
});
add("images/cloud.png", 128, 64, (c) => { circle(c, 40, 40, 22, "#fff"); circle(c, 68, 30, 28, "#fff"); circle(c, 96, 42, 20, "#fff"); c.fillStyle = "#fff"; c.fillRect(40, 40, 56, 22); });
add("images/particle.png", 16, 16, (c) => {
  const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, 16, 16);
});
add("images/button.png", 220, 64, (c) => { rrect(c, 2, 6, 216, 56, 12, "#1d3557"); rrect(c, 2, 2, 216, 54, 12, "#457b9d", "#1d3557", 3); rrect(c, 10, 8, 200, 16, 8, "rgba(255,255,255,0.18)"); });
add("images/button_over.png", 220, 64, (c) => { rrect(c, 2, 6, 216, 56, 12, "#1d3557"); rrect(c, 2, 2, 216, 54, 12, "#5fa8d3", "#1d3557", 3); rrect(c, 10, 8, 200, 16, 8, "rgba(255,255,255,0.25)"); });
add("images/button_down.png", 220, 64, (c) => { rrect(c, 2, 8, 216, 54, 12, "#3a6b8a", "#1d3557", 3); });
add("images/panel.png", 400, 300, (c) => { rrect(c, 4, 4, 392, 292, 18, "rgba(20,24,38,0.88)", "#8ecae6", 4); });
add("images/logo.png", 480, 140, (c) => {
  rrect(c, 4, 4, 472, 132, 24, "#14213d", "#fca311", 5);
  text(c, "PHASER 4", 240, 58, 58, "#fca311"); text(c, "a guide for OO programmers", 240, 108, 24, "#e5e5e5", "normal");
});
add("images/player.png", 48, 48, (c) => { rrect(c, 6, 10, 36, 34, 8, "#4361ee", "#1b2a8c", 3); circle(c, 17, 24, 5, "#fff"); circle(c, 31, 24, 5, "#fff"); circle(c, 18, 25, 2.5, "#111"); circle(c, 32, 25, 2.5, "#111"); rrect(c, 16, 34, 16, 4, 2, "#1b2a8c"); });
add("images/enemy.png", 48, 48, (c) => { poly(c, [24, 4, 44, 42, 4, 42], "#e63946", "#7f1d24", 3); circle(c, 18, 30, 4, "#fff"); circle(c, 30, 30, 4, "#fff"); circle(c, 18, 31, 2, "#111"); circle(c, 30, 31, 2, "#111"); });
add("images/target.png", 64, 64, (c) => { circle(c, 32, 32, 30, "#fff", "#c1121f", 3); circle(c, 32, 32, 21, "#c1121f"); circle(c, 32, 32, 13, "#fff"); circle(c, 32, 32, 6, "#c1121f"); });
add("images/arrow_left.png", 64, 64, (c) => { circle(c, 32, 32, 30, "#264653", "#e9c46a", 3); poly(c, [18, 32, 38, 16, 38, 48], "#e9c46a"); });
add("images/arrow_right.png", 64, 64, (c) => { circle(c, 32, 32, 30, "#264653", "#e9c46a", 3); poly(c, [46, 32, 26, 16, 26, 48], "#e9c46a"); });
add("images/sound_on.png", 48, 48, (c) => { rrect(c, 2, 2, 44, 44, 10, "#264653"); poly(c, [10, 19, 18, 19, 27, 11, 27, 37, 18, 29, 10, 29], "#fff"); c.beginPath(); c.arc(28, 24, 9, -0.9, 0.9); c.lineWidth = 3; c.strokeStyle = "#fff"; c.stroke(); c.beginPath(); c.arc(28, 24, 15, -0.9, 0.9); c.stroke(); });
add("images/sound_off.png", 48, 48, (c) => { rrect(c, 2, 2, 44, 44, 10, "#264653"); poly(c, [10, 19, 18, 19, 27, 11, 27, 37, 18, 29, 10, 29], "#fff"); line(c, 31, 18, 41, 30, "#e76f51", 4); line(c, 41, 18, 31, 30, "#e76f51", 4); });

// ================= sprite sheets =================
// coin spinning: 6 frames of 32x32
add("spritesheets/coin_spin.png", 32 * 6, 32, (c) => {
  for (let f = 0; f < 6; f++) {
    const sx = Math.abs(Math.cos(f / 6 * Math.PI)); c.save(); c.translate(f * 32 + 16, 16); c.scale(Math.max(sx, 0.12), 1);
    circle(c, 0, 0, 14, "#ffcc33", "#b07d10", 2.5); if (sx > 0.4) text(c, "$", 0, 1, 13, "#b07d10"); c.restore();
  }
});
// explosion: 8 frames of 64x64
add("spritesheets/explosion.png", 64 * 8, 64, (c) => {
  for (let f = 0; f < 8; f++) {
    const t = f / 7, cx = f * 64 + 32, r = 6 + t * 26;
    c.globalAlpha = 1 - t * 0.85;
    circle(c, cx, 32, r, "#ff9f1c"); circle(c, cx, 32, r * 0.7, "#ffd23f"); circle(c, cx, 32, r * 0.35 * (1 - t), "#fff");
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + f; circle(c, cx + Math.cos(a) * r * 0.9, 32 + Math.sin(a) * r * 0.9, 4 * (1 - t) + 1, "#e63946"); }
    c.globalAlpha = 1;
  }
});
// platformer hero: 32x48 frames
//   0-1 idle, 2-7 run, 8 jump, 9 fall, 10 hurt
function hero(c, ox, pose, legA, legB, armA, armB, bob, colour) {
  const body = colour || "#4361ee", skin = "#ffd6a5", dark = "#1b2a8c";
  c.save(); c.translate(ox, bob || 0);
  line(c, 13, 34, 13 + legA, 46, dark, 5); line(c, 19, 34, 19 + legB, 46, dark, 5);
  rrect(c, 8, 18, 16, 18, 4, body, dark, 2);
  line(c, 9, 22, 9 + armA, 32, skin, 4); line(c, 23, 22, 23 + armB, 32, skin, 4);
  circle(c, 16, 11, 8, skin, "#b07d50", 2); rrect(c, 7, 2, 18, 6, 3, "#e63946");
  circle(c, 19, 11, 1.8, "#111");
  if (pose === "hurt") { line(c, 16, 14, 21, 15, "#111", 1.5); }
  c.restore();
}
add("spritesheets/hero.png", 32 * 11, 48, (c) => {
  hero(c, 0, "idle", 0, 0, -1, 1, 0); hero(c, 32, "idle", 0, 0, -1, 1, 1);
  const run = [[-6, 6, 4, -4], [-3, 3, 2, -2], [0, 0, 0, 0], [6, -6, -4, 4], [3, -3, -2, 2], [0, 0, 0, 0]];
  run.forEach((p, i) => hero(c, 64 + i * 32, "run", p[0], p[1], p[2], p[3], i % 3 === 2 ? -1 : 0));
  hero(c, 256, "jump", -5, 4, -6, 6, -1); hero(c, 288, "fall", 3, -3, 6, -6, 0);
  c.save(); c.globalAlpha = 0.9; hero(c, 320, "hurt", 4, 6, 7, 7, 1, "#9b5de5"); c.restore();
});
// slime: 4 frames of 32x32
add("spritesheets/slime.png", 32 * 4, 32, (c) => {
  [0, 1, 2, 1].forEach((s, f) => {
    const w = 26 + s * 3, h = 20 - s * 3, x = f * 32 + 16;
    c.beginPath(); c.ellipse(x, 30 - h / 2, w / 2, h / 2 + 2, 0, Math.PI, 0); c.lineTo(x + w / 2, 30); c.lineTo(x - w / 2, 30); c.closePath();
    c.fillStyle = "#70e000"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#38b000"; c.stroke();
    circle(c, x - 5, 26 - h / 2, 2.5, "#111"); circle(c, x + 5, 26 - h / 2, 2.5, "#111");
  });
});
// bat: 4 frames of 32x32
add("spritesheets/bat.png", 32 * 4, 32, (c) => {
  [-8, 0, 8, 0].forEach((wing, f) => {
    const x = f * 32 + 16;
    poly(c, [x - 4, 16, x - 15, 12 + wing, x - 11, 20, x - 4, 20], "#5a189a", "#240046", 1.5);
    poly(c, [x + 4, 16, x + 15, 12 + wing, x + 11, 20, x + 4, 20], "#5a189a", "#240046", 1.5);
    circle(c, x, 17, 6, "#7b2cbf", "#240046", 1.5); circle(c, x - 2, 16, 1.5, "#ffd60a"); circle(c, x + 2, 16, 1.5, "#ffd60a");
  });
});
// top-down hero: 32x32, rows of 3 frames: down, left, right, up (12 frames in one row)
function topdown(c, ox, dir, step, body, dark) {
  c.save(); c.translate(ox + 16, 16);
  const legY = step === 0 ? 0 : (step === 1 ? 3 : -3);
  if (dir === "down" || dir === "up") { rrect(c, -7, 6 + legY, 5, 7, 2, dark); rrect(c, 2, 6 - legY, 5, 7, 2, dark); }
  else { rrect(c, -4 + legY, 7, 8, 6, 2, dark); }
  rrect(c, -9, -4, 18, 14, 5, body, dark, 2);
  circle(c, 0, -7, 7, "#ffd6a5", "#b07d50", 1.5);
  if (dir === "up") { c.beginPath(); c.arc(0, -8, 7, Math.PI, 0); c.fillStyle = "#6f4518"; c.fill(); circle(c, 0, -7, 7, null, "#6f4518", 2); }
  else if (dir === "down") { circle(c, -2.5, -7, 1.3, "#111"); circle(c, 2.5, -7, 1.3, "#111"); c.beginPath(); c.arc(0, -9, 7, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 3; c.strokeStyle = "#6f4518"; c.stroke(); }
  else { const s = dir === "left" ? -1 : 1; circle(c, 3 * s, -7, 1.3, "#111"); c.beginPath(); c.arc(-2 * s, -8, 6, 0, Math.PI * 2); c.fillStyle = "rgba(111,69,24,0.9)"; c.fill(); }
  if (dir !== "up") { line(c, 9, 0, 13, -8, "#adb5bd", 3); }
  c.restore();
}
add("spritesheets/topdown_hero.png", 32 * 12, 32, (c) => {
  ["down", "left", "right", "up"].forEach((d, r) => [0, 1, 2].forEach((s) => topdown(c, (r * 3 + s) * 32, d, s, "#2a9d8f", "#1d5c55")));
});
add("spritesheets/topdown_enemy.png", 32 * 12, 32, (c) => {
  ["down", "left", "right", "up"].forEach((d, r) => [0, 1, 2].forEach((s) => topdown(c, (r * 3 + s) * 32, d, s, "#e76f51", "#8a3b25")));
});
// ghost: 4 frames of 32x32
add("spritesheets/ghost.png", 32 * 4, 32, (c) => {
  [0, 2, 0, -2].forEach((b, f) => {
    const x = f * 32 + 16; c.save(); c.globalAlpha = 0.9; c.beginPath(); c.arc(x, 13 + b, 11, Math.PI, 0);
    c.lineTo(x + 11, 28 + b); for (let i = 0; i < 4; i++) c.lineTo(x + 11 - (i + 0.5) * 5.5, (i % 2 ? 28 : 24) + b);
    c.lineTo(x - 11, 28 + b); c.closePath(); c.fillStyle = "#e0e1dd"; c.fill(); c.strokeStyle = "#778da9"; c.lineWidth = 2; c.stroke(); c.restore();
    circle(c, x - 4, 12 + b, 2.5, "#1b263b"); circle(c, x + 4, 12 + b, 2.5, "#1b263b");
  });
});
// fighters: 96x128 frames
//   0-1 idle, 2-5 walk, 6-8 punch, 9-11 kick, 12 block, 13 hurt, 14 knocked out
function fighter(c, ox, pose, f, main, trim) {
  const skin = "#f1c27d", dark = "#222";
  c.save(); c.translate(ox + 48, 0);
  let lean = 0, footL = -14, footR = 14, armFx = 22, armFy = 44, armBx = -18, armBy = 50, headY = 26, ko = pose === "ko";
  if (pose === "idle") { headY += f; armFy += f; }
  if (pose === "walk") { const s = [-10, -4, 10, 4][f]; footL = -14 + s; footR = 14 - s; }
  if (pose === "punch") { const e = [10, 36, 18][f]; armFx = 22 + e; armFy = 40; lean = f === 1 ? 5 : 2; }
  if (pose === "kick") { const e = [0, 1, 0.4][f]; footR = 14 + e * 30; lean = -4 * e; }
  if (pose === "block") { armFx = 16; armFy = 30; armBx = 10; armBy = 34; }
  if (pose === "hurt") { lean = -9; headY += 2; armFx = -4; armFy = 58; }
  if (ko) { c.translate(-40, 108); c.rotate(-Math.PI / 2); c.scale(0.62, 0.62); }
  c.translate(lean, 0);
  // legs
  const hipY = 80, footY = 124;
  if (pose === "kick" && f > 0) { line(c, -6, hipY, footL, footY, dark, 11); line(c, 6, hipY, footR, hipY + 10 - f * 4, main, 11); }
  else { line(c, -6, hipY, footL, footY, main, 11); line(c, 6, hipY, footR, footY, main, 11); }
  // body
  rrect(c, -15, 38, 30, 46, 8, main, dark, 2); rrect(c, -15, 72, 30, 8, 2, trim);
  // arms
  line(c, -10, 44, armBx, armBy, skin, 9); circle(c, armBx, armBy, 6, trim);
  line(c, 10, 44, armFx, armFy, skin, 9); circle(c, armFx, armFy, 7, trim, dark, 1.5);
  // head
  circle(c, 0, headY, 13, skin, dark, 2); rrect(c, -14, headY - 7, 28, 5, 2, trim);
  if (pose === "hurt" || ko) { line(c, 3, headY - 1, 8, headY + 2, dark, 2); line(c, 8, headY - 1, 3, headY + 2, dark, 2); }
  else circle(c, 6, headY, 2, dark);
  c.restore();
}
function fighterSheet(main, trim) {
  return (c) => {
    const frames = [["idle", 0], ["idle", 1], ["walk", 0], ["walk", 1], ["walk", 2], ["walk", 3], ["punch", 0], ["punch", 1], ["punch", 2],
      ["kick", 0], ["kick", 1], ["kick", 2], ["block", 0], ["hurt", 0], ["ko", 0]];
    frames.forEach((p, i) => fighter(c, i * 96, p[0], p[1], main, trim));
  };
}
add("spritesheets/fighter_red.png", 96 * 15, 128, fighterSheet("#d62828", "#fcbf49"));
add("spritesheets/fighter_blue.png", 96 * 15, 128, fighterSheet("#1d4e89", "#7dcfb6"));
// items: 8 icons of 32x32 - key, red potion, blue potion, chest closed, chest open, sword, shield, gold
add("spritesheets/items.png", 32 * 8, 32, (c) => {
  circle(c, 10, 16, 6, null, "#ffd23f", 3.5); line(c, 16, 16, 28, 16, "#ffd23f", 3.5); line(c, 24, 16, 24, 21, "#ffd23f", 3); line(c, 28, 16, 28, 21, "#ffd23f", 3);
  const potion = (x, col) => { rrect(c, x + 13, 4, 6, 7, 1, "#ccc"); circle(c, x + 16, 20, 9, col, "#333", 2); circle(c, x + 13, 17, 2.5, "rgba(255,255,255,0.6)"); };
  potion(32, "#e63946"); potion(64, "#3a86ff");
  rrect(c, 99, 12, 26, 16, 2, "#9c6644", "#583101", 2); rrect(c, 99, 7, 26, 8, 3, "#b07d50", "#583101", 2); rrect(c, 110, 13, 4, 5, 1, "#ffd23f");
  rrect(c, 131, 14, 26, 14, 2, "#9c6644", "#583101", 2); poly(c, [131, 14, 157, 14, 153, 4, 135, 4], "#6f4518", "#583101", 2); circle(c, 144, 18, 4, "#ffd23f");
  line(c, 166, 26, 186, 6, "#dee2e6", 4); line(c, 166, 20, 172, 26, "#8d5a2b", 4); line(c, 170, 28, 164, 22, "#8d5a2b", 2);
  poly(c, [208, 4, 222, 8, 220, 22, 208, 29, 196, 22, 194, 8], "#457b9d", "#1d3557", 2); line(c, 208, 8, 208, 25, "#f1faee", 2);
  circle(c, 234, 22, 5, "#ffcc33", "#b07d10", 1.5); circle(c, 244, 22, 5, "#ffcc33", "#b07d10", 1.5); circle(c, 239, 14, 5, "#ffcc33", "#b07d10", 1.5);
});
// playing cards: 80x112, 13 per row (A-K), rows clubs, diamonds, hearts, spades; row 5: back (blue), back (red)
const SUITS = ["♣", "♦", "♥", "♠"], RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
function pips(n) { // centre pip layout for 2-10 on a 80x112 card
  const L = 28, M = 40, R = 52, rows = { 2: [[M, 26], [M, 86]], 3: [[M, 26], [M, 56], [M, 86]], 4: [[L, 26], [R, 26], [L, 86], [R, 86]] };
  rows[5] = rows[4].concat([[M, 56]]); rows[6] = rows[4].concat([[L, 56], [R, 56]]); rows[7] = rows[6].concat([[M, 41]]);
  rows[8] = rows[7].concat([[M, 71]]); rows[9] = rows[4].concat([[L, 46], [R, 46], [L, 66], [R, 66], [M, 56]]);
  rows[10] = rows[4].concat([[L, 46], [R, 46], [L, 66], [R, 66], [M, 36], [M, 76]]); return rows[n];
}
function cardFace(c, x, y, suit, rank) {
  const red = suit === 1 || suit === 2, col = red ? "#d62828" : "#1b1f2a";
  rrect(c, x + 2, y + 2, 76, 108, 7, "#fffdf7", "#9aa4bd", 1.5);
  text(c, RANKS[rank], x + 12, y + 14, 14, col); text(c, SUITS[suit], x + 12, y + 29, 13, col, "normal");
  c.save(); c.translate(x + 68, y + 98); c.rotate(Math.PI); text(c, RANKS[rank], 0, 0, 14, col); text(c, SUITS[suit], 0, 15, 13, col, "normal"); c.restore();
  if (rank === 0) text(c, SUITS[suit], x + 40, y + 57, 42, col, "normal");
  else if (rank >= 10) { rrect(c, x + 20, y + 24, 40, 64, 4, red ? "#ffe5e5" : "#e5eaf5", col, 1.5); text(c, RANKS[rank], x + 40, y + 50, 28, col); text(c, SUITS[suit], x + 40, y + 74, 16, col, "normal"); }
  else pips(rank + 1).forEach((p) => text(c, SUITS[suit], x + p[0], y + p[1], 15, col, "normal"));
}
function cardBack(c, x, y, a, b) {
  rrect(c, x + 2, y + 2, 76, 108, 7, "#fffdf7", "#9aa4bd", 1.5); rrect(c, x + 7, y + 7, 66, 98, 5, a);
  c.save(); c.beginPath(); c.roundRect(x + 7, y + 7, 66, 98, 5); c.clip();
  for (let i = -120; i < 120; i += 10) { line(c, x + i, y, x + i + 112, y + 112, b, 2); line(c, x + i + 112, y, x + i, y + 112, b, 2); }
  c.restore(); circle(c, x + 40, y + 56, 12, a, "#fffdf7", 2);
}
add("spritesheets/cards.png", 80 * 13, 112 * 5, (c) => {
  for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) cardFace(c, r * 80, s * 112, s, r);
  cardBack(c, 0, 448, "#1d4e89", "#3a86ff"); cardBack(c, 80, 448, "#9d0208", "#e85d04");
});
// memory tiles: 100x100, frame 0 = back, 1-12 = pictures
add("spritesheets/memory_tiles.png", 100 * 13, 100, (c) => {
  const tile = (i) => rrect(c, i * 100 + 4, 4, 92, 92, 12, "#f8f9fa", "#adb5bd", 3);
  rrect(c, 4, 4, 92, 92, 12, "#3a0ca3", "#240046", 3); text(c, "?", 50, 52, 50, "#f72585");
  const draw = [
    (x) => circle(c, x, 50, 28, "#e63946", "#7f1d24", 3),
    (x) => rrect(c, x - 27, 23, 54, 54, 4, "#3a86ff", "#1d4e89", 3),
    (x) => poly(c, [x, 20, x + 30, 76, x - 30, 76], "#70e000", "#38b000", 3),
    (x) => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30; const a = -Math.PI / 2 + i * Math.PI / 5; p.push(x + Math.cos(a) * r, 52 + Math.sin(a) * r); } poly(c, p, "#ffd23f", "#b8860b", 3); },
    (x) => poly(c, [x, 20, x + 28, 50, x, 80, x - 28, 50], "#9b5de5", "#5a189a", 3),
    (x) => { const p = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; p.push(x + Math.cos(a) * 30, 50 + Math.sin(a) * 30); } poly(c, p, "#ff9f1c", "#b35c00", 3); },
    (x) => { c.beginPath(); c.moveTo(x, 78); c.bezierCurveTo(x - 40, 50, x - 18, 12, x, 36); c.bezierCurveTo(x + 18, 12, x + 40, 50, x, 78); c.fillStyle = "#ff4d6d"; c.fill(); c.lineWidth = 3; c.strokeStyle = "#a4133c"; c.stroke(); },
    (x) => { circle(c, x, 50, 28, "#00b4d8", "#0077b6", 3); circle(c, x, 50, 14, "#f8f9fa", "#0077b6", 3); },
    (x) => { rrect(c, x - 10, 20, 20, 60, 3, "#2a9d8f", "#1d5c55", 3); rrect(c, x - 30, 40, 60, 20, 3, "#2a9d8f", "#1d5c55", 3); },
    (x) => { c.beginPath(); c.arc(x, 50, 28, 0.5, Math.PI * 2 - 0.5); c.lineTo(x, 50); c.closePath(); c.fillStyle = "#fee440"; c.fill(); c.lineWidth = 3; c.strokeStyle = "#b8860b"; c.stroke(); circle(c, x + 2, 36, 4, "#111"); },
    (x) => { c.beginPath(); c.arc(x + 6, 50, 28, Math.PI * 0.35, Math.PI * 1.65); c.arc(x + 20, 44, 24, Math.PI * 1.55, Math.PI * 0.45, true); c.closePath(); c.fillStyle = "#adb5bd"; c.fill(); c.lineWidth = 3; c.strokeStyle = "#495057"; c.stroke(); },
    (x) => { line(c, x - 26, 76, x + 26, 24, "#6f4518", 8); poly(c, [x + 26, 24, x + 8, 30, x + 20, 42], "#adb5bd", "#495057", 2); circle(c, x - 24, 74, 6, "#e63946"); },
  ];
  draw.forEach((d, i) => { tile(i + 1); d((i + 1) * 100 + 50); });
});

// ================= tilesets (32x32 tiles) =================
// platformer tiles, 8 per row, 2 rows:
//   0 grass top   1 dirt       2 grass left   3 grass right  4 brick   5 stone   6 spikes  7 ladder
//   8 water       9 lava      10 crate       11 door top    12 door   13 flag   14 bush   15 sign
add("tilesets/platform_tiles.png", 32 * 8, 32 * 2, (c) => {
  // each tile is clipped to its own 32 x 32 square, so no stroke can spill into a neighbour
  const T = (i, fn) => { const x = (i % 8) * 32, y = Math.floor(i / 8) * 32; c.save(); c.beginPath(); c.rect(x, y, 32, 32); c.clip(); c.translate(x, y); fn(); c.restore(); };
  const dirt = () => { c.fillStyle = "#8d5a2b"; c.fillRect(0, 0, 32, 32); for (let i = 0; i < 6; i++) circle(c, rnd() * 32, rnd() * 32, 1.5 + rnd() * 1.5, "#6f4518"); };
  T(0, () => { dirt(); c.fillStyle = "#52b788"; c.fillRect(0, 0, 32, 10); poly(c, [0, 10, 5, 14, 10, 10, 16, 14, 22, 10, 27, 14, 32, 10], "#52b788"); });
  T(1, dirt);
  T(2, () => { dirt(); c.fillStyle = "#52b788"; c.fillRect(0, 0, 32, 10); c.fillRect(0, 0, 6, 32); });
  T(3, () => { dirt(); c.fillStyle = "#52b788"; c.fillRect(0, 0, 32, 10); c.fillRect(26, 0, 6, 32); });
  T(4, () => { c.fillStyle = "#b5523b"; c.fillRect(0, 0, 32, 32); c.strokeStyle = "#6d2e1f"; c.lineWidth = 2;
    for (let r = 0; r < 4; r++) { c.strokeRect(-1, r * 8, 34, 8); for (let x = (r % 2) * 8; x < 32; x += 16) { c.beginPath(); c.moveTo(x, r * 8); c.lineTo(x, r * 8 + 8); c.stroke(); } } });
  T(5, () => { c.fillStyle = "#8d99ae"; c.fillRect(0, 0, 32, 32); rrect(c, 1, 1, 30, 30, 3, null, "#4a4e69", 2); circle(c, 10, 11, 3, "#6c757d"); circle(c, 22, 21, 4, "#6c757d"); });
  T(6, () => { for (let i = 0; i < 4; i++) poly(c, [i * 8, 32, i * 8 + 4, 12, i * 8 + 8, 32], "#ced4da", "#495057", 1.5); });
  T(7, () => { line(c, 7, 0, 7, 32, "#8d5a2b", 4); line(c, 25, 0, 25, 32, "#8d5a2b", 4); for (let y = 4; y < 32; y += 9) line(c, 7, y, 25, y, "#b07d50", 3); });
  T(8, () => { c.fillStyle = "rgba(58,134,255,0.75)"; c.fillRect(0, 6, 32, 26); poly(c, [0, 6, 8, 3, 16, 6, 24, 3, 32, 6, 32, 9, 0, 9], "#a2d2ff"); });
  T(9, () => { c.fillStyle = "#e85d04"; c.fillRect(0, 6, 32, 26); poly(c, [0, 6, 8, 2, 16, 6, 24, 2, 32, 6, 32, 10, 0, 10], "#ffba08"); circle(c, 10, 20, 3, "#ffba08"); });
  T(10, () => { rrect(c, 1, 1, 30, 30, 2, "#c68b59", "#6f4518", 2); line(c, 4, 4, 28, 28, "#8d5a2b", 3); line(c, 28, 4, 4, 28, "#8d5a2b", 3); });
  T(11, () => { rrect(c, 4, 4, 24, 36, 12, "#6f4518", "#3d2610", 2); });
  T(12, () => { c.fillStyle = "#6f4518"; c.fillRect(4, 0, 24, 32); c.strokeStyle = "#3d2610"; c.lineWidth = 2; c.strokeRect(4, -2, 24, 34); circle(c, 22, 14, 2.5, "#ffd23f"); });
  T(13, () => { line(c, 8, 2, 8, 32, "#adb5bd", 3); poly(c, [9, 3, 28, 9, 9, 15], "#e63946"); });
  T(14, () => { circle(c, 10, 22, 9, "#2d6a4f"); circle(c, 22, 22, 9, "#2d6a4f"); circle(c, 16, 15, 10, "#40916c"); });
  T(15, () => { line(c, 16, 16, 16, 32, "#6f4518", 4); rrect(c, 3, 4, 26, 15, 2, "#c68b59", "#6f4518", 2); line(c, 8, 10, 24, 10, "#6f4518", 1.5); line(c, 8, 14, 20, 14, "#6f4518", 1.5); });
});
// dungeon tiles, 8 per row, 2 rows:
//   0 floor   1 floor (cracked)  2 floor (moss)  3 wall   4 wall top   5 door closed  6 door open  7 stairs
//   8 chest   9 spikes          10 water        11 pillar 12 rubble   13 torch wall  14 carpet   15 void
add("tilesets/dungeon_tiles.png", 32 * 8, 32 * 2, (c) => {
  // each tile is clipped to its own 32 x 32 square, so no stroke can spill into a neighbour
  const T = (i, fn) => { const x = (i % 8) * 32, y = Math.floor(i / 8) * 32; c.save(); c.beginPath(); c.rect(x, y, 32, 32); c.clip(); c.translate(x, y); fn(); c.restore(); };
  const floor = () => { c.fillStyle = "#4a4e69"; c.fillRect(0, 0, 32, 32); c.strokeStyle = "#3a3d55"; c.lineWidth = 2; c.strokeRect(1, 1, 15, 15); c.strokeRect(16, 1, 15, 15); c.strokeRect(1, 16, 15, 15); c.strokeRect(16, 16, 15, 15); };
  const wall = () => { c.fillStyle = "#6c584c"; c.fillRect(0, 0, 32, 32); c.strokeStyle = "#3f322b"; c.lineWidth = 2;
    for (let r = 0; r < 4; r++) { c.strokeRect(-1, r * 8, 34, 8); for (let x = (r % 2) * 10 + 4; x < 32; x += 20) { c.beginPath(); c.moveTo(x, r * 8); c.lineTo(x, r * 8 + 8); c.stroke(); } } };
  T(0, floor);
  T(1, () => { floor(); line(c, 6, 5, 14, 14, "#2b2d42", 1.5); line(c, 14, 14, 11, 24, "#2b2d42", 1.5); });
  T(2, () => { floor(); circle(c, 8, 24, 5, "#52796f"); circle(c, 24, 8, 4, "#52796f"); });
  T(3, wall);
  T(4, () => { wall(); c.fillStyle = "#a98467"; c.fillRect(0, 0, 32, 8); });
  T(5, () => { wall(); rrect(c, 6, 4, 20, 28, 9, "#7f5539", "#3f322b", 2); line(c, 16, 6, 16, 32, "#3f322b", 1.5); circle(c, 21, 19, 2, "#ffd23f"); });
  T(6, () => { wall(); rrect(c, 6, 4, 20, 28, 9, "#1b1b1b", "#3f322b", 2); });
  T(7, () => { floor(); for (let i = 0; i < 4; i++) rrect(c, 4 + i * 2, 4 + i * 7, 24 - i * 4, 6, 1, i % 2 ? "#6c757d" : "#8d99ae"); });
  T(8, () => { floor(); rrect(c, 4, 12, 24, 16, 2, "#9c6644", "#583101", 2); rrect(c, 4, 7, 24, 8, 3, "#b07d50", "#583101", 2); rrect(c, 14, 13, 4, 5, 1, "#ffd23f"); });
  T(9, () => { floor(); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) poly(c, [5 + i * 10, 13 + j * 9, 9 + i * 10, 5 + j * 9, 13 + i * 10, 13 + j * 9], "#ced4da", "#495057", 1); });
  T(10, () => { c.fillStyle = "#1d3557"; c.fillRect(0, 0, 32, 32); line(c, 4, 10, 12, 10, "#457b9d", 2); line(c, 18, 22, 28, 22, "#457b9d", 2); });
  T(11, () => { floor(); rrect(c, 8, 2, 16, 28, 3, "#adb5bd", "#495057", 2); line(c, 12, 6, 12, 26, "#ced4da", 2); });
  T(12, () => { floor(); circle(c, 10, 20, 5, "#6c757d", "#495057", 1.5); circle(c, 20, 14, 4, "#8d99ae", "#495057", 1.5); circle(c, 23, 24, 3, "#6c757d"); });
  T(13, () => { wall(); rrect(c, 13, 14, 6, 12, 1, "#6f4518"); circle(c, 16, 11, 5, "#ff9f1c"); circle(c, 16, 10, 2.5, "#ffd23f"); });
  T(14, () => { floor(); c.fillStyle = "#9d0208"; c.fillRect(4, 0, 24, 32); line(c, 7, 0, 7, 32, "#ffba08", 1.5); line(c, 25, 0, 25, 32, "#ffba08", 1.5); });
  T(15, () => { c.fillStyle = "#0b0b12"; c.fillRect(0, 0, 32, 32); });
});
// simple overworld tiles for the first tilemap chapter, 4 per row, 1 row:
//   0 grass  1 water  2 wall  3 sand
add("tilesets/simple_tiles.png", 32 * 4, 32, (c) => {
  c.fillStyle = "#74c69d"; c.fillRect(0, 0, 32, 32); for (let i = 0; i < 8; i++) line(c, rnd() * 30 + 1, 20 + rnd() * 10, rnd() * 30 + 1, 12 + rnd() * 6, "#52b788", 1.5);
  c.fillStyle = "#4895ef"; c.fillRect(32, 0, 32, 32); line(c, 38, 10, 46, 10, "#a2d2ff", 2); line(c, 50, 22, 60, 22, "#a2d2ff", 2);
  c.save(); c.translate(64, 0); c.fillStyle = "#8d99ae"; c.fillRect(0, 0, 32, 32); c.strokeStyle = "#4a4e69"; c.lineWidth = 2;
  for (let r = 0; r < 4; r++) { c.strokeRect(-1, r * 8, 34, 8); for (let x = (r % 2) * 8; x < 32; x += 16) { c.beginPath(); c.moveTo(x, r * 8); c.lineTo(x, r * 8 + 8); c.stroke(); } } c.restore();
  c.fillStyle = "#f4d58d"; c.fillRect(96, 0, 32, 32); for (let i = 0; i < 10; i++) circle(c, 96 + rnd() * 32, rnd() * 32, 1, "#d4a373");
});

// ---- render everything ----
window.renderAll = () => ASSETS.map(([file, w, h, draw]) => {
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); seed = 12345 + file.length; draw(ctx);
  return [file, canvas.toDataURL("image/png")];
});
`;

// ---------------------------------------------------------------------------------------------
// Run the drawing code in headless Chromium and save the results.
// ---------------------------------------------------------------------------------------------
const CHROME =
  `${Deno.env.get("HOME")}/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const port = 9900 + Math.floor(Math.random() * 90);
const profile = await Deno.makeTempDir();
const proc = new Deno.Command(CHROME, {
  args: [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"],
  stdout: "null",
  stderr: "null",
}).spawn();
let wsUrl = "";
for (let i = 0; i < 80 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 100));
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t: { type: string }) => t.type === "page")?.webSocketDebuggerUrl ?? "";
  } catch { /* not up yet */ }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.onopen = r);
// deno-lint-ignore no-explicit-any
const result: any = await new Promise((resolve) => {
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id === 1) resolve(m);
  };
  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: DRAW + "\nJSON.stringify(window.renderAll())", returnByValue: true },
  }));
});
if (result.result.exceptionDetails) {
  console.error(result.result.exceptionDetails.exception?.description ?? result.result.exceptionDetails);
  proc.kill();
  Deno.exit(1);
}
const images: [string, string][] = JSON.parse(result.result.result.value);
for (const [file, dataUrl] of images) {
  const path = join(OUT, file);
  await Deno.mkdir(dirname(path), { recursive: true });
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  await Deno.writeFile(path, Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0)));
}
console.log(`Drew ${images.length} images into assets/`);
ws.close();
proc.kill();
await Deno.remove(profile, { recursive: true }).catch(() => {});
Deno.exit(0);
