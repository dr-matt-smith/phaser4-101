#!/usr/bin/env python3
# Gives every solution project's README a title and a "teacher's solution" note.
#   python3 tools/tag_solutions.py teacher/chNN_x "Chapter N"
# Folder names must look like chNN_challenge_K_some_name.
import os, re, sys
folder, chapter = sys.argv[1], sys.argv[2]
sol = os.path.join(folder, "solutions")
for name in sorted(os.listdir(sol)):
    m = re.match(r"ch\d+_challenge_(\d)_(.+)", name)
    if not m:
        continue
    k, title = m.group(1), m.group(2).replace("_", " ").capitalize()
    p = os.path.join(sol, name, "README.md")
    s = open(p).read()
    if "Teacher's solution" in s:
        continue
    first, rest = s.split("\n", 1)
    s = (f"# {chapter}, challenge {k} - {title}\n\n**Teacher's solution to {chapter}, challenge {k}.** "
         f"See `../../solutions.md` for the explanation. Every change from the chapter project is marked "
         f"with a `// CHALLENGE {k}` comment.\n\n(Originally: {first.lstrip('# ')})\n" + rest)
    open(p, "w").write(s)
    print("tagged", name)
