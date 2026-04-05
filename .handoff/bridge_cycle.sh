#!/bin/bash
# Full bridge cycle: detect Code completion → notify ChatGPT app → wait for reply → paste to Code.
# This is the main loop script called by Keyboard Maestro or run manually.
# Uses the ChatGPT macOS app (not browser) via send_check_terminal.sh.
#
# SAFETY:
# - Lock file prevents concurrent runs
# - Max wait timeout prevents infinite hangs
# - Archive before each cycle preserves history
# - Signal file must exist to trigger

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
SIGNAL="$DIR/done.signal"
LOCK="$DIR/run.lock"
REPLY="$DIR/last_chatgpt_reply.txt"
MAX_WAIT=300  # seconds to wait for ChatGPT reply

# Step 0: Check signal exists
if [ ! -f "$SIGNAL" ]; then
  echo "No done signal. Nothing to do."
  exit 0
fi

# Step 1: Acquire lock
if ! bash "$DIR/set_lock.sh"; then
  echo "Lock held — another cycle is running. Aborting."
  exit 1
fi

# Step 2: Archive previous state
bash "$DIR/archive_result.sh"

# Step 3: Clear old reply
> "$REPLY"

# Step 4: Clear done signal
bash "$DIR/clear_done.sh"

# Step 5: Send "check terminal" to ChatGPT
echo "Sending 'check terminal' to ChatGPT..."
bash "$DIR/send_check_terminal.sh"

# Step 6: Wait for ChatGPT to respond, then auto-capture via accessibility tree
echo "Waiting 60s for ChatGPT to respond..."
sleep 60

echo "Auto-capturing reply from ChatGPT app..."
bash "$DIR/capture_chatgpt_reply.sh" --auto || true

# Fallback: poll for manual capture if auto failed
if [ ! -s "$REPLY" ]; then
  echo "Auto-capture failed. Waiting for manual capture..."
  echo "(Max wait: ${MAX_WAIT}s)"
  WAITED=0
  while [ $WAITED -lt $MAX_WAIT ]; do
    if [ -s "$REPLY" ]; then
      echo "Reply detected after ${WAITED}s."
      break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
  done
fi

if [ ! -s "$REPLY" ]; then
  echo "TIMEOUT: No ChatGPT reply after waiting. Releasing lock."
  bash "$DIR/clear_lock.sh"
  exit 1
fi

# Step 7: Paste reply to Claude Code (use --submit for auto-send, or omit for paste-only)
echo "Pasting reply to Claude Code..."
bash "$DIR/paste_to_code.sh" --submit

# Step 8: Release lock
bash "$DIR/clear_lock.sh"

echo "Bridge cycle complete."
