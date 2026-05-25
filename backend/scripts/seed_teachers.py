"""
seed_teachers.py — Insert the 6 required teachers into teacher_lookup.
Run from the backend/ directory:
    python scripts/seed_teachers.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from extensions import db
from models.models import Teacher

TEACHERS = [
    "Prof. P.D.Jadhav",
    "Prof. Manjusha.V.Khond",
    "Prof. Javed R. Attar",
    "Prof. Sonali Vidhate",
    "Prof. Mehraj I Khan",
    "Prof. Priti Fulduore",
]

def seed():
    app = create_app()
    with app.app_context():
        added, skipped = 0, 0
        for name in TEACHERS:
            exists = Teacher.query.filter_by(name=name).first()
            if exists:
                print(f"  [SKIP] Already exists: {name}")
                skipped += 1
            else:
                t = Teacher(name=name)
                db.session.add(t)
                print(f"  [ADD]  {name}")
                added += 1
        db.session.commit()
        print(f"\nDone! Added: {added}, Skipped: {skipped}")

        # Verify
        all_teachers = Teacher.query.order_by(Teacher.name).all()
        print("\nAll teachers in DB:")
        for t in all_teachers:
            print(f"  id={t.id}  name={t.name}")

if __name__ == "__main__":
    seed()
