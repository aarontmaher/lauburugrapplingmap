#!/bin/bash
# watch-automation.sh — Background watcher that sends queued prompts to Claude Code.
#
# Polls every 5 seconds for .prompt_ready flag.
# When found: copies next_automation_prompt.txt → last_chatgpt_reply.txt,
# runs paste_to_code.sh --submit, then clears the queue.
#
# Runs as a launchd agent — same pattern as watch-scaffold.sh.

DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE_FILE="$DIR/next_automation_prompt.txt"
READY_FLAG="$DIR/.prompt_ready"
REPLY_FILE="$DIR/last_chatgpt_reply.txt"

echo "[watch-automation] started at $(date)"

while true; do
  if [ -f "$READY_FLAG" ] && [ -f "$QUEUE_FILE" ] && [ -s "$QUEUE_FILE" ]; then
    echo "[watch-automation] prompt ready — sending at $(date)"

    # Wait a moment for Code to finish outputting
    sleep 3

    # Copy to the file paste_to_code.sh reads
    cp "$QUEUE_FILE" "$REPLY_FILE"

    # Send it
    bash "$DIR/paste_to_code.sh" --submit

    # Clear queue
    rm -f "$QUEUE_FILE" "$READY_FLAG"

    echo "[watch-automation] sent OK at $(date)"
  fi

  sleep 5
done
