#!/bin/bash
# review-inbox.sh — List new videos in INBOX ready for Code review.
#
# Usage:
#   bash ~/Chat-gpt/tools/review-inbox.sh          # list inbox contents
#   bash ~/Chat-gpt/tools/review-inbox.sh --frames  # extract keyframes for each video
#
# Workflow:
#   1. Drop videos into ~/GrapplingMap/live-footage/INBOX/
#   2. Run this script (or just tell Code "review inbox")
#   3. Code inspects each video, proposes placement
#   4. Aaron approves/corrects
#   5. Code moves video to final folder and logs the result

set -euo pipefail

INBOX="$HOME/GrapplingMap/live-footage/INBOX"
FRAMES_DIR="$INBOX/.frames"
EXTRACT_FRAMES=false

for arg in "$@"; do
  case "$arg" in
    --frames) EXTRACT_FRAMES=true ;;
  esac
done

if [ ! -d "$INBOX" ]; then
  echo "INBOX not found: $INBOX"
  exit 1
fi

# Find video files
VIDEO_EXTS="mp4 mov mkv webm m4v"
VIDEOS=()
for ext in $VIDEO_EXTS; do
  while IFS= read -r -d '' f; do
    VIDEOS+=("$f")
  done < <(find "$INBOX" -maxdepth 1 -iname "*.$ext" -print0 2>/dev/null)
done

if [ ${#VIDEOS[@]} -eq 0 ]; then
  echo "INBOX is empty — no videos to review."
  exit 0
fi

echo "=== INBOX: ${#VIDEOS[@]} video(s) ==="
echo ""

for v in "${VIDEOS[@]}"; do
  fname=$(basename "$v")
  size=$(ls -lh "$v" | awk '{print $5}')
  echo "  $fname ($size)"

  # Extract keyframes if requested and ffmpeg is available
  if [ "$EXTRACT_FRAMES" = true ] && command -v ffmpeg &>/dev/null; then
    mkdir -p "$FRAMES_DIR"
    base="${fname%.*}"
    # Extract 4 frames evenly spaced through the video
    duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v" 2>/dev/null || echo "0")
    if [ "$duration" != "0" ] && [ -n "$duration" ]; then
      for i in 1 2 3 4; do
        ts=$(echo "$duration $i" | awk '{printf "%.1f", ($1 / 5) * $2}')
        outfile="$FRAMES_DIR/${base}_frame${i}.jpg"
        ffmpeg -y -ss "$ts" -i "$v" -frames:v 1 -q:v 3 "$outfile" 2>/dev/null && \
          echo "    frame $i: $outfile" || true
      done
    fi
  fi
done

echo ""
echo "Tell Code: 'review inbox' to get placement proposals."
echo "Or describe each video yourself for faster placement."
