from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from config import PROMPT_JOBS_FILE, SCHEMA_VERSION


DEFAULT_PRIORITY = "normal"
JOB_STATUSES = {"pending", "claimed", "completed", "failed", "cancelled"}


def read_prompt_jobs(path: str = PROMPT_JOBS_FILE) -> dict[str, Any]:
    payload = _read_json_file(path)
    default = {"schema_version": SCHEMA_VERSION, "items": [], "updated_at": None, "path": path}
    if not payload:
        return default

    items = payload.get("items")
    if not isinstance(items, list):
        return default

    normalized = []
    for item in items:
        if isinstance(item, dict):
            normalized.append(_normalize_prompt_job(item))

    normalized.sort(key=lambda item: item.get("created_at") or "", reverse=True)
    return {
        "schema_version": payload.get("schema_version", SCHEMA_VERSION),
        "items": normalized,
        "updated_at": payload.get("updated_at"),
        "path": path,
    }


def list_prompt_jobs(
    *,
    path: str = PROMPT_JOBS_FILE,
    status: str | None = None,
    target_agent: str | None = None,
    limit: int | None = None,
) -> list[dict[str, Any]]:
    items = read_prompt_jobs(path)["items"]
    if status:
        items = [item for item in items if item.get("status") == status]
    if target_agent:
        items = [item for item in items if item.get("target_agent") == target_agent]
    if limit is not None:
        items = items[: max(limit, 0)]
    return items


def get_prompt_job(job_id: str, path: str = PROMPT_JOBS_FILE) -> dict[str, Any]:
    for item in read_prompt_jobs(path)["items"]:
        if item.get("id") == job_id:
            return item
    return {}


def create_prompt_job(
    target_agent: str,
    prompt: str,
    source_client: str,
    priority: str = DEFAULT_PRIORITY,
    *,
    path: str = PROMPT_JOBS_FILE,
) -> dict[str, Any]:
    payload = read_prompt_jobs(path)
    now = _now_iso()
    job = _normalize_prompt_job(
        {
            "id": _next_job_id(payload["items"]),
            "target_agent": target_agent,
            "prompt": prompt,
            "status": "pending",
            "source_client": source_client,
            "priority": priority or DEFAULT_PRIORITY,
            "claimed_by": None,
            "claimed_at": None,
            "result_summary": None,
            "result_artifact": None,
            "error": None,
            "created_at": now,
            "completed_at": None,
            "updated_at": now,
        }
    )
    payload["items"].insert(0, job)
    payload["updated_at"] = now
    _write_payload(path, payload)
    return job


def claim_prompt_job(job_id: str, claimed_by: str, *, path: str = PROMPT_JOBS_FILE) -> dict[str, Any]:
    return _mutate_prompt_job(
        job_id,
        path=path,
        mutate=lambda item, now: item.update(
            {
                "status": "claimed",
                "claimed_by": claimed_by,
                "claimed_at": item.get("claimed_at") or now,
                "updated_at": now,
                "error": None,
            }
        ),
    )


def complete_prompt_job(
    job_id: str,
    claimed_by: str,
    result_summary: str,
    result_artifact: str | None = None,
    *,
    path: str = PROMPT_JOBS_FILE,
) -> dict[str, Any]:
    return _mutate_prompt_job(
        job_id,
        path=path,
        mutate=lambda item, now: item.update(
            {
                "status": "completed",
                "claimed_by": claimed_by or item.get("claimed_by"),
                "claimed_at": item.get("claimed_at") or now,
                "result_summary": result_summary,
                "result_artifact": result_artifact,
                "error": None,
                "completed_at": now,
                "updated_at": now,
            }
        ),
    )


def fail_prompt_job(
    job_id: str,
    claimed_by: str,
    error: str,
    result_summary: str | None = None,
    *,
    path: str = PROMPT_JOBS_FILE,
) -> dict[str, Any]:
    return _mutate_prompt_job(
        job_id,
        path=path,
        mutate=lambda item, now: item.update(
            {
                "status": "failed",
                "claimed_by": claimed_by or item.get("claimed_by"),
                "claimed_at": item.get("claimed_at") or now,
                "result_summary": result_summary,
                "error": error,
                "completed_at": now,
                "updated_at": now,
            }
        ),
    )


def cancel_prompt_job(job_id: str, *, path: str = PROMPT_JOBS_FILE) -> dict[str, Any]:
    return _mutate_prompt_job(
        job_id,
        path=path,
        mutate=lambda item, now: item.update(
            {
                "status": "cancelled",
                "completed_at": now,
                "updated_at": now,
            }
        ),
    )


def _mutate_prompt_job(job_id: str, *, path: str, mutate: Any) -> dict[str, Any]:
    payload = read_prompt_jobs(path)
    now = _now_iso()
    for item in payload["items"]:
        if item.get("id") == job_id:
            mutate(item, now)
            item.update(_normalize_prompt_job(item))
            payload["updated_at"] = now
            _write_payload(path, payload)
            return item
    return {}


def _read_json_file(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (OSError, ValueError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def _write_payload(path: str, payload: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(
            {
                "schema_version": payload.get("schema_version", SCHEMA_VERSION),
                "items": payload.get("items", []),
                "updated_at": payload.get("updated_at"),
            },
            handle,
            indent=2,
        )


def _normalize_prompt_job(item: dict[str, Any]) -> dict[str, Any]:
    status = str(item.get("status") or "pending")
    if status not in JOB_STATUSES:
        status = "pending"
    return {
        "id": item.get("id"),
        "target_agent": item.get("target_agent"),
        "prompt": item.get("prompt") or "",
        "status": status,
        "source_client": item.get("source_client") or "unknown",
        "priority": item.get("priority") or DEFAULT_PRIORITY,
        "claimed_by": item.get("claimed_by"),
        "claimed_at": item.get("claimed_at"),
        "result_summary": item.get("result_summary"),
        "result_artifact": item.get("result_artifact"),
        "error": item.get("error"),
        "created_at": item.get("created_at"),
        "completed_at": item.get("completed_at"),
        "updated_at": item.get("updated_at") or item.get("created_at"),
    }


def _next_job_id(items: list[dict[str, Any]]) -> str:
    date_prefix = datetime.now(timezone.utc).strftime("%Y%m%d")
    max_suffix = 0
    for item in items:
        job_id = str(item.get("id") or "")
        if not job_id.startswith(f"PJ-{date_prefix}-"):
            continue
        try:
            max_suffix = max(max_suffix, int(job_id.rsplit("-", 1)[-1]))
        except ValueError:
            continue
    return f"PJ-{date_prefix}-{max_suffix + 1:03d}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
