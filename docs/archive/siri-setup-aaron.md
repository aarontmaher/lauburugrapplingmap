# Aaron's iPhone Siri Setup — 3 Manual Steps

## What Code already built (done):
- ~/Chat-gpt/tools/siri/get-status.sh
- ~/Chat-gpt/tools/siri/get-next.sh
- ~/Chat-gpt/tools/siri/trigger-pipeline.sh
- ~/Chat-gpt/tools/siri/zapier-receiver.py
- results.md feed (auto-updates after each pipeline run)

## What YOU do (3 steps):

### STEP 1: Test "GrapplingMap Status" (no Zapier needed — do this now)

On iPhone → Shortcuts app → New Shortcut → name "GrapplingMap Status"

Add: **Get Contents of URL**
  URL: `https://raw.githubusercontent.com/aarontmaher/Chat-gpt/main/results.md`

Add: **Get Text from Input**

Add: **Speak Text** → use result

Test: "Hey Siri GrapplingMap Status" → should read last task aloud

### STEP 2: Test "What's Next GrapplingMap" (no Zapier needed)

On iPhone → Shortcuts app → New Shortcut → name "What's Next GrapplingMap"

Add: **Get Contents of URL**
  URL: `https://raw.githubusercontent.com/aarontmaher/Chat-gpt/main/CLAUDE.md`

Add: **Get Text from Input**

Add: **Match Text** → Pattern: `## PENDING TASKS([\s\S]*?)---`

Add: **Get Group from Matched Text** → Group 1

Add: **Speak Text** (first 500 chars)

Test: "Hey Siri What's Next GrapplingMap"

### STEP 3: "Send GrapplingMap Prompt" (needs Zapier)

A) Create free Zapier account at zapier.com

B) New Zap → Trigger: **Webhooks by Zapier** (Catch Hook) → copy webhook URL

C) Action: choose what happens (e.g. send email to Code, or webhook to Mac)

D) In Shortcuts app → New Shortcut → name "Send GrapplingMap Prompt"
   - Add: **Text** → paste your Zapier webhook URL here
   - Add: **Set Variable** → WebhookURL
   - Add: **Get Clipboard**
   - Add: **Get Contents of URL** → URL=WebhookURL, Method=POST, Body=JSON, key=prompt, value=Clipboard
   - Add: **Speak Text** → "Prompt sent"

E) Paste webhook URL: update after creating Zap

## For now — Steps 1 + 2 work immediately. Step 3 when you want voice-to-Code.
