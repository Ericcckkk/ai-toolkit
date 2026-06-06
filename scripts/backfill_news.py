#!/usr/bin/env python3
"""
批量回补每日 AI 资讯。

用法示例：
python scripts/backfill_news.py --dates 2026-05-22,2026-05-25,2026-06-01
python scripts/backfill_news.py --start 2026-05-22 --end 2026-06-01
python scripts/backfill_news.py --dates 2026-05-22,2026-05-25 --dry-run
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path


def parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()


def parse_dates_arg(raw):
    dates = []
    for chunk in raw.split(","):
        value = chunk.strip()
        if not value:
            continue
        dates.append(parse_date(value))
    if not dates:
        raise ValueError("未提供有效日期")
    return dates


def build_date_range(start_raw, end_raw):
    start_date = parse_date(start_raw)
    end_date = parse_date(end_raw)
    if start_date > end_date:
        raise ValueError("start 不能晚于 end")

    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def resolve_dates(args):
    has_list = bool(args.dates)
    has_range = bool(args.start or args.end)

    if has_list and has_range:
        raise ValueError("不能同时使用 --dates 和 --start/--end")
    if not has_list and not (args.start and args.end):
        raise ValueError("需要提供 --dates，或同时提供 --start 和 --end")
    if has_range and not (args.start and args.end):
        raise ValueError("--start 和 --end 必须同时提供")

    raw_dates = parse_dates_arg(args.dates) if has_list else build_date_range(args.start, args.end)
    unique_dates = sorted({d.isoformat() for d in raw_dates})
    return unique_dates


def main():
    parser = argparse.ArgumentParser(description="批量回补每日 AI 资讯")
    parser.add_argument("--dates", help="逗号分隔的日期列表，例如 2026-05-22,2026-05-25")
    parser.add_argument("--start", help="起始日期 YYYY-MM-DD")
    parser.add_argument("--end", help="结束日期 YYYY-MM-DD")
    parser.add_argument("--dry-run", action="store_true", help="只打印将执行的日期，不实际运行")
    args = parser.parse_args()

    try:
        dates = resolve_dates(args)
    except ValueError as exc:
        print(f"[ERROR] {exc}")
        sys.exit(1)

    print(f"[INFO] 计划回补 {len(dates)} 天: {', '.join(dates)}")
    if args.dry_run:
        return

    repo_root = Path(__file__).resolve().parent.parent
    fetch_script = repo_root / "scripts" / "fetch_news.py"
    env = os.environ.copy()

    for index, target_date in enumerate(dates, start=1):
        print(f"[INFO] ({index}/{len(dates)}) 回补 {target_date}")
        env["TARGET_DATE"] = target_date
        subprocess.run(
            [sys.executable, str(fetch_script)],
            cwd=repo_root,
            env=env,
            check=True,
        )

    print("[INFO] 回补完成")


if __name__ == "__main__":
    main()
