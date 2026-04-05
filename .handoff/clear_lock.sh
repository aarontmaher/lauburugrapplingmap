#!/bin/bash
# Release the automation lock.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LOCK="$DIR/run.lock"

if [ -f "$LOCK" ]; then
  rm "$LOCK"
  echo "Lock released."
else
  echo "No lock to release."
fi
