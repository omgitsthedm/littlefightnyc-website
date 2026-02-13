#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Permanent no-go colors / effects
FORBIDDEN_REGEX='B74300|b74300|C74400|c74400|983700|933500|a33b00|A33B00|brightness\(0\.9\)'

if grep -RIn -E "$FORBIDDEN_REGEX" . \
  --include='*.html' \
  --include='*.css' \
  --exclude-dir='.netlify' \
  --exclude-dir='node_modules' \
  --exclude-dir='.git'
then
  echo
  echo "Forbidden color/effect found. Remove before deploy."
  exit 1
fi

echo "Brand palette enforcement passed."
