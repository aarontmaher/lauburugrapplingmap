#!/bin/bash
# Clear the done signal after automation has consumed it.
# Called by the automation after sending "check terminal" to ChatGPT.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
SIGNAL="$DIR/done.signal"

if [ -f "$SIGNAL" ]; then
  rm "$SIGNAL"
  echo "Done signal cleared."
else
  echo "No done signal to clear."
fi
