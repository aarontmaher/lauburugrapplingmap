# Keyboard Maestro Setup — Code ↔ ChatGPT App Bridge

## Overview
Three KM macros form the automation loop.
All ChatGPT interaction goes through the **ChatGPT macOS app** (not browser).

1. **DETECT-CODE-DONE** — watches for done.signal, triggers the cycle
2. **SEND-CHECK-TERMINAL-APP** — sends "check terminal" to ChatGPT app, waits for response
3. **PASTE-TO-CODE** — auto-captures the reply, then pastes it into Claude Code

## Flow
```
Claude Code finishes task
  → write_code_result.sh creates done.signal
  → KM Macro 1 detects done.signal (polls every 5s)
  → KM Macro 2 sends "check terminal" to ChatGPT app
  → KM pauses 60–90s for ChatGPT to respond
  → KM Macro 3 auto-captures reply from accessibility tree + pastes into Terminal
  → Claude Code receives next prompt
```

## Macro 1: DETECT-CODE-DONE
**Trigger:** Periodic (every 5 seconds)
**Conditions:** File exists: `~/Chat-gpt/.handoff/done.signal`

**Actions:**
1. Execute shell: `bash ~/Chat-gpt/.handoff/set_lock.sh`
   - If exit code != 0, abort (another cycle running)
2. Execute shell: `bash ~/Chat-gpt/.handoff/archive_result.sh`
3. Execute shell: `bash ~/Chat-gpt/.handoff/clear_done.sh`
4. Trigger macro: SEND-CHECK-TERMINAL-APP

## Macro 2: SEND-CHECK-TERMINAL-APP
**Trigger:** Called by DETECT-CODE-DONE only

**Actions:**
1. Execute shell: `bash ~/Chat-gpt/.handoff/send_check_terminal.sh`
2. Pause 60–90 seconds (let ChatGPT generate its response)
3. Trigger macro: PASTE-TO-CODE

## Macro 3: PASTE-TO-CODE
**Trigger:** Called by SEND-CHECK-TERMINAL-APP after wait

This macro does TWO things: capture the reply, then paste it.

**Actions:**
1. Execute shell (auto-capture + paste + cleanup — single command):
```
bash ~/Chat-gpt/.handoff/capture_chatgpt_reply.sh --auto && bash ~/Chat-gpt/.handoff/paste_to_code.sh --submit && bash ~/Chat-gpt/.handoff/clear_lock.sh
```

**What this does:**
- `capture_chatgpt_reply.sh --auto` reads the latest assistant reply from the ChatGPT app's accessibility tree (no Cmd+A, no clipboard, no text selection)
- Writes it to `last_chatgpt_reply.txt`
- `paste_to_code.sh --submit` copies that file to clipboard → activates Terminal → Cmd+V pastes → presses Return
- `clear_lock.sh` releases the lock so the next cycle can fire

**Fallback (if auto-capture fails):**
- User selects the latest ChatGPT reply manually → Cmd+C
- Then run: `bash ~/Chat-gpt/.handoff/paste_to_code.sh --clipboard --submit && bash ~/Chat-gpt/.handoff/clear_lock.sh`

## Expected ChatGPT Reply Format

ChatGPT replies should use **plain text** for the next Code prompt — NOT markdown
fenced code blocks. The accessibility tree capture grabs visible text but may
miss or mangle content inside code fences.

**Safe format:**
```
[short result summary]

START CODE PROMPT
PROMPT-ID: EXAMPLE-01
TYPE: CODE
SCOPE: ...
...
-chatgpt chat
END CODE PROMPT
```

**Rules:**
- No markdown code fences around the prompt content
- The prompt appears as plain text at the end of the reply
- `START CODE PROMPT` / `END CODE PROMPT` markers delimit the prompt
- The capture script grabs the full assistant reply including the prompt
- Claude Code receives the entire reply; the PROMPT-ID line triggers work

## Loop Prevention
- Auto mode reads from accessibility tree — never selects text, so no loop risk
- Clipboard mode rejects content containing "PROMPT-ID:" (user prompts)
- NEVER use Cmd+A in ChatGPT — it copies the entire conversation and causes self-loops
- Emergency stop: `rm -f ~/Chat-gpt/.handoff/done.signal ~/Chat-gpt/.handoff/run.lock`

## Script Reference

| Script | Purpose | Status |
|--------|---------|--------|
| `write_code_result.sh` | Extract DONE block, write to file, trigger done.signal | Active |
| `mark_done.sh` | Write result + create done.signal (called by write_code_result.sh) | Active |
| `send_check_terminal.sh` | Activate ChatGPT app, type "check terminal", press Return | Active |
| `capture_chatgpt_reply.sh` | `--auto`: read reply from accessibility tree. Default: read clipboard | Active |
| `paste_to_code.sh` | Read file or `--clipboard`, activate Terminal, paste, optionally `--submit` | Active |
| `bridge_cycle.sh` | Full cycle script for manual/testing use (runs all steps sequentially) | Active |
| `set_lock.sh` | Acquire run.lock (prevents concurrent cycles) | Active |
| `clear_lock.sh` | Release run.lock | Active |
| `clear_done.sh` | Remove done.signal after consumption | Active |
| `archive_result.sh` | Archive current handoff state to archive/ subfolder | Active |

## Prerequisites
- ChatGPT macOS app installed and logged in
- Dedicated conversation open in ChatGPT app for the bridge
- Terminal accessibility permissions granted (System Settings → Privacy → Accessibility)
- Keyboard Maestro installed with 3 macros configured per above

## Quick Test
1. `bash ~/Chat-gpt/.handoff/write_code_result.sh "TEST | DONE | test"`
2. Watch for KM Macro 1 to fire
3. Verify "check terminal" appears in ChatGPT app
4. After ChatGPT responds, verify reply gets pasted into Terminal
5. Clean up: `rm -f ~/Chat-gpt/.handoff/done.signal ~/Chat-gpt/.handoff/run.lock`
