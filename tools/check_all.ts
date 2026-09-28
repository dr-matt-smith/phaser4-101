// Type checks (and optionally builds) every project in the guide.
//
//   deno run -A tools/check_all.ts            type check every project
//   deno run -A tools/check_all.ts --build    build every project too
//   deno run -A tools/check_all.ts chapters/ch05_audio    only projects under this folder

import { dirname, fromFileUrl, join, relative } from "jsr:@std/path@^1";
import { walk } from "jsr:@std/fs@^1/walk";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const build = Deno.args.includes("--build");
const under = Deno.args.find((a) => !a.startsWith("--")) ?? ".";

const projects: string[] = [];
for await (const entry of walk(join(ROOT, under), { match: [/build\.ts$/], skip: [/node_modules/, /dist/, /template/] })) {
  projects.push(dirname(entry.path));
}
projects.sort();

let failed = 0;
for (const project of projects) {
  const args = build ? ["task", "build"] : ["check", "src/main.ts"];
  const result = await new Deno.Command(Deno.execPath(), { args, cwd: project, stdout: "piped", stderr: "piped" }).output();
  const out = new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
  const bad = !result.success || /error|could not/i.test(out.replace(/TS\d+ \[WARN\]/g, ""));
  if (bad) {
    failed++;
    console.log(`FAIL  ${relative(ROOT, project)}\n${out}`);
  } else {
    console.log(`ok    ${relative(ROOT, project)}`);
  }
}
console.log(`\n${projects.length} projects, ${failed} failed`);
Deno.exit(failed > 0 ? 1 : 0);
