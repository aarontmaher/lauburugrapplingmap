from __future__ import annotations

import json
import sqlite3

from parsers import whoop_proxy


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise whoop_proxy.requests.HTTPError("bad response")


def test_get_normalized_daily_returns_expected_schema(monkeypatch, tmp_path):
    tokens_path = tmp_path / "whoop_tokens.json"
    tokens_path.write_text(json.dumps({"access_token": "token"}), encoding="utf-8")

    def fake_get(url, headers=None, params=None, timeout=15):
        if url.endswith("/recovery"):
            return FakeResponse({"records": [{"date": "2026-04-02", "score": {"recovery_score": 36.0, "hrv_ms": 53.0, "rhr_bpm": 56, "spo2_pct": 94.8, "skin_temp_c": 33.8}}]})
        if url.endswith("/cycle"):
            return FakeResponse({"records": [{"date": "2026-04-02", "score": {"strain": 8.0, "kilojoules": 1200, "avg_hr": 85, "max_hr": 153}}]})
        if url.endswith("/activity/sleep"):
            return FakeResponse({"records": [{"date": "2026-04-02", "score": {"sleep_performance_percentage": 71.0, "sleep_efficiency_percentage": 92.6, "total_sleep_time_milli": 20556000, "slow_wave_sleep_time_milli": 7776000, "rem_sleep_time_milli": 4572000, "sleep_needed_milli": 27432000, "sleep_debt_milli": 6948000, "respiratory_rate": 14.2}}]})
        if url.endswith("/activity/workout"):
            return FakeResponse({"records": [{"date": "2026-04-02", "sport_id": 63, "duration_milli": 1620000, "score": {"strain": 6.27, "avg_hr": 120, "max_hr": 143}}]})
        raise AssertionError(f"unexpected URL {url}")

    monkeypatch.setattr(whoop_proxy.requests, "get", fake_get)

    result = whoop_proxy.get_normalized_daily(
        "2026-04-02",
        tokens_path=str(tokens_path),
        sqlite_path=str(tmp_path / "missing.sqlite3"),
    )

    assert result["date"] == "2026-04-02"
    assert result["recovery"]["score"] == 36.0
    assert result["strain"]["day_strain"] == 8.0
    assert result["sleep"]["total_hours"] == 5.71
    assert result["workouts"][0]["duration_min"] == 27


def test_get_normalized_daily_handles_missing_tokens_gracefully(tmp_path):
    result = whoop_proxy.get_normalized_daily(
        "2026-04-02",
        tokens_path=str(tmp_path / "missing.json"),
        sqlite_path=str(tmp_path / "missing.sqlite3"),
    )

    assert result["error"] == "WHOOP auth failed"
    assert result["auth"]["state"] == "expired"


