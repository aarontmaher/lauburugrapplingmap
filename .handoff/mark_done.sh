#!/bin/bash
# Mark Claude Code task as complete. Writes the result to last_code_result.txt
# and creates done.signal to trigger the automation.
# Usage: mark_done.sh "PROMPT-ID | DONE | ..."

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LOCK="$DIR/run.lock"
SIGNAL="$DIR/done.signal"
RESULT="$DIR/last_code_result.txt"

# Safety: refuse if lock is held (automation is mid-cycle)
if [ -f "$LOCK" ]; then
  echo "ERROR: Lock file exists — automation is mid-cycle. Waiting..."
  for i in {1..30}; do
    sleep 1
    [ ! -f "$LOCK" ] && break
  done
  if [ -f "$LOCK" ]; then
    echo "ERROR: Lock still held after 30s. Aborting."
    exit 1
  fi
fi

# Safety: refuse if signal already exists (previous result not yet consumed)
if [ -f "$SIGNAL" ]; then
  echo "WARNING: Previous done.signal still exists (not yet consumed)."
  echo "Overwriting with new result."
fi

# Write result (skip if last_code_result.txt was already written by write_code_result.sh)
if [ $# -gt 0 ]; then
  echo "$*" > "$RESULT"
elif [ ! -s "$RESULT" ]; then
  # Read from stdin only if result file is empty/missing
  cat > "$RESULT"
fi

echo "$(date +%Y%m%d_%H%M%S)" > "$SIGNAL"
echo "Done signal created. Result saved to last_code_result.txt"
