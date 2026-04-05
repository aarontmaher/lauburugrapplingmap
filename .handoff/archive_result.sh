#!/bin/bash
# Archive the current handoff state for debugging.
# Copies last_code_result.txt and last_chatgpt_reply.txt to archive/ with timestamp.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ARCHIVE="$DIR/archive"
TS="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$ARCHIVE"

[ -f "$DIR/last_code_result.txt" ] && cp "$DIR/last_code_result.txt" "$ARCHIVE/code_result_$TS.txt"
[ -f "$DIR/last_chatgpt_reply.txt" ] && cp "$DIR/last_chatgpt_reply.txt" "$ARCHIVE/chatgpt_reply_$TS.txt"

echo "Archived to $ARCHIVE/ with timestamp $TS"
