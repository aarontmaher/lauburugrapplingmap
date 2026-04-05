#!/bin/bash
# send_queued_prompt.sh — KM calls this to send the queued prompt to Claude Code.
#
# Flow:
#   1. Check if .prompt_ready flag exists
#   2. If yes: copy next_automation_prompt.txt to last_chatgpt_reply.txt
#   3. Run paste_to_code.sh --submit
#   4. Clear the queue + flag
#
# KM should call this every 5-10 seconds via DETECT-CODE-DONE macro.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE_FILE="$DIR/next_automation_prompt.txt"
READY_FLAG="$DIR/.prompt_ready"
REPLY_FILE="$DIR/last_chatgpt_reply.txt"

# Exit silently if no prompt is ready
if [ ! -f "$READY_FLAG" ]; then
  exit 0
fi

if [ ! -f "$QUEUE_FILE" ] || [ ! -s "$QUEUE_FILE" ]; then
  rm -f "$READY_FLAG"
  exit 0
fi

# Copy queued prompt to the file paste_to_code.sh reads from
cp "$QUEUE_FILE" "$REPLY_FILE"

# Send it
bash "$DIR/paste_to_code.sh" --submit

# Clear queue
rm -f "$QUEUE_FILE" "$READY_FLAG"
echo "OK: sent queued prompt to Terminal"