def test_get_normalized_daily_prefers_sqlite_and_returns_freshness(tmp_path):
    db_path = tmp_path / "whoop.sqlite3"
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE daily_summaries (
          local_date TEXT PRIMARY KEY,
          recovery_score REAL,
          hrv_ms REAL,
          rhr_bpm REAL,
          spo2_pct REAL,
          skin_temp_celsius REAL,
          sleep_performance_pct REAL,
          sleep_consistency_pct REAL,
          sleep_efficiency_pct REAL,
          total_sleep_hours REAL,
          light_sleep_hours REAL,
          awake_hours REAL,
          in_bed_hours REAL,
          sws_hours REAL,
          rem_hours REAL,
          sleep_needed_baseline_hours REAL,
          sleep_debt_hours REAL,
          respiratory_rate REAL,
          day_strain REAL,
          day_kilojoules REAL,
          day_avg_hr REAL,
          day_max_hr REAL,
          workouts_json TEXT,
          workout_zone_json TEXT,
          grappling_sessions_json TEXT,
          manual_context_json TEXT,
          provenance_json TEXT
        )
        """
    )
    conn.execute(
        "CREATE TABLE sync_runs (id INTEGER PRIMARY KEY, source TEXT, mode TEXT, status TEXT, started_at TEXT, finished_at TEXT, error TEXT)"
    )
    conn.execute("CREATE TABLE sync_state (key TEXT PRIMARY KEY, value_text TEXT)")
    conn.execute(
        """
        INSERT INTO daily_summaries(
          local_date, recovery_score, hrv_ms, rhr_bpm, spo2_pct, skin_temp_celsius,
          sleep_performance_pct, sleep_consistency_pct, sleep_efficiency_pct,
          total_sleep_hours, light_sleep_hours, awake_hours, in_bed_hours, sws_hours, rem_hours,
          sleep_needed_baseline_hours, sleep_debt_hours, respiratory_rate,
          day_strain, day_kilojoules, day_avg_hr, day_max_hr,
          workouts_json, workout_zone_json, grappling_sessions_json, manual_context_json, provenance_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "2026-04-02",
            36.0,
            53.0,
            56.0,
            94.8,
            33.8,
            71.0,
            83.0,
            92.6,
            5.71,
            2.28,
            0.46,
            6.17,
            2.16,
            1.27,
            7.62,
            1.93,
            14.2,
            8.0,
            1200.0,
            85.0,
            153.0,
            json.dumps([{"sport_id": 63, "strain": 6.27, "duration_min": 27}]),
            json.dumps({"pct": {"zone_3": 0.12}}),
            json.dumps([{"session_type": "bjj"}]),
            json.dumps([{"fatigue_score": 6}]),
            json.dumps({"sleep_sources": ["json_cache"]}),
        ),
    )
    conn.execute(
        "INSERT INTO sync_runs(id, source, mode, status, started_at, finished_at, error) VALUES (1, 'whoop_api', 'incremental', 'success', '2026-04-02T10:00:00Z', '2026-04-02T10:05:00Z', NULL)"
    )
    conn.execute("INSERT INTO sync_state(key, value_text) VALUES ('auth_reauth_required', 'true')")
    conn.execute("INSERT INTO sync_state(key, value_text) VALUES ('auth_last_refresh_failure_reason', 'expired_refresh_token')")
    conn.commit()
    conn.close()

    result = whoop_proxy.get_normalized_daily("2026-04-02", sqlite_path=str(db_path))

    assert result["source"] == "whoop_sqlite"
    assert result["date"] == "2026-04-02"
    assert result["recovery"]["score"] == 36.0
    assert result["sleep"]["consistency_pct"] == 83.0
    assert result["workout_zones"]["pct"]["zone_3"] == 0.12
    assert result["grappling_sessions"][0]["session_type"] == "bjj"
    assert result["manual_context"][0]["fatigue_score"] == 6
    assert result["auth"]["state"] == "expired"
    assert result["operator_action_needed"] is True


def test_get_normalized_daily_falls_back_to_latest_stored_day(tmp_path):
    db_path = tmp_path / "whoop.sqlite3"
    conn = sqlite3.connect(db_path)
    conn.execute("CREATE TABLE daily_summaries (local_date TEXT PRIMARY KEY, recovery_score REAL, hrv_ms REAL, rhr_bpm REAL, spo2_pct REAL, skin_temp_celsius REAL, sleep_performance_pct REAL, sleep_consistency_pct REAL, sleep_efficiency_pct REAL, total_sleep_hours REAL, light_sleep_hours REAL, awake_hours REAL, in_bed_hours REAL, sws_hours REAL, rem_hours REAL, sleep_needed_baseline_hours REAL, sleep_debt_hours REAL, respiratory_rate REAL, day_strain REAL, day_kilojoules REAL, day_avg_hr REAL, day_max_hr REAL, workouts_json TEXT, workout_zone_json TEXT, grappling_sessions_json TEXT, manual_context_json TEXT, provenance_json TEXT)")
    conn.execute("CREATE TABLE sync_runs (id INTEGER PRIMARY KEY, source TEXT, mode TEXT, status TEXT, started_at TEXT, finished_at TEXT, error TEXT)")
    conn.execute("CREATE TABLE sync_state (key TEXT PRIMARY KEY, value_text TEXT)")
    conn.execute(
        "INSERT INTO daily_summaries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ("2026-04-02", 36.0, 53.0, 56.0, 94.8, 33.8, 71.0, 83.0, 92.6, 5.71, 2.28, 0.46, 6.17, 2.16, 1.27, 7.62, 1.93, 14.2, 8.0, 1200.0, 85.0, 153.0, "[]", "{}", "[]", "[]", "{}"),
    )
    conn.commit()
    conn.close()

    result = whoop_proxy.get_normalized_daily("2026-04-05", sqlite_path=str(db_path))

    assert result["date"] == "2026-04-02"
    assert result["fallback_used"] is True
    assert result["freshness"]["exact_date_available"] is False


def test_normalize_date_handles_iso_strings():
    assert whoop_proxy.normalize_date("2026-04-02") == "2026-04-02"
    assert whoop_proxy.normalize_date("2026-04-02T12:30:00Z") == "2026-04-02"
