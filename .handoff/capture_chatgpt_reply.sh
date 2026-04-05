#!/bin/bash
# Capture the latest ChatGPT assistant reply.
#
# Two modes:
#   capture_chatgpt_reply.sh           # read from clipboard (safest)
#   capture_chatgpt_reply.sh --auto    # read directly from ChatGPT app via accessibility
#
# --auto mode reads the last assistant reply text directly from the ChatGPT
# app's accessibility tree without selecting/copying anything. This avoids
# the Cmd+A self-loop problem entirely.
#
# Loop prevention:
#   - Rejects content containing "PROMPT-ID:" (replayed user prompt)
#   - Rejects content shorter than 10 bytes
#   - --auto mode reads only from the message area, not the input box

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
REPLY="$DIR/last_chatgpt_reply.txt"

if [ "${1:-}" = "--auto" ]; then
  echo "Auto-capturing from ChatGPT app accessibility tree..."

  # Read the latest assistant reply directly from the accessibility tree
  # Structure: group 1 > splitter group 1 > group 1 > scroll area 1 > list 1 > list 1 > group N > group 1
  # The reply text is in the description attribute of static text elements
  CONTENT=$(osascript << 'APPLESCRIPT'
tell application "ChatGPT"
    activate
end tell
delay 0.3

tell application "System Events"
    tell process "ChatGPT"
        set chatPath to group 1 of splitter group 1 of group 1 of window 1
        set scrollArea to scroll area 1 of chatPath
        set mainList to list 1 of scrollArea
        set msgList to list 1 of mainList
        set msgCount to count of groups of msgList

        if msgCount < 1 then
            return ""
        end if

        -- Get the last message group
        set lastMsg to group msgCount of msgList

        -- Collect all static text descriptions from the message
        set allTexts to every static text of group 1 of lastMsg
        set replyText to ""
        repeat with t in allTexts
            try
                set d to description of t
                -- Skip short metadata labels like "text", "heading"
                if length of d > 20 then
                    set replyText to replyText & d & return
                end if
            end try
        end repeat

        return replyText
    end tell
end tell
APPLESCRIPT
  ) || true

  if [ -z "$CONTENT" ]; then
    echo "FAIL: Could not read reply from ChatGPT app."
    echo "The app may not be open, or accessibility permissions are missing."
    exit 1
  fi
else
  # Clipboard mode (default)
  CONTENT=$(pbpaste 2>/dev/null || true)
  if [ -z "$CONTENT" ]; then
    echo "FAIL: Clipboard is empty. Select and copy the ChatGPT reply first."
    exit 1
  fi
fi

BYTE_COUNT=${#CONTENT}

if [ "$BYTE_COUNT" -lt 10 ]; then
  echo "FAIL: Content too short ($BYTE_COUNT bytes)."
  exit 1
fi

# Loop prevention: reject if line 1 starts with PROMPT-ID (raw prompt, not a reply)
# Note: PROMPT-ID appearing later in the reply is expected (it's the next prompt for Code)
FIRST_LINE=$(echo "$CONTENT" | head -1)
if echo "$FIRST_LINE" | grep -q '^PROMPT-ID:'; then
  echo "FAIL: First line is 'PROMPT-ID:' — this is a raw prompt, not an assistant reply."
  echo "The capture grabbed the wrong content. Select only the assistant reply."
  exit 1
fi

# If START CODE PROMPT markers are present, extract just the prompt portion
# (the full reply is captured, but Code only needs the prompt)
PROMPT_CONTENT=$(echo "$CONTENT" | sed -n '/^START CODE PROMPT$/,/^END CODE PROMPT$/p' | sed '1d;$d')
if [ -n "$PROMPT_CONTENT" ]; then
  echo "$PROMPT_CONTENT" > "$REPLY"
  EXTRACTED=${#PROMPT_CONTENT}
  echo "OK: Extracted prompt ($EXTRACTED bytes) from $BYTE_COUNT byte reply."
  echo "Preview: $(echo "$PROMPT_CONTENT" | head -1 | cut -c1-80)"
else
  # No markers — write the full reply (backward compatible)
  echo "$CONTENT" > "$REPLY"
  echo "OK: Captured $BYTE_COUNT bytes to last_chatgpt_reply.txt (no prompt markers found)."
  echo "Preview: $(echo "$CONTENT" | head -1 | cut -c1-80)"
fi
