#!/usr/bin/env python3
"""Basic smoke test: POST sample inputs to all criteria, verify GET + Excel + proof link."""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models.models import User
from routes.api_routes import CRITERIA_MODELS

AY = "2024-25"
YEAR_INT = 2024
PC = "515124110"
PN = "MCA"
DEPT = "MCA"
TEACHER = "Dr. Test Teacher"
STUDENT = "Test Student MCA"
ENROLL = "TEST001"
PROOF = "https://example.com/naac-proof-sample.pdf"


def build_payloads(unique_suffix: str) -> dict:
    return {
        "1_1": {
            "department": DEPT,
            "programCode": PC,
            "programName": "FYMCA-SEM-I",
            "courseCode": f"MCA101_{unique_suffix}",
            "courseName": "Test Course",
            "year": "2024",
            "academicYear": AY,
        },
        "1_1_3": {"year": AY, "teacherName": TEACHER, "bodyName": "Board of Studies"},
        "1_2_1": {
            "programCode": PC,
            "programName": PN,
            "department": DEPT,
            "yearIntro": "2024",
            "cbcsStatus": "Yes",
            "cbcsYear": "2024",
        },
        "1_2_2": {
            "programName": "Certificate in Data Analytics",
            "yearOffering": AY,
            "timesOffered": 1,
            "duration": "30 Hours",
            "studentsEnrolled": 10,
            "studentsCompleted": 8,
        },
        "1_3_2": {
            "programCode": PC,
            "programName": PN,
            "year": AY,
            "studentName": STUDENT,
            "courseType": "Major Project",
            "courseCode": f"MCA-MP-{unique_suffix}",
        },
        "1_3_3": {"programCode": PC, "programName": PN, "studentName": STUDENT},
        "2_1": {
            "enrollment_year": AY,
            "student_name": STUDENT,
            "enrollment_number": f"{ENROLL}_{unique_suffix}",
        },
        "2_2": {"year": AY, "category": "SC", "reserved_seats": 5},
        "2_1_1": {
            "programme_code": PC,
            "programme_name": PN,
            "academic_year": AY,
            "seats_sanctioned": 60,
            "students_admitted": 55,
        },
        "2_1_2": {
            "year": AY,
            "ear_sc": 10,
            "ear_st": 5,
            "ear_obc": 15,
            "ear_gen": 30,
            "ear_others": 0,
            "adm_sc": 8,
            "adm_st": 4,
            "adm_obc": 12,
            "adm_gen": 28,
            "adm_others": 0,
        },
        "2_3": {
            "passing_year": AY,
            "student_name": STUDENT,
            "enrollment_number": f"{ENROLL}_{unique_suffix}",
        },
        "2_3_3": {
            "academic_year": AY,
            "branch": "MCA",
            "first": 20,
            "second": 18,
            "third": 0,
            "fourth": 0,
        },
        "2_3_3_meta": {"mentor_count": 5},
        "2_4_1": {
            "name": TEACHER,
            "department": DEPT,
            "pan": "ABCDE1234F",
            "designation": "Assistant Professor",
            "year": YEAR_INT,
            "nature": "Regular",
            "experience": 5.0,
            "is_still_serving": True,
        },
        "2_4_2": {
            "teacher_name": TEACHER,
            "qualification": "Ph.D.",
            "obtaining_year": YEAR_INT,
            "number_of_full_time_teachers": 1,
        },
        "2_6_3": {
            "year": AY,
            "program_code": PC,
            "program_name": PN,
            "appeared_count": 50,
            "passed_count": 45,
        },
        "3_1": {"teacherName": TEACHER, "academic_year": AY, "sanctioned_posts": 1},
        "3_2": {"year": YEAR_INT, "sanctioned_posts_count": 10},
        "3_1_1_2": {
            "project_name": "Test Research Project",
            "pi_name": TEACHER,
            "department": DEPT,
            "year_of_award": YEAR_INT,
        },
        "3_1_3": {"year": YEAR_INT, "event_name": "Test Workshop"},
        "3_2_1": {
            "paper_title": "Test Paper Title",
            "author_names": TEACHER,
            "department": DEPT,
        },
        "3_2_2": {
            "teacher_ids": [],
            "other_teacher_name": TEACHER,
            "book_title": "Test Book Chapter",
        },
        "3_3_2": {
            "activity_name": "Community Outreach",
            "award_name": "Best Extension Activity",
            "award_year": YEAR_INT,
        },
        "3_3_3_4": {
            "activity_name": "Extension Activity",
            "year": YEAR_INT,
            "students_participated": 25,
        },
        "3_4_1": {"activity_title": "Industry Collaboration", "year": YEAR_INT},
        "3_4_2": {"organisation_name": "Test Organisation", "signing_year": YEAR_INT},
        "4_1_3": {"room_number": f"LAB-{unique_suffix}"},
        "4_1_4": {"year": YEAR_INT},
        "4_2_2": {
            "academic_year": AY,
            "resource_type": "e-Journals",
            "membership_details": "Test membership",
        },
        "5_1_1": {"year": YEAR_INT, "scheme_name": "Merit Scholarship"},
        "5_1_3": {
            "program_name": "Soft Skills Workshop",
            "implementation_date": "2024-08-01",
            "students_enrolled": 30,
            "agencies_involved": "Training Partner",
        },
        "5_1_4": {"year": YEAR_INT},
        "5_2_1": {
            "year": YEAR_INT,
            "student_name": STUDENT,
            "program": PN,
            "employer_name": "Test Company",
        },
        "5_2_2": {
            "student_name": STUDENT,
            "program_graduated": PN,
            "inst_joined": "Test University",
            "prog_joined": "M.Tech",
        },
        "5_2_3": {
            "year": YEAR_INT,
            "registration_no": f"{ENROLL}_{unique_suffix}",
            "student_name": STUDENT,
            "exam_qualified": "GATE",
        },
        "5_3_1": {
            "year": YEAR_INT,
            "award_name": "Gold Medal",
            "event_name": "Sports",
            "student_name": STUDENT,
        },
        "5_3_3": {
            "event_name": "Annual Sports Meet",
            "student_name": STUDENT,
            "event_date": "2024-10-15",
        },
        "6_2_3": {
            "areas_of_e_governance": "Examination",
            "name_of_vendor_with_contact_details": "Vendor Test 9876543210",
            "year_of_implementation": YEAR_INT,
        },
        "6_3_2": {
            "year": YEAR_INT,
            "name_of_teacher": TEACHER,
            "name_of_conference_workshop": "Test Conference",
        },
        "6_3_3": {
            "dates_from_to": "2024-07-01 to 2024-07-03",
            "no_of_participants": 20,
        },
        "6_3_4": {
            "name_of_teacher_who_attended": TEACHER,
            "title_of_the_program": "FDP on Teaching Methods",
            "duration_from_to": "2024-06-01 to 2024-06-05",
        },
        "6_4_2": {
            "year": YEAR_INT,
            "name_of_non_government_funding_agencies_individuals": "Test Trust",
        },
        "6_5_3": {"year": YEAR_INT},
    }


