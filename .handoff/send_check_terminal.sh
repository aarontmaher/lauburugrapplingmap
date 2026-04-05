#!/bin/zsh
# Send "check terminal" to the ChatGPT macOS app.
# Activates the ChatGPT app, focuses the chat input, types and sends.
# Requires: ChatGPT desktop app installed, accessibility permissions granted.

set -euo pipefail

osascript <<'APPLESCRIPT'
-- Activate ChatGPT app
tell application "ChatGPT"
    activate
end tell

delay 0.5

-- Type "check terminal" and press Return
tell application "System Events"
    tell process "ChatGPT"
        keystroke "check terminal"
        delay 0.2
        key code 36 -- Return
    end tell
end tell
APPLESCRIPT

echo "Sent 'check terminal' to ChatGPT app."
