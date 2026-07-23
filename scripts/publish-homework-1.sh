#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="Homework-1"
REMOTE="git@github.com:PRangsi1886/${REPO_NAME}.git"

cd "$REPO_DIR"

echo "==> Checking GitHub authentication..."
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not logged in."
  echo "Run: gh auth login --hostname github.com --git-protocol ssh --web"
  echo "Then re-run this script."
  exit 1
fi

echo "==> Ensuring origin remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

echo "==> Creating repo if needed..."
if ! gh repo view "PRangsi1886/${REPO_NAME}" >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" \
    --public \
    --description "Theatre Theatrics — YouTube reaction analyzer" \
    --source=. \
    --remote=origin
else
  echo "Repo already exists."
fi

echo "==> Pushing main..."
git push -u origin main

echo ""
echo "Done! https://github.com/PRangsi1886/${REPO_NAME}"
