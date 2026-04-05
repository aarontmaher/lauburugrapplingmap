#!/bin/bash
# Acquire the automation lock. Prevents duplicate triggers.
# Returns exit code 1 if lock already held.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LOCK="$DIR/run.lock"

if [ -f "$LOCK" ]; then
  echo "ERROR: Lock already held (created $(cat "$LOCK"))"
  exit 1
fi

echo "$(date +%Y%m%d_%H%M%S)" > "$LOCK"
echo "Lock acquired."
