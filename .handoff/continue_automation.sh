#!/bin/bash
# continue_automation.sh — Non-stopping batch handoff for old KM bridge.
#
# Usage:
#   continue_automation.sh "RESULT LINE" < next_prompt.txt
#   continue_automation.sh "RESULT LINE" --prompt "prompt text here"
#   continue_automation.sh "RESULT LINE" --prompt-file /path/to/prompt.txt
#
# Order (hard rule):
#   1. Write continuation prompt to last_chatgpt_reply.txt
#   2. Only after prompt is confirmed written, signal done via mark_done.sh
#   3. If prompt write fails, do NOT signal done
#
# Handles stale run.lock: waits 10s, then force-clears if stale (>60s old).

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
REPLY="$DIR/last_chatgpt_reply.txt"
LOCK="$DIR/run.lock"
RESULT_LINE="${1:-}"

if [ -z "$RESULT_LINE" ]; then
  echo "FAIL: No result line provided."
  echo "Usage: continue_automation.sh \"RESULT LINE\" --prompt \"text\""
  exit 1
fi

# Step 1: Get the continuation prompt
PROMPT_TEXT=""
shift
while [ $# -gt 0 ]; do
  case "$1" in
    --prompt)
      shift
      PROMPT_TEXT="$1"
      ;;
    --prompt-file)
      shift
      PROMPT_TEXT=$(cat "$1")
      ;;
    *)
      ;;
  esac
  shift
done

# Fallback: read from stdin if no --prompt/--prompt-file
if [ -z "$PROMPT_TEXT" ]; then
  if [ ! -t 0 ]; then
    PROMPT_TEXT=$(cat)
  fi
fi

if [ -z "$PROMPT_TEXT" ]; then
  echo "FAIL: No continuation prompt provided."
  echo "For a true stopping point, use mark_done.sh directly instead."
  exit 1
fi

# Step 2: Handle stale lock
if [ -f "$LOCK" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -f%m "$LOCK") ))
  if [ "$LOCK_AGE" -gt 60 ]; then
    echo "WARN: Stale lock (${LOCK_AGE}s old) — force-clearing."
    rm -f "$LOCK"
  else
    echo "Lock exists (${LOCK_AGE}s old). Waiting up to 30s..."
    for i in $(seq 1 30); do
      sleep 1
      [ ! -f "$LOCK" ] && break
    done
    if [ -f "$LOCK" ]; then
      echo "WARN: Lock still held after 30s — force-clearing."
      rm -f "$LOCK"
    fi
  fi
fi

# Step 3: Write the continuation prompt FIRST
echo "$PROMPT_TEXT" > "$REPLY"
WRITTEN=$(wc -c < "$REPLY" | tr -d ' ')

if [ "$WRITTEN" -lt 10 ]; then
  echo "FAIL: Prompt write looks too short ($WRITTEN bytes). Not signaling done."
  exit 1
fi

echo "OK: Continuation prompt written ($WRITTEN bytes)."

# Step 4: Only NOW signal done
bash "$DIR/mark_done.sh" "$RESULT_LINE"
echo "OK: Handoff complete. KM should continue."
