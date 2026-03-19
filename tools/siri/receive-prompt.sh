#!/bin/bash
# tools/siri/receive-prompt.sh
# Called by Zapier webhook → SSH → this script
# Writes incoming prompt to bridge.md for Code to pick up
# Usage: bash receive-prompt.sh "PROMPT TEXT"

set -euo pipefail

PROMPT_TEXT="${1:-}"
BRIDGE="${HOME}/GrapplingMap/bridge.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [[ -z "$PROMPT_TEXT" ]]; then
    echo "ERROR: No prompt text provided."
    echo "Usage: bash receive-prompt.sh \"PROMPT TEXT\""
    exit 1
fi

if [[ ! -f "$BRIDGE" ]]; then
    echo "ERROR: bridge.md not found at $BRIDGE"
    exit 1
fi

cat >> "$BRIDGE" << ENTRY

---
## INCOMING PROMPT — $TIMESTAMP
$PROMPT_TEXT
---
ENTRY

echo "Prompt written to bridge.md at $TIMESTAMP"
