import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from extensions import db
from models.models import (
    SemesterLookup, CourseTypeLookup, AcademicYearLookup,
    ReservedCategoryLookup, LibraryResourceLookup, QualifyingExamLookup,
    EventLevelLookup, AwardCategoryLookup, DepartmentLookup,
    DesignationLookup, HighestDegreeLookup, AppointmentTypeLookup,
    FundingAgencyLookup, LevelLookup, TeamIndividualLookup,
    EGovernanceAreaLookup,
)


def seed_simple(model, values):
    for val in values:
        existing = model.query.filter_by(value=val).first()
        if not existing:
            db.session.add(model(value=val))


def seed_lookups():
    app = create_app()
    with app.app_context():
        seed_simple(SemesterLookup, ["FYMCA-SEM-I", "FYMCA-SEM-II", "SYMCA-SEM-III", "SYMCA-SEM-IV"])
        seed_simple(CourseTypeLookup, ["PBL (Project Based Learning)", "Major Project", "Seminar", "Theory", "Lab"])
        seed_simple(AcademicYearLookup, ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"])
        seed_simple(ReservedCategoryLookup, ["SC", "ST", "OBC", "Divyangjan", "Gen-EWS", "Others"])
        seed_simple(LibraryResourceLookup, ["Books", "Journals", "e-Journals", "e-Books", "e-ShodhSindhu", "Shodhganga", "Databases"])
        seed_simple(QualifyingExamLookup, ["NET", "SLET", "GATE", "GMAT", "CAT", "GRE", "JAM", "IELTS", "TOEFL", "Civil Services", "State government examinations"])
        seed_simple(EventLevelLookup, ["Inter-university", "State", "National", "International", "District"])
        seed_simple(AwardCategoryLookup, ["Individual", "Team"])
        seed_simple(DepartmentLookup, ["MCA", "MBA", "ME", "BE", "BArch", "BPharm", "BCA", "BSc"])
        seed_simple(DesignationLookup, ["Professor", "Associate Professor", "Assistant Professor", "HOD", "Director", "Principal", "Lab Assistant"])
        seed_simple(HighestDegreeLookup, ["PhD", "M.Tech", "MCA", "MBA", "M.Sc", "B.E.", "B.Tech", "NET/SET"])
        seed_simple(AppointmentTypeLookup, ["Permanent", "Adhoc", "Visiting", "Contractual", "Guest Faculty"])
        seed_simple(FundingAgencyLookup, ["UGC", "AICTE", "DST", "ISRO", "University of Pune", "Self-Financed", "Non-Gov Body"])
        seed_simple(LevelLookup, ["University", "State", "National", "International", "District", "Zonal"])
        seed_simple(TeamIndividualLookup, ["Individual", "Team"])
        seed_simple(EGovernanceAreaLookup, ["Administration", "Finance and Accounts", "Student Admission and Support", "Examination"])
        db.session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    seed_lookups()