def ensure_session(client, app):
    with app.app_context():
        user = User.query.first()
        uid = user.id if user else None
    with client.session_transaction() as sess:
        sess["user_id"] = uid
        sess["academic_year"] = AY


def run_tests():
    app = create_app()
    client = app.test_client()
    ensure_session(client, app)

    suffix = str(int(time.time()))[-6:]
    payloads = build_payloads(suffix)
    keys = sorted(CRITERIA_MODELS.keys())
    results = []

    print(f"\n{'=' * 72}")
    print("METtrack NAAC — Basic Criteria Test (sample MCA inputs)")
    print(f"Academic year: {AY} | Program: {PN} ({PC}) | Run suffix: {suffix}")
    print(f"{'=' * 72}\n")

    for key in keys:
        row = {"key": key, "get": "—", "post": "—", "export": "—", "proof": "—", "note": ""}

        # GET before POST
        r = client.get(f"/api/records/{key}")
        row["get"] = "OK" if r.status_code == 200 else f"FAIL({r.status_code})"

        payload = payloads.get(key)
        if payload is not None:
            r = client.post(
                f"/api/records/{key}",
                data=json.dumps(payload),
                content_type="application/json",
            )
            body = r.get_json(silent=True) or {}
            if r.status_code in (200, 201) and body.get("success") is not False:
                row["post"] = "OK"
            else:
                err = body.get("error") or r.get_data(as_text=True)[:120]
                row["post"] = f"FAIL({r.status_code})"
                row["note"] = str(err)[:100]
        elif key == "2_3_3_meta":
            row["post"] = "OK" if payloads.get(key) else "SKIP"

        r = client.get(f"/api/export-excel/{key}")
        ct = (r.content_type or "").lower()
        if r.status_code == 200 and ("spreadsheet" in ct or "excel" in ct or "octet" in ct):
            row["export"] = "OK"
        else:
            row["export"] = f"FAIL({r.status_code})"
            if not row["note"]:
                row["note"] = (r.get_json(silent=True) or {}).get("error", "")[:80]

        r = client.post(
            f"/api/proof-link/{key}",
            data=json.dumps({"link": PROOF}),
            content_type="application/json",
        )
        body = r.get_json(silent=True) or {}
        row["proof"] = "OK" if r.status_code == 200 and body.get("success") else f"FAIL({r.status_code})"

        results.append(row)
        status = "PASS" if all(v == "OK" for k, v in row.items() if k in ("get", "post", "export", "proof")) else "FAIL"
        print(f"[{status:4}] {key:12} GET={row['get']:12} POST={row['post']:12} XLS={row['export']:12} PROOF={row['proof']}")
        if row["note"]:
            print(f"       -> {row['note']}")

    passed = sum(
        1
        for r in results
        if all(r[k] == "OK" for k in ("get", "post", "export", "proof"))
    )
    failed = [r for r in results if r not in [x for x in results if all(x[k] == "OK" for k in ("get", "post", "export", "proof"))]]

    print(f"\n{'=' * 72}")
    print(f"SUMMARY: {passed}/{len(results)} criteria fully passed")
    if failed:
        print("\nFailed criteria:")
        for r in failed:
            print(f"  - {r['key']}: GET={r['get']} POST={r['post']} XLS={r['export']} PROOF={r['proof']}")
            if r["note"]:
                print(f"    {r['note']}")
    print(f"{'=' * 72}\n")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(run_tests())
