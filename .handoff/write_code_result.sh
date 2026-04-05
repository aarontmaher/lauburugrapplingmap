#!/bin/bash
# Write the final DONE block from Claude Code output to the handoff file.
#
# Usage options:
#   1. Pipe terminal output:  echo "PROMPT-ID | DONE | ..." | write_code_result.sh
#   2. Pass as argument:      write_code_result.sh "PROMPT-ID | DONE | ..."
#   3. Extract from scrollback: write_code_result.sh --extract
#      (reads last 200 lines of Terminal scrollback via osascript)
#
# Only writes if input contains "| DONE |" — prevents partial/junk writes.
# After writing, calls mark_done.sh to create done.signal for the detector.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
RESULT="$DIR/last_code_result.txt"

# Gather input
INPUT=""
if [ "${1:-}" = "--extract" ]; then
  # Extract from most recent Terminal scrollback
  INPUT=$(osascript -e '
    tell application "Terminal"
      set t to contents of selected tab of front window
      return t
    end tell
  ' 2>/dev/null | tail -200 || echo "")
elif [ $# -gt 0 ]; then
  INPUT="$*"
else
  INPUT=$(cat)
fi

if [ -z "$INPUT" ]; then
  echo "ERROR: No input provided."
  exit 1
fi

# Extract the DONE block — find the last line containing "| DONE |"
DONE_LINE=$(echo "$INPUT" | grep '| DONE |' | tail -1 || true)

if [ -z "$DONE_LINE" ]; then
  echo "ERROR: No '| DONE |' marker found in input. Not writing."
  exit 1
fi

# Also capture the "— FROM: CODE" line if present (next non-empty line after DONE)
FROM_LINE=$(echo "$INPUT" | grep -A2 '| DONE |' | grep 'FROM: CODE' | tail -1 || true)

# Build result block
{
  echo "$DONE_LINE"
  [ -n "$FROM_LINE" ] && echo "$FROM_LINE"
} > "$RESULT"

echo "Result written: $(head -1 "$RESULT")"

# Trigger the bridge detector
bash "$DIR/mark_done.sh" < "$RESULT"
