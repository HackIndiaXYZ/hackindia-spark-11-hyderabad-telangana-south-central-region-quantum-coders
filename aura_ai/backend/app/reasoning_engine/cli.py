from __future__ import annotations

import json
import sys

from .engine import generate_health_report


def main() -> int:
    payload = json.load(sys.stdin)
    report = generate_health_report(payload)
    json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
