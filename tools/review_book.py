#!/usr/bin/env python3
"""Checks the whole book for the things that are easy to get wrong by hand.

    python3 tools/review_book.py

For every chapter listed on the front page it checks that:
  - the chapter README exists, has exactly six numbered challenges, and its word count
  - every image and relative link in every Markdown file resolves
  - every project folder has a README, src/main.ts, a .celbridge file named after the folder
  - the teacher folder has teacher_notes.md, solutions.md, slides.md (starting with marp: true)
  - there are six solution projects, numbered 1-6
"""
import os
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
problems = []


def problem(msg):
    problems.append(msg)


def check_links(md_path):
    text = open(md_path, encoding="utf-8").read()
    # ignore fenced code blocks
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    # and inline code
    text = re.sub(r"`[^`\n]*`", "", text)
    for m in re.finditer(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)", text):
        target = m.group(1)
        if re.match(r"^(https?:|mailto:|#)", target):
            continue
        target = target.split("#")[0]
        if not target:
            continue
        full = os.path.normpath(os.path.join(os.path.dirname(md_path), target))
        if not os.path.exists(full):
            problem(f"{os.path.relpath(md_path, ROOT)}: broken link -> {target}")


front = open(os.path.join(ROOT, "README.md"), encoding="utf-8").read()
chapters = re.findall(r"\(chapters/(ch\d\d_[a-z_]+)/README\.md\)", front)

print(f"{'chapter':34} {'words':>6} {'chal':>4} {'proj':>4} {'sol':>4} {'imgs':>4}")
for ch in chapters:
    cdir = os.path.join(ROOT, "chapters", ch)
    tdir = os.path.join(ROOT, "teacher", ch)
    readme = os.path.join(cdir, "README.md")
    if not os.path.exists(readme):
        problem(f"{ch}: no chapter README")
        print(f"{ch:34} {'-':>6}")
        continue
    text = open(readme, encoding="utf-8").read()
    words = len(re.sub(r"```.*?```", "", text, flags=re.S).split())
    chal = ""
    m = re.search(r"^## Challenges\s*$(.*?)(^---|^## |\Z)", text, flags=re.M | re.S)
    if m:
        nums = re.findall(r"^(\d)\. ", m.group(1), flags=re.M)
        chal = len(nums)
        if nums != ["1", "2", "3", "4", "5", "6"]:
            problem(f"{ch}: challenges numbered {nums}")
    else:
        problem(f"{ch}: no '## Challenges' section")

    projects = []
    pdir = os.path.join(cdir, "projects")
    if os.path.isdir(pdir):
        projects = sorted(d for d in os.listdir(pdir) if os.path.isdir(os.path.join(pdir, d)))
    for p in projects:
        pp = os.path.join(pdir, p)
        for need in ["README.md", "src/main.ts", f"{p}.celbridge", "public/index.html", "deno.json", "build.ts"]:
            if not os.path.exists(os.path.join(pp, need)):
                problem(f"{ch}/projects/{p}: missing {need}")

    sols = []
    sdir = os.path.join(tdir, "solutions")
    if os.path.isdir(sdir):
        sols = sorted(d for d in os.listdir(sdir) if os.path.isdir(os.path.join(sdir, d)))
        ks = sorted(re.match(r"ch\d\d_challenge_(\d)_", s).group(1) for s in sols if re.match(r"ch\d\d_challenge_(\d)_", s))
        if ks != ["1", "2", "3", "4", "5", "6"]:
            problem(f"{ch}: solution projects numbered {ks}")
        for s in sols:
            sp = os.path.join(sdir, s)
            for need in ["README.md", "src/main.ts", f"{s}.celbridge"]:
                if not os.path.exists(os.path.join(sp, need)):
                    problem(f"{ch}/solutions/{s}: missing {need}")
    else:
        problem(f"{ch}: no teacher solutions folder")

    for need in ["teacher_notes.md", "solutions.md", "slides.md"]:
        if not os.path.exists(os.path.join(tdir, need)):
            problem(f"{ch}: missing teacher/{need}")
    slides = os.path.join(tdir, "slides.md")
    if os.path.exists(slides) and "marp: true" not in open(slides, encoding="utf-8").read()[:200]:
        problem(f"{ch}: slides.md does not start with marp front matter")

    idir = os.path.join(cdir, "images")
    imgs = len(os.listdir(idir)) if os.path.isdir(idir) else 0
    print(f"{ch:34} {words:>6} {str(chal):>4} {len(projects):>4} {len(sols):>4} {imgs:>4}")

for base in ["chapters", "teacher"]:
    for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, base)):
        dirnames[:] = [d for d in dirnames if d not in ("dist", "node_modules", ".celbridge")]
        for f in filenames:
            if f.endswith(".md"):
                check_links(os.path.join(dirpath, f))
for f in ["README.md", "teacher/README.md", "assets/README.md", "tools/AUTHORING.md"]:
    check_links(os.path.join(ROOT, f))

print()
if problems:
    print(f"{len(problems)} problems:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("No problems found.")
