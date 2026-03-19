#!/bin/bash
# tools/siri/trigger-pipeline.sh
# Called by Siri "Run GrapplingMap Pipeline" shortcut via SSH
# Copies latest OPML and runs pipeline once (not the watcher loop)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Copy latest OPML to canonical
latest_dl=$(ls -t "${HOME}/Downloads"/grappling*.opml 2>/dev/null | head -n 1)
if [[ -n "$latest_dl" ]]; then
    cp "$latest_dl" "${HOME}/GrapplingMap/exports/grappling.opml"
    echo "Copied: $(basename "$latest_dl")"
fi

# Run pipeline
cd "$REPO_ROOT"
python3 tools/opml_to_sections.py "${HOME}/GrapplingMap/exports/grappling.opml"

echo "Pipeline triggered at $(date '+%H:%M:%S')"
