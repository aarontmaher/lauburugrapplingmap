#!/bin/bash
# Paste content into the active Claude Code session in Terminal.
#
# Usage:
#   paste_to_code.sh                    # read from last_chatgpt_reply.txt, paste only
#   paste_to_code.sh --submit           # read from file, paste + press Return
#   paste_to_code.sh --clipboard        # read from current clipboard, paste only
#   paste_to_code.sh --clipboard --submit  # read from clipboard, paste + submit
#
# The submit step waits for the paste to fully render before pressing Return.
# Uses a longer delay (2s) to handle large multi-line pastes.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
REPLY="$DIR/last_chatgpt_reply.txt"
SUBMIT=false
USE_CLIPBOARD=false

for arg in "$@"; do
  case "$arg" in
    --submit) SUBMIT=true ;;
    --clipboard) USE_CLIPBOARD=true ;;
  esac
done

# Step 1: Get content
if [ "$USE_CLIPBOARD" = true ]; then
  CONTENT=$(pbpaste 2>/dev/null || true)
  if [ -z "$CONTENT" ]; then
    echo "FAIL: Clipboard is empty."
    exit 1
  fi
  BYTE_COUNT=${#CONTENT}
  echo "Clipboard: $BYTE_COUNT bytes."
  echo "$CONTENT" > "$REPLY"
else
  if [ ! -f "$REPLY" ]; then
    echo "FAIL: $REPLY does not exist."
    exit 1
  fi
  if [ ! -s "$REPLY" ]; then
    echo "FAIL: $REPLY is empty."
    exit 1
  fi
  BYTE_COUNT=$(wc -c < "$REPLY" | tr -d ' ')
  echo "Reply file: $BYTE_COUNT bytes."
  pbcopy < "$REPLY"
fi

echo "Activating Terminal..."

# Step 2: Activate Terminal, paste, wait, then submit
SHOULD_SUBMIT="$SUBMIT"
osascript <<ENDSCRIPT
tell application "Terminal"
    activate
end tell

-- Wait for Terminal to become frontmost
delay 0.5
tell application "System Events"
    set tries to 0
    repeat while (name of first process whose frontmost is true) is not "Terminal"
        delay 0.2
        set tries to tries + 1
        if tries > 15 then
            error "Terminal did not become frontmost"
        end if
    end repeat
end tell

-- Paste from clipboard
delay 0.3
tell application "System Events"
    tell process "Terminal"
        keystroke "v" using command down
    end tell
end tell

-- Wait for paste to fully render (large pastes take time)
if "$SHOULD_SUBMIT" is "true" then
    delay 2.0
    -- Press Return to submit the pasted content
    tell application "System Events"
        tell process "Terminal"
            key code 36
        end tell
    end tell
    -- Second Return in case first was consumed by paste bracket
    delay 0.3
    tell application "System Events"
        tell process "Terminal"
            key code 36
        end tell
    end tell
end if
ENDSCRIPT

if [ $? -eq 0 ]; then
  if [ "$SUBMIT" = true ]; then
    echo "OK: Pasted and submitted ($BYTE_COUNT bytes)."
  else
    echo "OK: Pasted ($BYTE_COUNT bytes). Press Return to submit."
  fi
else
  echo "FAIL: AppleScript error."
  exit 1
fi
