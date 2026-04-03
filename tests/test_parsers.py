from __future__ import annotations

import json

from parsers.automation import (
    list_batches,
    read_audit_state,
    read_batch,
    read_work_status,
    update_work_status_file,
)
from parsers.handoff import parse_handoff_file
from parsers.prompt_jobs import claim_prompt_job, create_prompt_job, read_prompt_jobs
from parsers.suggestions import find_suggestion_by_id, parse_markdown_tables, parse_suggestions_file


def test_parse_markdown_tables_reads_multiple_sections():
    text = """# AUTOMATION SUGGESTIONS

## Pending Suggestions
### Product Direction
| # | Suggestion | Source | Safety | Effort | Status |
|---|------------|--------|--------|--------|--------|
| P1 | Graph detail panel: names | Chat audit | safe | medium | pending |

### Code Can Build
| # | Suggestion | Source | Safety | Effort | Status |
|---|------------|--------|--------|--------|--------|
| C1 | Home screen card | Chat audit | safe | medium | pending |
"""
    tables = parse_markdown_tables(text)

    assert len(tables) == 2
    assert tables[0]["subsection"] == "Product Direction"
    assert tables[1]["rows"][0]["title"] == "Home screen card"


def test_parse_suggestions_file_normalizes_multi_section_markdown(tmp_path):
    path = tmp_path / "AUTOMATION_SUGGESTIONS.md"
    path.write_text(
        """# AUTOMATION SUGGESTIONS
## Already Shipped This Session
Q1 OT rename, C2 Search improvements.

## Pending Suggestions
### Product Direction
| # | Suggestion | Source | Safety | Effort | Status |
|---|------------|--------|--------|--------|--------|
| P1 | Graph detail panel: show names | Chat audit | safe | medium | pending |

### Code Can Build
| # | Suggestion | Source | Safety | Effort | Status |
|---|------------|--------|--------|--------|--------|
| C1 | Home screen card | Aaron | safe | medium | pending |
""",
        encoding="utf-8",
    )

    parsed = parse_suggestions_file(str(path))

    assert parsed["already_shipped"] == ["Q1 OT rename", "C2 Search improvements"]
    assert parsed["count"] == 2
    assert parsed["sections"][0]["items"][0]["category"] == "Product Direction"
    assert parsed["sections"][0]["items"][0]["area"] == "graph-detail-panel"
    assert find_suggestion_by_id(str(path), "C1")["title"] == "Home screen card"


def test_parse_suggestions_file_handles_missing_file(tmp_path):
    parsed = parse_suggestions_file(str(tmp_path / "missing.md"))

    assert parsed["suggestions"] == []
    assert parsed["already_shipped"] == []


def test_parse_handoff_file_extracts_structured_fields(tmp_path):
    path = tmp_path / "HANDOFF_LATEST.md"
    path.write_text(
        """# LATEST HANDOFF
Date: 2026-04-02

## Current State
Done for now.

## Today's Commits
1. `abc1234` — Added parser lane

## All Suggestion Items — Final Status
| Item | Status |
|------|--------|
| C1 Graph detail panel | Done |

## Smoke Tests
12/12 passing

## Remaining — Aaron Only
- Guard OT content
""",
        encoding="utf-8",
    )

    parsed = parse_handoff_file(str(path))

    assert parsed["date"] == "2026-04-02"
    assert parsed["current_state"] == "Done for now."
    assert parsed["commits"][0]["commit"] == "abc1234"
    assert parsed["suggestion_status"][0]["item"] == "C1 Graph detail panel"
    assert parsed["smoke_tests"] == "12/12 passing"
    assert parsed["remaining"] == ["Guard OT content"]


def test_read_audit_state_returns_dict_and_missing_is_empty(tmp_path):
    path = tmp_path / "AUDIT_STATE.json"
    path.write_text(json.dumps({"phase": "audit", "loop": 2}), encoding="utf-8")

    assert read_audit_state(str(path))["phase"] == "audit"
    assert read_audit_state(str(tmp_path / "missing.json")) == {}


