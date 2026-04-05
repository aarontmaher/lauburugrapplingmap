#!/bin/bash
# queue_next_prompt.sh — Write next automation prompt to file for KM bridge.
#
# Usage:
#   echo "prompt text" | bash queue_next_prompt.sh
#   bash queue_next_prompt.sh "prompt text"
#
# KM then runs paste_to_code.sh --submit to send it to Terminal.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE_FILE="$DIR/next_automation_prompt.txt"
READY_FLAG="$DIR/.prompt_ready"

if [ $# -gt 0 ]; then
  echo "$*" > "$QUEUE_FILE"
else
  cat > "$QUEUE_FILE"
fi

BYTE_COUNT=$(wc -c < "$QUEUE_FILE" | tr -d ' ')
if [ "$BYTE_COUNT" -eq 0 ]; then
  echo "FAIL: empty prompt"
  exit 1
fi

# Signal KM that a prompt is ready
touch "$READY_FLAG"
echo "OK: queued $BYTE_COUNT bytes -> $QUEUE_FILE"
