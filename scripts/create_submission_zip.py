#!/usr/bin/env python3
"""Build a clean client submission zip — excludes dev/cache/reference folders."""
from __future__ import annotations

import os
import re
import zipfile
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ZIP_NAME = "METtrack-NAAC-Submission.zip"
ZIP_ROOT = "METtrack-NAAC"

# Paths relative to project root — never include in zip
EXCLUDE_DIRS = {
    ".git",
    ".venv",
    "venv",
    ".vscode",
    ".idea",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "naac-accrediation-system-main",
    "dist",
    "frontend/dist",
    "frontend/.vite",
}

EXCLUDE_FILE_PATTERNS = [
    re.compile(r"\.pyc$"),
    re.compile(r"\.pyo$"),
    re.compile(r"\.log$"),
    re.compile(r"Open Notebook", re.I),
    re.compile(r"\.onetoc2$", re.I),
    re.compile(r"^\.env$"),
    re.compile(r"^\.DS_Store$"),
    re.compile(r"^Thumbs\.db$"),
    re.compile(r"^desktop\.ini$"),
]

# Only include these top-level items (+ their contents)
INCLUDE_TOP = {
    "backend",
    "frontend",
    "docs",
    "scripts",
    "README.md",
    ".env.example",
    ".gitignore",
    "setup.bat",
    "start-app.bat",
    "run-project.bat",
    "create-submission-zip.bat",
}

# Under backend — skip local sqlite / empty instance
BACKEND_SKIP_DIRS = {"instance"}


def should_exclude(path: Path, rel: str) -> bool:
    parts = Path(rel).parts
    if parts and parts[0] not in INCLUDE_TOP and rel not in INCLUDE_TOP:
        return True
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    if parts[0] == "backend" and "instance" in parts:
        return True
    name = path.name
    for pat in EXCLUDE_FILE_PATTERNS:
        if pat.search(name):
            return True
    return False


def iter_files():
    for top in sorted(INCLUDE_TOP):
        src = ROOT / top
        if not src.exists():
            continue
        if src.is_file():
            rel = top.replace("\\", "/")
            if not should_exclude(src, rel):
                yield src, f"{ZIP_ROOT}/{rel}"
            continue
        for path in src.rglob("*"):
            if path.is_dir():
                continue
            rel = path.relative_to(ROOT).as_posix()
            if should_exclude(path, rel):
                continue
            yield path, f"{ZIP_ROOT}/{rel}"


def build_zip() -> Path:
    DIST.mkdir(parents=True, exist_ok=True)
    out = DIST / ZIP_NAME
    if out.exists():
        out.unlink()

    count = 0
    total_bytes = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for src, arc in iter_files():
            zf.write(src, arc)
            count += 1
            total_bytes += src.stat().st_size

    size_mb = out.stat().st_size / (1024 * 1024)
    print()
    print("=" * 60)
    print("  METtrack NAAC — Client submission zip created")
    print("=" * 60)
    print(f"  Output : {out}")
    print(f"  Files  : {count}")
    print(f"  Size   : {size_mb:.2f} MB (compressed)")
    print(f"  Built  : {datetime.now():%Y-%m-%d %H:%M}")
    print()
    print("  Send this zip to the client.")
    print("  Client steps: extract -> setup.bat -> start-app.bat")
    print("=" * 60)
    return out


if __name__ == "__main__":
    build_zip()
