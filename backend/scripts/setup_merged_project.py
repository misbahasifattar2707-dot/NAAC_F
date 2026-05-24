"""One-shot bootstrap for the merged NAAC app (Criteria 1–6)."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app import create_app
from extensions import db
import models  # noqa: F401


def main():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Tables created/verified.")

    from scripts.seeds import seed_lookups
    seed_lookups()
    print("Merged NAAC database ready (Criteria 1–6).")


if __name__ == "__main__":
    main()
