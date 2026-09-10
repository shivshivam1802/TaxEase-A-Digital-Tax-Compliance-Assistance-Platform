#!/usr/bin/env bash
# Commit as Shivam Kumar only — no Co-authored-by trailer.
set -euo pipefail

AUTHOR_NAME="Shivam Kumar"
AUTHOR_EMAIL="171482768+shivshivam1802@users.noreply.github.com"

ROOT="$(git rev-parse --show-toplevel)"
GIT_DIR="$(git rev-parse --git-dir)"
HOOKS="$GIT_DIR/hooks"

export GIT_AUTHOR_NAME="$AUTHOR_NAME"
export GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL"
export GIT_COMMITTER_NAME="$AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL"

mkdir -p "$HOOKS"
install -m 0755 "$ROOT/.githooks/commit-msg" "$HOOKS/commit-msg"
install -m 0755 "$ROOT/.githooks/post-commit" "$HOOKS/post-commit"

if [[ $# -eq 0 ]]; then
  echo "Usage: scripts/commit-as-me.sh \"commit message\"" >&2
  echo "   or: scripts/commit-as-me.sh -m \"commit message\" [git commit args…]" >&2
  exit 1
fi

if [[ "${1:-}" == "-m" || "${1:-}" == "--message" ]]; then
  git -c "user.name=$AUTHOR_NAME" -c "user.email=$AUTHOR_EMAIL" commit "$@"
else
  git -c "user.name=$AUTHOR_NAME" -c "user.email=$AUTHOR_EMAIL" commit -m "$*"
fi

# Cursor may append Co-authored-by after git hooks. Strip it and reset identity.
body="$(git log -1 --format='%B')"
if echo "$body" | grep -q -E '^Co-authored-by:' || \
   [[ "$(git log -1 --format='%an')" != "$AUTHOR_NAME" ]]; then
  tmp="$(mktemp)"
  printf '%s\n' "$body" | grep -v -E '^Co-authored-by:|^Signed-off-by: Cursor|^Made-with: Cursor' > "$tmp"
  export SKIP_AUTHOR_FIX=1
  git -c "user.name=$AUTHOR_NAME" -c "user.email=$AUTHOR_EMAIL" \
    commit --amend --no-verify --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" --file="$tmp"
  rm -f "$tmp"
fi
