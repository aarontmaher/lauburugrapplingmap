#!/usr/bin/env bash
# tools/setup-mac.sh
# One-time setup. Run once after cloning the repo on your Mac.
# Usage (from repo root): bash tools/setup-mac.sh

set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}check${NC} $*"; }
warn() { echo -e "${YELLOW}warn $*${NC}"; }
err()  { echo -e "${RED}fail $*${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo ""
echo "----------------------------------------------------"
echo "  Grappling Map OPML Workflow -- Setup"
echo "----------------------------------------------------"
echo ""

echo "1. Creating export folders..."
mkdir -p ~/GrapplingMap/exports/archive
ok "~/GrapplingMap/exports/  (save Mindomo OPML exports here)"
ok "~/GrapplingMap/exports/archive/  (auto-timestamped backups)"

echo ""
echo "2. Checking Homebrew..."
if ! command -v brew &>/dev/null; then
    warn "Homebrew not found. Install from https://brew.sh then re-run this script."
else
    ok "Homebrew: $(brew --version | head -1)"
    echo ""
    echo "3. Checking fswatch..."
    if ! command -v fswatch &>/dev/null; then
        echo "   Installing fswatch..."
        brew install fswatch
        ok "fswatch installed"
    else
        ok "fswatch already installed"
    fi
fi

echo ""
echo "4. Checking Python 3..."
if ! command -v python3 &>/dev/null; then
    warn "python3 not found. Install from https://python.org or: brew install python3"
else
    ok "python3 $(python3 --version)"
fi

echo ""
echo "5. Checking git repo..."
if [[ ! -d "${REPO_ROOT}/.git" ]]; then
    err "Not a git repository: ${REPO_ROOT}"
    err "Run this script from inside your Chat-gpt repo clone."
else
    ok "Git repo: ${REPO_ROOT}"
    REMOTE_URL=$(git -C "${REPO_ROOT}" remote get-url origin 2>/dev/null || echo "none")
    ok "Remote: ${REMOTE_URL}"
    if git -C "${REPO_ROOT}" ls-remote --exit-code origin HEAD &>/dev/null; then
        ok "Remote is reachable"
    else
        warn "Cannot reach remote -- check your git credentials (see README)"
    fi
fi

echo ""
echo "6. Testing OPML converter (dry run)..."
if [[ -f "${REPO_ROOT}/grappling.opml" ]]; then
    if python3 "${SCRIPT_DIR}/opml_to_sections.py" --dry-run; then
        ok "Converter dry-run passed"
    else
        warn "Converter dry-run failed -- check error above"
    fi
else
    warn "grappling.opml not found in repo root -- skipping test"
fi

echo ""
echo "----------------------------------------------------"
echo "  Setup complete!"
echo ""
echo "  Start the watcher:"
echo "    bash tools/watch-and-push.sh"
echo ""
echo "  Save Mindomo exports to:"
echo "    ~/GrapplingMap/exports/"
echo "----------------------------------------------------"
echo ""
