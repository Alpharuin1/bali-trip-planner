#!/bin/bash
# Push this project to a new GitHub repo.
# 1. Create an empty repo at https://github.com/new (no README / .gitignore)
# 2. Run: ./push-to-github.sh YOUR_GITHUB_USERNAME REPO_NAME

set -e
USER="${1:-Alpharuin1}"
REPO="${2:-bali-trip-planner}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${USER}/${REPO}.git"
git branch -M main

echo "Pushing to https://github.com/${USER}/${REPO} ..."
git push -u origin main

echo ""
echo "Done! Share this link:"
echo "https://github.com/${USER}/${REPO}"
