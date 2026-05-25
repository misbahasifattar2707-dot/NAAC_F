import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from extensions import db
from models.models import SemesterLookup, SemesterCourseLookup, Teacher, AcademicYearLookup

app = create_app()

semesters_data = [
  { "id": 1, "name": "FYMCA-SEM-I (MCA)", "semester": 1 },
  { "id": 2, "name": "FYMCA-SEM-II (MCA)", "semester": 2 },
  { "id": 3, "name": "SYMCA-SEM-III (MCA)", "semester": 3 },
  { "id": 4, "name": "SYMCA-SEM-IV (MCA)", "semester": 4 }
]

courses_data = [
  { "code": "310901", "name": "Discrete Mathematics and Statistics", "semester": 1 },
  { "code": "310902", "name": "Data Structures and Algorithms", "semester": 1 },
  { "code": "310903", "name": "Object Oriented Programming", "semester": 1 },
  { "code": "310904", "name": "Software Engineering & Project Management", "semester": 1 },
  { "code": "310905", "name": "Information Systems and Engineering Economics", "semester": 1 },
  { "code": "310906", "name": "Data Structures and Algorithms Laboratory", "semester": 1 },
  { "code": "310907", "name": "Object Oriented Programming Laboratory", "semester": 1 },
  { "code": "310908", "name": "Python Programming Laboratory", "semester": 1 },
  { "code": "310909", "name": "Business Communication Lab", "semester": 1 },
  { "code": "310910", "name": "Audit Course", "semester": 1 },
  { "code": "310911", "name": "MOOC Course-I (Swayam/NPTEL)", "semester": 1 },

  { "code": "310912", "name": "Database Management System", "semester": 2 },
  { "code": "310913", "name": "Computer Network", "semester": 2 },
  { "code": "310914", "name": "Java Programming", "semester": 2 },
  { "code": "310915", "name": "Operating System", "semester": 2 },
  { "code": "310916", "name": "Elective-I", "semester": 2 },
  { "code": "310917", "name": "Database Management System Laboratory", "semester": 2 },
  { "code": "310918", "name": "Operating System Lab", "semester": 2 },
  { "code": "310919", "name": "Java Programming Laboratory", "semester": 2 },
  { "code": "310920", "name": "Project Based Learning-I (PBL-1)", "semester": 2 },
  { "code": "310921", "name": "Audit Course-2", "semester": 2 },
  { "code": "310922", "name": "MOOC Course-II (Swayam/NPTEL)", "semester": 2 },

  { "code": "410901", "name": "Data Science", "semester": 3 },
  { "code": "410902", "name": "Web Technologies", "semester": 3 },
  { "code": "410903", "name": "Cloud Computing", "semester": 3 },
  { "code": "410904", "name": "Elective-II", "semester": 3 },
  { "code": "410905", "name": "Software Testing and Quality Assurance", "semester": 3 },
  { "code": "410906", "name": "Web Technologies Lab", "semester": 3 },
  { "code": "410907", "name": "Computer Laboratory", "semester": 3 },
  { "code": "410908", "name": "Data Science Laboratory", "semester": 3 },
  { "code": "410909", "name": "Project Based Learning-II", "semester": 3 },
  { "code": "410910", "name": "AC 3-I", "semester": 3 },
  { "code": "410911", "name": "MOOC Course-III (Swayam/NPTEL)", "semester": 3 },

  { "code": "410912", "name": "Major Project", "semester": 4 },
  { "code": "410913", "name": "Seminar on Major Project", "semester": 4 },
  { "code": "410914", "name": "Audit Course-4", "semester": 4 }
]

teachers_data = [
  "Prof. P.D.Jadhav",
  "Prof. Manjusha.V.Khond",
  "Prof. Javed R. Attar",
  "Prof. Sonali Vidhate",
  "Prof. Mehraj I Khan",
  "Prof. Priti Fulduore"
]

academic_years = ["2022-23", "2023-24", "2024-25", "2025-26", "2026-27"]

def seed_db():
    with app.app_context():
        print("Seeding SemesterLookup...")
        for s in semesters_data:
            existing = SemesterLookup.query.filter_by(value=s["name"]).first()
            if not existing:
                db.session.add(SemesterLookup(value=s["name"]))
        
        print("Seeding SemesterCourseLookup...")
        for c in courses_data:
            sem_name = next((s["name"] for s in semesters_data if s["semester"] == c["semester"]), None)
            if sem_name:
                existing = SemesterCourseLookup.query.filter_by(semester=sem_name, course_code=c["code"]).first()
                if not existing:
                    db.session.add(SemesterCourseLookup(semester=sem_name, course_code=c["code"], course_name=c["name"]))

        print("Seeding Teachers...")
        for t in teachers_data:
            existing = Teacher.query.filter_by(name=t).first()
            if not existing:
                db.session.add(Teacher(name=t))

        print("Seeding Academic Years...")
        for ay in academic_years:
            existing = AcademicYearLookup.query.filter_by(value=ay).first()
            if not existing:
                db.session.add(AcademicYearLookup(value=ay))
        
        db.session.commit()
        print("Seeding complete!")

if __name__ == '__main__':
    seed_db()
