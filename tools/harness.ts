// Drives a built game in headless Chromium: key presses, clicks, JavaScript, and screenshots.
// An authoring tool - used to test the projects and to take the screenshots in the chapters.
//
//   deno run -A tools/harness.ts <url> '<json actions>' [--scale 0.6]
//
// Serve the guide's root folder first, e.g.
//   deno run -A jsr:@std/http@^1/file-server . --port 8123 --host 127.0.0.1
// and pass a url such as http://127.0.0.1:8123/chapters/ch02_three_scenes/projects/ch02_bouncing_ball/dist/
//
// The game's bundle is rewritten on the way in so that the Phaser.Game is available to "eval"
// actions as `game` (e.g. game.scene.getScene("GameScene").score). The project's code is untouched.
//
// Actions (run in order):
//   {"wait": ms}                       wait
//   {"down": "Space"} {"up": "Space"}  hold / release a key
//   {"press": "Space", "hold": ms}     press and release a key (hold defaults to 100)
//   {"click": [x, y]}                  click at game coordinates (0-800, 0-600)
//   {"move": [x, y]}                   move the mouse to game coordinates
//   {"eval": "js expression"}          evaluate in the page and print the result
//   {"shot": "path/to/file.png"}       screenshot of the game canvas (path relative to cwd)
//
// Key names: Space Enter Escape ArrowLeft ArrowRight ArrowUp ArrowDown, KeyA..KeyZ, Digit0..Digit9,
//            ShiftLeft

const args = [...Deno.args];
let scale = 0.6;
const scaleAt = args.indexOf("--scale");
if (scaleAt >= 0) {
  scale = Number(args[scaleAt + 1]);
  args.splice(scaleAt, 2);
}
const [url, actionsJson] = args;
const actions = JSON.parse(actionsJson ?? "[]");

const CHROME =
  `${Deno.env.get("HOME")}/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const port = 9300 + Math.floor(Math.random() * 600);
const profile = await Deno.makeTempDir();
const proc = new Deno.Command(CHROME, {
  args: [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=900,1000",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--autoplay-policy=no-user-gesture-required",
    "about:blank",
  ],
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

let id = 0;
// deno-lint-ignore no-explicit-any
const pending = new Map<number, (v: any) => void>();
// deno-lint-ignore no-explicit-any
function send(method: string, params: Record<string, unknown> = {}): Promise<any> {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pending.set(i, r));
}

ws.onmessage = async (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)!(m);
    pending.delete(m.id);
  } else if (m.method === "Runtime.consoleAPICalled") {
    const text = m.params.args.map((a: { value?: unknown; description?: string }) => a.value ?? a.description).join(" ");
    if (!text.includes("phaser.io")) console.log(`[console.${m.params.type}]`, text);
  } else if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    console.log("[EXCEPTION]", d.exception?.description ?? d.text);
  } else if (m.method === "Fetch.requestPaused") {
    // expose the game: "new X.Game(" -> "globalThis.game = new X.Game("
    const reqId = m.params.requestId;
    const r = await fetch(m.params.request.url);
    let body = await r.text();
    body = body.replace(/new ([\w$.]+)\.Game\(/g, "globalThis.game = new $1.Game(");
    const bytes = new TextEncoder().encode(body);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    send("Fetch.fulfillRequest", {
      requestId: reqId,
      responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: "text/javascript" }],
      body: btoa(bin),
    });
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function keyInfo(name: string): [string, string, number] {
  const special: Record<string, [string, number]> = {
    Space: [" ", 32],
    Enter: ["Enter", 13],
    Escape: ["Escape", 27],
    ArrowLeft: ["ArrowLeft", 37],
    ArrowUp: ["ArrowUp", 38],
    ArrowRight: ["ArrowRight", 39],
    ArrowDown: ["ArrowDown", 40],
    ShiftLeft: ["Shift", 16],
  };
  if (special[name]) return [special[name][0], name, special[name][1]];
  if (/^Key[A-Z]$/.test(name)) return [name[3].toLowerCase(), name, name.charCodeAt(3)];
  if (/^Digit[0-9]$/.test(name)) return [name[5], name, name.charCodeAt(5)];
  throw new Error(`unknown key ${name}`);
}
async function key(type: string, name: string) {
  const [k, code, vk] = keyInfo(name);
  await send("Input.dispatchKeyEvent", {
    type,
    key: k,
    code,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
    text: type === "keyDown" && k.length === 1 ? k : undefined,
  });
}
async function evaluate(expression: string) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
}
async function canvasRect() {
  return JSON.parse(await evaluate(
    "JSON.stringify((()=>{const c=document.querySelector('canvas');const b=c.getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,vx:b.x,vy:b.y,w:b.width,h:b.height}})())",
  ));
}
async function toPage(x: number, y: number) {
  const b = await canvasRect();
  const w = await evaluate("globalThis.game ? game.scale.width : 800");
  const h = await evaluate("globalThis.game ? game.scale.height : 600");
  return [b.vx + x * b.w / w, b.vy + y * b.h / h];
}

await send("Runtime.enable");
await send("Page.enable");
await send("Fetch.enable", { patterns: [{ urlPattern: "*game.js*", requestStage: "Response" }] });
await send("Page.navigate", { url });
for (let i = 0; i < 100; i++) {
  await sleep(100);
  if (await evaluate("!!(globalThis.game && game.isRunning && document.querySelector('canvas'))")) break;
}
await sleep(600);
await evaluate("document.querySelector('canvas').scrollIntoView()");
await sleep(100);

for (const a of actions) {
  if (a.wait) await sleep(a.wait);
  if (a.down) await key("keyDown", a.down);
  if (a.up) await key("keyUp", a.up);
  if (a.press) {
    await key("keyDown", a.press);
    await sleep(a.hold ?? 100);
    await key("keyUp", a.press);
  }
  if (a.move) {
    const [x, y] = await toPage(a.move[0], a.move[1]);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  }
  if (a.click) {
    const [x, y] = await toPage(a.click[0], a.click[1]);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await sleep(50);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await sleep(80);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }
  if (a.eval) console.log("[eval]", JSON.stringify(await evaluate(a.eval)));
  if (a.shot) {
    const b = await canvasRect();
    const r = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale },
      captureBeyondViewport: true,
    });
    const file = a.shot as string;
    const dir = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : ".";
    await Deno.mkdir(dir, { recursive: true });
    await Deno.writeFile(file, Uint8Array.from(atob(r.result.data), (c) => c.charCodeAt(0)));
    console.log("[shot]", file);
  }
}

ws.close();
proc.kill();
await Deno.remove(profile, { recursive: true }).catch(() => {});
Deno.exit(0);
