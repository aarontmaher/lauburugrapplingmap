#!/bin/bash
# tools/write-result.sh
# Usage: bash tools/write-result.sh "PROMPT-ID" "plain summary" "commit" [edges] [no_dest] [in_network] [built_out]
# Writes CODE line to results.md LATEST-RESULT block.
# Preserves existing COWORK line if present.

set -euo pipefail

PROMPT_ID="${1:-unknown}"
SUMMARY="${2:-no summary}"
COMMIT="${3:-unknown}"
EDGES="${4:-null}"
NO_DEST="${5:-null}"
IN_NETWORK="${6:-null}"
BUILT_OUT="${7:-null}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="${SCRIPT_DIR}/../results.md"

if [[ ! -f "$RESULTS_FILE" ]]; then
    echo "ERROR: results.md not found at $RESULTS_FILE"
    exit 1
fi

# Build CODE line
CODE_LINE="CODE: ${PROMPT_ID} | ${SUMMARY} | Edges: ${EDGES} | Commit: ${COMMIT} | Errors: none"

# Build STATUS line
STATUS_LINE="STATUS: edges=${EDGES} NO_DEST=${NO_DEST} built-out=${BUILT_OUT} console=clean"

# Extract existing COWORK line (preserve it)
COWORK_LINE=$(sed -n '/<!-- LATEST-RESULT-START -->/,/<!-- LATEST-RESULT-END -->/p' "$RESULTS_FILE" | grep '^COWORK:' || echo "")

# Extract history (everything after LATEST-RESULT-END)
HISTORY=$(sed -n '/<!-- LATEST-RESULT-END -->/,$ p' "$RESULTS_FILE" | tail -n +2)

# Write updated results.md
cat > "$RESULTS_FILE" << ENDFILE
# GrapplingMap — Results Feed
# Code writes here after every completed task.
# Aaron: copy the LATEST-RESULT block and paste to Claude Chat.

<!-- LATEST-RESULT-START -->
${CODE_LINE}
${COWORK_LINE:+${COWORK_LINE}
}${STATUS_LINE}
<!-- LATEST-RESULT-END -->

${HISTORY}
ENDFILE

echo "Result written: ${PROMPT_ID} (${COMMIT})"