def test_list_batches_and_read_batch_extract_loop_numbers(tmp_path):
    batches_dir = tmp_path / "batches"
    batches_dir.mkdir()
    (batches_dir / "approved_batch_loop_007.json").write_text(json.dumps({"issues": [{"id": "A1"}]}), encoding="utf-8")

    items = list_batches(str(batches_dir))
    batch = read_batch(7, str(batches_dir))

    assert items == [
        {
            "loop": "7",
            "filename": "approved_batch_loop_007.json",
            "path": str(batches_dir / "approved_batch_loop_007.json"),
        }
    ]
    assert batch["loop"] == "7"
    assert batch["issues"][0]["id"] == "A1"


def test_read_work_status_returns_safe_default_for_missing_file(tmp_path):
    status = read_work_status(str(tmp_path / "WORK_STATUS.json"))

    assert status["agents"]["codex"]["status"] == "idle"
    assert status["agents"]["claude_chat"]["status"] == "idle"
    assert status["agents"]["chatgpt"]["status"] == "idle"
    assert status["updated_at"] is None


def test_update_work_status_creates_file_and_stores_commit_as_last_commit(tmp_path):
    path = tmp_path / "WORK_STATUS.json"

    updated = update_work_status_file(
        "codex",
        "grapplingmap MCP server",
        "in_progress",
        "codex/mcp-server",
        "building shared work status",
        "01b034a",
        path=str(path),
    )

    assert path.exists()
    assert updated["agents"]["codex"]["commit"] == "01b034a"
    assert updated["agents"]["codex"]["last_commit"] == "01b034a"
    assert updated["agents"]["codex"]["updated_at"] == updated["updated_at"]


def test_update_work_status_preserves_other_agents_and_changes_updated_at(tmp_path):
    path = tmp_path / "WORK_STATUS.json"
    path.write_text(
        json.dumps(
            {
                "agents": {
                    "claude_code": {
                        "task": "existing",
                        "status": "done",
                        "branch": "main",
                        "last_commit": "abc",
                        "summary": "kept",
                        "updated_at": "2026-04-03T00:00:00Z",
                    }
                },
                "updated_at": "2026-04-03T00:00:00Z",
            }
        ),
        encoding="utf-8",
    )

    updated = update_work_status_file(
        "codex",
        "grapplingmap MCP server",
        "in_progress",
        "codex/mcp-parser-lane",
        "building parsers and tests",
        "01b034a",
        path=str(path),
    )

    assert updated["agents"]["claude_code"]["task"] == "existing"
    assert updated["agents"]["codex"]["last_commit"] == "01b034a"
    assert updated["agents"]["codex"]["status"] == "in_progress"
    assert updated["agents"]["claude_chat"]["status"] == "idle"
    assert updated["updated_at"].endswith("Z")
    assert updated["updated_at"] != "2026-04-03T00:00:00Z"


def test_read_prompt_jobs_returns_safe_default_for_missing_file(tmp_path):
    payload = read_prompt_jobs(str(tmp_path / "PROMPT_JOBS.json"))

    assert payload["items"] == []
    assert payload["updated_at"] is None


def test_prompt_job_create_and_claim_round_trip(tmp_path):
    path = tmp_path / "PROMPT_JOBS.json"

    created = create_prompt_job(
        "claude_code",
        "Review the latest remote-control UI copy and report gaps.",
        "codex",
        "high",
        path=str(path),
    )
    claimed = claim_prompt_job(created["id"], "claude-code", path=str(path))
    payload = read_prompt_jobs(str(path))

    assert path.exists()
    assert created["id"].startswith("PJ-")
    assert created["status"] == "pending"
    assert claimed["status"] == "claimed"
    assert claimed["claimed_by"] == "claude-code"
    assert payload["items"][0]["priority"] == "high"
