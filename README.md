# Grappling Map — OPML Auto-Update Workflow

Automatically publishes Mindomo OPML exports to GitHub Pages.

**Flow:** Export OPML from Mindomo → save to `~/GrapplingMap/exports/` → watcher fires → updates `grappling.opml` + `index.html` → git push → site updates in ~1 min.

---

## Quick Start

### 1. Clone this repo on your Mac

```bash
git clone https://github.com/aarontmaher/Chat-gpt.git
cd Chat-gpt
```

### 2. One-time setup (run once from the repo root)

```bash
bash tools/setup-mac.sh
```

This creates `~/GrapplingMap/exports/`, installs `fswatch` via Homebrew, and verifies Python 3 and git access.

### 3. Start the watcher

```bash
bash tools/watch-and-push.sh
```

Leave this running in a Terminal window. Press **Ctrl-C** to stop.

### 4. Export OPML from Mindomo

1. Open your grappling map in Mindomo
2. File > Export > OPML
3. Save to **`~/GrapplingMap/exports/`**
4. The watcher detects the file and automatically:
   - Copies it to `grappling.opml` in this repo
   - Updates `const SECTIONS` in `index.html`
   - Commits and pushes to GitHub
   - Site updates at https://www.lauburugrapplingmap.com/ within ~1 minute

> **Chrome tip:** Enable "Ask where to save each file before downloading" in Chrome Settings > Downloads so you can choose the exports folder each time.

---

## File Structure

```
Chat-gpt/
├── grappling.opml          <- canonical OPML (updated by watcher)
├── index.html              <- site (const SECTIONS updated by watcher)
└── tools/
    ├── opml_to_sections.py <- converts OPML -> updates const SECTIONS
    ├── watch-and-push.sh   <- watcher (fswatch + git push)
    ├── setup-mac.sh        <- one-time Mac setup
    └── README.md           <- (in repo root)

~/GrapplingMap/
└── exports/
    ├── *.opml              <- save Mindomo exports here
    └── archive/
        └── grappling_YYYYMMDD_HHMMSS.opml  <- timestamped backups
```

---

## Auto-launch on Login (optional)

```bash
REPO_PATH="$HOME/path/to/Chat-gpt"   # <-- edit this

cat > ~/Library/LaunchAgents/com.grapplingmap.watcher.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.grapplingmap.watcher</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>${REPO_PATH}/tools/watch-and-push.sh</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${HOME}/GrapplingMap/watcher.log</string>
  <key>StandardErrorPath</key><string>${HOME}/GrapplingMap/watcher.log</string>
</dict></plist>
EOF

launchctl load ~/Library/LaunchAgents/com.grapplingmap.watcher.plist
```

To stop: `launchctl unload ~/Library/LaunchAgents/com.grapplingmap.watcher.plist`

---

## Troubleshooting

**fswatch not found**
```bash
brew install fswatch
```

**git push fails / authentication error**

Option A — Personal Access Token:
1. GitHub > Settings > Developer settings > Personal access tokens > New token (classic)
2. Select `repo` scope, generate and copy the token
3. `git remote set-url origin https://YOUR_TOKEN@github.com/aarontmaher/Chat-gpt.git`

Option B — SSH key:
```bash
ssh-keygen -t ed25519 -C "your@email.com"   # if no key exists
# Add ~/.ssh/id_ed25519.pub to GitHub > Settings > SSH keys
git remote set-url origin git@github.com:aarontmaher/Chat-gpt.git
```

**"No changes detected" (commit skipped)**
The exported OPML was identical to what is already in the repo. This is expected if you export without making changes in Mindomo.

**Conversion failed**
```bash
python3 tools/opml_to_sections.py   # run manually to see the error
```

**Site looks wrong after push**
Check the Pages deploy status: https://github.com/aarontmaher/Chat-gpt/actions
Then open DevTools Console at https://www.lauburugrapplingmap.com/ and look for JS errors.
