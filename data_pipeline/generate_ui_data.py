"""ETL: StatsBomb match events -> lightweight UI payload for the React canvas.

Source: 2018 World Cup Final (France vs Croatia), StatsBomb Open Data match 8658.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

PIPELINE_DIR = Path(__file__).resolve().parent
RAW_EVENTS_PATH = PIPELINE_DIR / "8658.json"
OUTPUT_PATH = PIPELINE_DIR.parent / "public" / "match_data.json"

PASS_XT = 0.05
SHOT_XT = 0.4
KEEP_TYPES = {"Pass", "Shot"}


def load_events(path: Path) -> list[dict]:
    if not path.is_file():
        raise FileNotFoundError(
            f"Missing StatsBomb events file: {path}. "
            "Download data/events/8658.json from https://github.com/statsbomb/open-data"
        )
    with path.open("r", encoding="utf-8") as handle:
        events = json.load(handle)
    if not isinstance(events, list) or not events:
        raise ValueError(f"Expected a non-empty event list in {path}")
    return events


def events_to_ui_payload(events: list[dict]) -> list[dict]:
    rows: list[dict] = []
    for event in events:
        event_type = (event.get("type") or {}).get("name")
        location = event.get("location")
        if event_type not in KEEP_TYPES:
            continue
        if not isinstance(location, list) or len(location) < 2:
            continue
        x, y = location[0], location[1]
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            continue
        rows.append(
            {
                "minute": event.get("minute", 0),
                "type": event_type,
                "x": x,
                "y": y,
            }
        )

    frame = pd.DataFrame(rows)
    if frame.empty:
        raise ValueError("No Pass/Shot events with coordinates were found")

    xt_map = {"Pass": PASS_XT, "Shot": SHOT_XT}
    frame["xT"] = frame["type"].map(xt_map)
    frame["rolling_xT"] = frame["xT"].cumsum().round(2)
    return frame[["minute", "type", "x", "y", "rolling_xT"]].to_dict(orient="records")


def main() -> None:
    events = load_events(RAW_EVENTS_PATH)
    payload = events_to_ui_payload(events)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle)
    print(f"UI Data generated successfully! {len(payload)} events -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
