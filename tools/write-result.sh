#!/bin/bash
# tools/write-result.sh
# Usage: bash tools/write-result.sh "PROMPT-ID" "summary" "commit" [edges] [no_dest] [in_network] [built_out]
# Called by Code at end of every task.

PROMPT_ID="${1:-unknown}"
SUMMARY="${2:-no summary}"
COMMIT="${3:-unknown}"
EDGES="${4:-null}"
NO_DEST="${5:-null}"
IN_NETWORK="${6:-null}"
BUILT_OUT="${7:-null}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="${SCRIPT_DIR}/../results.md"

# Build JSON result
RESULT=$(cat << ENDJSON
{
  "prompt_id": "$PROMPT_ID",
  "timestamp": "$TIMESTAMP",
  "status": "complete",
  "summary": "$SUMMARY",
  "edges": $EDGES,
  "no_dest": $NO_DEST,
  "in_network": $IN_NETWORK,
  "built_out": $BUILT_OUT,
  "commit": "$COMMIT",
  "console_errors": "none",
  "new_decisions_needed": [],
  "flags": []
}
ENDJSON
)

# Read current results.md
if [[ ! -f "$RESULTS_FILE" ]]; then
    echo "ERROR: results.md not found at $RESULTS_FILE"
    exit 1
fi

CURRENT=$(cat "$RESULTS_FILE")

# Extract old latest result (between markers, excluding marker lines)
OLD_LATEST=$(echo "$CURRENT" | sed -n '/<!-- LATEST-RESULT-START -->/,/<!-- LATEST-RESULT-END -->/p' | grep -v '<!-- LATEST-RESULT-START -->' | grep -v '<!-- LATEST-RESULT-END -->')

# Extract existing history (between markers, excluding marker lines)
HISTORY=$(echo "$CURRENT" | sed -n '/<!-- RESULT-HISTORY -->/,/<!-- RESULT-HISTORY-END -->/p' | grep -v '<!-- RESULT-HISTORY -->' | grep -v '<!-- RESULT-HISTORY-END -->')

# Write updated results.md
cat > "$RESULTS_FILE" << ENDFILE
# GrapplingMap — Results Feed
# Code writes here after every completed task.
# Claude Chat reads this at session start to catch up on what happened.
# Format: most recent first.

<!-- LATEST-RESULT-START -->
$RESULT
<!-- LATEST-RESULT-END -->

<!-- RESULT-HISTORY -->
$OLD_LATEST
$HISTORY
<!-- RESULT-HISTORY-END -->
ENDFILE

echo "Result written: $PROMPT_ID ($TIMESTAMP)"
