#!/usr/bin/env bash
# Copies an existing project to a new folder (e.g. to start a challenge solution from a chapter
# project), leaving out build output and Celbridge's per-machine folder, and renaming the
# .celbridge file to match the new folder.
#
#   tools/copy_project.sh <from folder> <to folder>
set -euo pipefail
FROM="$1"; TO="$2"
if [ -e "$TO" ]; then echo "$TO already exists" >&2; exit 1; fi
mkdir -p "$(dirname "$TO")"
rsync -a --exclude dist/ --exclude .celbridge/ --exclude .DS_Store "$FROM/" "$TO/"
mv "$TO"/*.celbridge "$TO/$(basename "$TO").celbridge"
echo "Copied $FROM -> $TO"
