"""Criteria 3–6 API helpers merged from naac-accrediation-system-main."""
from datetime import datetime, date
from decimal import Decimal
import uuid
import re

from flask import jsonify, request, session
from extensions import db
from models.models import *

CRITERIA_346_MODELS = {
    "3_1": C3FullTimeTeachers, "3_2": C3SanctionedPosts,
    "3_1_1_2": C3ResearchProjects, "3_1_3": C313Events, "3_2_1": C321Papers,
    "3_2_2": C322Books, "3_3_2": C332ExtensionAwards, "3_3_3_4": C333Outreach,
    "3_4_1": C341Collaborations, "3_4_2": C342MoUs,
    "4_1_3": C413ICTRooms, "4_1_4": C4Expenditure, "4_2_2": C42Library,
    "5_1_1": C511Scholarships, "5_1_3": C513SkillInitiatives, "5_1_4": C514CompetitiveExams,
    "5_2_1": C521Placements, "5_2_2": C522HigherEd, "5_2_3": C523QualifyingExams,
    "5_3_1": C531SportsAwards, "5_3_3": C533SportsEvents,
    "6_2_3": C623EGovernance, "6_3_2": C632TeacherFinancial, "6_3_3": C633StaffTraining,
    "6_3_4": C634TeacherFDP, "6_4_2": C642NonGovGrants, "6_5_3": C653QualityInitiatives,
}

CRITERION_346_TITLES = {
    "3_1": "3.1 Number of full-time teachers during the year",
    "3_2": "3.2 Number of sanctioned posts during the year",
    "3_1_1_2": "3.1.1 & 3.1.2 Research grants and projects",
    "3_1_3": "3.1.3 Seminars / conferences / workshops",
    "3_2_1": "3.2.1 Papers published in UGC notified journals",
    "3_2_2": "3.2.2 Books, chapters and conference proceedings",
    "3_3_2": "3.3.2 Extension and outreach awards",
    "3_3_3_4": "3.3.3 & 3.3.4 Outreach and extension activities",
    "3_4_1": "3.4.1 Collaborations / linkages",
    "3_4_2": "3.4.2 Functional MoUs",
    "4_1_3": "4.1.3 ICT facilities",
    "4_1_4": "4.1.4 & 4.4.1 Infrastructure expenditure",
    "4_2_2": "4.2.2 & 4.2.3 Library resources",
    "5_1_1": "5.1.1 & 5.1.2 Scholarships and freeships",
    "5_1_3": "5.1.3 Skills enhancement initiatives",
    "5_1_4": "5.1.4 Career counseling and competitive exams",
    "5_2_1": "5.2.1 Placements",
    "5_2_2": "5.2.2 Higher education progression",
    "5_2_3": "5.2.3 Qualifying exams",
    "5_3_1": "5.3.1 Awards and medals",
    "5_3_3": "5.3.3 Sports and cultural events",
    "6_2_3": "6.2.3 e-Governance",
    "6_3_2": "6.3.2 Financial support for conferences",
    "6_3_3": "6.3.3 Professional development programs",
    "6_3_4": "6.3.4 Faculty development programs",
    "6_4_2": "6.4.2 Non-government funds / grants",
    "6_5_3": "6.5.3 Quality assurance initiatives",
}

UI_TO_DB = {
    "room_details": "room_number",
    "ict_type": "ict_facility_type",
    "link": "geo_tagged_photo_link",
    "resource": "resource_type",
    "details": "membership_details",
    "exp_subscription": "expenditure_ejournals",
    "exp_others": "expenditure_eresources",
    "total_exp": "total_library_expenditure",
    "budget_allocation": "budget_infra",
    "expenditure_augmentation": "expenditure_infra",
    "total_exp_excluding_salary": "total_expenditure_excl_salary",
    "maintenance_academic": "expenditure_academic_maint",
    "maintenance_physical": "expenditure_physical_maint",
    "pi_name": "co_investigator",
    "date_from_to": "activity_report_link",
    "upload_supporting_document": "supporting_document",
}

DB_TO_UI = {v: k for k, v in UI_TO_DB.items()}
DB_TO_UI["proof_links"] = "link"
DB_TO_UI["supporting_document"] = "upload_supporting_document"


def _parse_date_val(val):
    if not val:
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(val).split("T")[0], fmt).date()
        except ValueError:
            continue
    return None


def resolve_teacher_id(data):
    teacher_val = (
        data.get("teacher_id") or data.get("teacherName") or data.get("pi_name")
        or data.get("pi_id") or data.get("name_of_teacher")
        or data.get("name_of_teacher_who_attended")
    )
    if not teacher_val:
        return None
    t = None
    try:
        t = Teacher.query.get(int(teacher_val))
    except (TypeError, ValueError):
        t = None
    if not t:
        t = Teacher.query.filter_by(name=str(teacher_val).strip()).first()
    if not t:
        joining_date_val = None
        j_date_str = data.get("date_of_joining") or data.get("joining_date")
        if j_date_str:
            joining_date_val = _parse_date_val(j_date_str)
        t = Teacher(
            name=str(teacher_val).strip(),
            aadhar_or_id=data.get("id_number_aadhar") or data.get("aadhar_or_id") or data.get("pan"),
            email=data.get("email"),
            gender=data.get("gender"),
            designation=data.get("designation"),
            joining_date=joining_date_val,
            highest_degree=data.get("highest_degree"),
            degree_year=int(data["degree_year"]) if data.get("degree_year") and str(data["degree_year"]).isdigit() else None,
        )
        db.session.add(t)
        db.session.flush()
    else:
        for attr, key in [
            ("email", "email"), ("gender", "gender"), ("designation", "designation"),
            ("aadhar_or_id", "id_number_aadhar"), ("aadhar_or_id", "aadhar_or_id"), ("pan", "pan"),
        ]:
            val = data.get(key)
            if val and getattr(t, attr) != val:
                setattr(t, attr, val)
        j_date_str = data.get("date_of_joining") or data.get("joining_date")
        if j_date_str:
            j_date = _parse_date_val(j_date_str)
            if j_date and t.joining_date != j_date:
                t.joining_date = j_date
        db.session.flush()
    return t.id


def resolve_student_id_c346(data):
    s_name = data.get("studentName") or data.get("student_name")
    if not s_name:
        return None
    student = Student.query.filter_by(name=s_name).first()
    if not student:
        p_code = data.get("programCode") or data.get("program") or data.get("program_graduated")
        reg_no = (
            data.get("registration_no") or data.get("reg_no")
            or data.get("enrollmentNumber") or data.get("registration_number")
        )
        if not reg_no:
            reg_no = f"TEMP-{uuid.uuid4().hex[:8].upper()}"
        prog = None
        if p_code:
            prog = Program.query.filter(
                (Program.program_code == p_code) | (Program.program_name == p_code)
            ).first()
        student = Student(
            name=s_name,
            enrollment_number=reg_no,
            program_id=prog.id if prog else None,
            category=data.get("category"),
        )
        db.session.add(student)
        db.session.flush()
    return student.id


def enrich_criteria346_to_dict(d, rec):
    cls = rec.__class__.__name__
    if cls == "C623EGovernance":
        d["areas_of_e_governance"] = d.get("area", "")
        vendor_parts = [d.get("vendor_name") or "", d.get("vendor_contact") or ""]
        d["name_of_vendor_with_contact_details"] = " ".join(p for p in vendor_parts if p).strip()
    elif cls == "C632TeacherFinancial":
        d["name_of_teacher"] = d.get("teacherName", "")
        d["name_of_conference_workshop"] = d.get("conference_name", "")
        d["name_of_professional_body"] = d.get("professional_body", "")
        d["amount_of_support"] = str(d.get("amount", "")) if d.get("amount") is not None else ""
    elif cls == "C633StaffTraining":
        if not d.get("dates_from_to"):
            df = d.get("date_from", "") or ""
            dt = d.get("date_to", "") or ""
            d["dates_from_to"] = f"{df} to {dt}" if df and dt else df or dt or ""
        d["title_of_professional_development_program"] = d.get("teaching_program_title", "")
        d["title_of_administrative_training_program"] = d.get("non_teaching_program_title", "")
        d["no_of_participants"] = d.get("participant_count", "")
    elif cls == "C634TeacherFDP":
        d["name_of_teacher_who_attended"] = d.get("teacherName", "")
        d["title_of_the_program"] = d.get("program_title", "")
        if not d.get("duration_from_to"):
            df = d.get("duration_from", "") or ""
            dt = d.get("duration_to", "") or ""
            d["duration_from_to"] = f"{df} to {dt}" if df and dt else df or dt or ""
    elif cls == "C313Events":
        df = d.get("date_from", "") or ""
        dt = d.get("date_to", "") or ""
        d["date_from_to"] = f"{df} to {dt}" if df and dt else df or dt or ""
    elif cls == "C642NonGovGrants":
        d["name_of_non_government_funding_agencies_individuals"] = d.get("agency_name", "")
        d["purpose_of_the_grant"] = d.get("purpose", "")
        d["funds_grants_received_inr_in_lakhs"] = str(d.get("amount_received", "")) if d.get("amount_received") is not None else ""
        d["link_to_audited_statement"] = d.get("audited_statement_link", "")
    elif cls == "C653QualityInitiatives":
        d["conferences_seminars_workshops_on_quality"] = d.get("conferences_conducted", "")
        d["academic_administrative_audit_aaa"] = d.get("aaa_status", "")
        d["participation_in_nirf"] = d.get("nirf_status", "")
        d["nba_or_other_certification"] = d.get("nba_certification", "")
        d["collaborative_quality_initiatives"] = d.get("collaborative_initiatives", "")
        d["orientation_programme_on_quality_issues"] = d.get("orientation_program", "")

    if hasattr(rec, "team_or_individual"):
        d["team_individual"] = rec.team_or_individual
    if hasattr(rec, "level"):
        d["event_level"] = rec.level
    if hasattr(rec, "activity_type"):
        d["event_name"] = rec.activity_type

    if hasattr(rec, "pi_id") and rec.pi_id:
        t = Teacher.query.get(rec.pi_id)
        if t:
            d["pi_name"] = t.name
            d["pi_id"] = t.id

    if getattr(rec, "__tablename__", None) == "c3_research_projects":
        d["pi_name"] = d.get("co_investigator") or d.get("pi_name") or ""


def get_records_c346(criterion, to_dict_fn):
    if criterion == "3_1":
        result = []
        for r in C3FullTimeTeachers.query.all():
            d = to_dict_fn(r)
            if r.teacher_id:
                t = Teacher.query.get(r.teacher_id)
                if t:
                    d["id_number_aadhar"] = t.aadhar_or_id
                    d["email"] = t.email
                    d["gender"] = t.gender
                    d["designation"] = t.designation
                    d["date_of_joining"] = t.joining_date.strftime("%d-%m-%Y") if t.joining_date else ""
            result.append(d)
        return jsonify(result)

    if criterion == "3_2_2":
        result = []
        for r in C322Books.query.all():
            d = to_dict_fn(r)
            if r.teacher_ids:
                d["teacher_ids"] = [x.strip() for x in r.teacher_ids.split(",") if x.strip()]
            elif r.teacher_id:
                d["teacher_ids"] = [str(r.teacher_id)]
            else:
                d["teacher_ids"] = []
            d["author_names"] = r.author_names or ""
            d["other_teacher_name"] = r.other_teacher_name or ""
            result.append(d)
        return jsonify(result)

    if criterion == "3_1_1_2":
        result = []
        for r in C3ResearchProjects.query.all():
            d = to_dict_fn(r)
            d["pi_name"] = r.co_investigator or ""
            result.append(d)
        return jsonify(result)

    return None


def map_ui_value_for_column(col, data):
    col_name = col.name
    if col_name in data:
        return data[col_name], True
    for ui_key, db_key in UI_TO_DB.items():
        if db_key == col_name and ui_key in data:
            return data[ui_key], True

    alias_map = {
        "institution_joined": "inst_joined",
        "program_admitted": "prog_joined",
        "program_graduated": "program",
        "exam_type": "exam_qualified",
        "team_or_individual": "team_individual",
        "level": "event_level",
        "activity_type": "event_name",
        "area": "areas_of_e_governance",
        "vendor_name": "name_of_vendor_with_contact_details",
        "conference_name": "name_of_conference_workshop",
        "professional_body": "name_of_professional_body",
        "amount": "amount_of_support",
        "teaching_program_title": "title_of_professional_development_program",
        "non_teaching_program_title": "title_of_administrative_training_program",
        "participant_count": "no_of_participants",
        "program_title": "title_of_the_program",
        "agency_name": "name_of_non_government_funding_agencies_individuals",
        "purpose": "purpose_of_the_grant",
        "amount_received": "funds_grants_received_inr_in_lakhs",
        "audited_statement_link": "link_to_audited_statement",
        "conferences_conducted": "conferences_seminars_workshops_on_quality",
        "aaa_status": "academic_administrative_audit_aaa",
        "nirf_status": "participation_in_nirf",
        "nba_certification": "nba_or_other_certification",
        "collaborative_initiatives": "collaborative_quality_initiatives",
        "orientation_program": "orientation_programme_on_quality_issues",
        "supporting_document": "upload_supporting_document",
    }
    if col_name in alias_map and alias_map[col_name] in data:
        return data[alias_map[col_name]], True
    if col_name == "registration_number":
        val = (
            data.get("registration_no") or data.get("reg_no")
            or data.get("enrollmentNumber") or data.get("registration_number")
        )
        return val, val is not None
    if col_name.startswith("earmarked_"):
        ui = col_name.replace("earmarked_", "ear_")
        if ui in data:
            return data[ui], True
    if col_name.startswith("admitted_"):
        ui = col_name.replace("admitted_", "adm_")
        if ui in data:
            return data[ui], True
    return None, False


def coerce_column_value(col, val):
    if val is None or val == "":
        return None
    if col.name == "status_of_implementation":
        return str(val).lower() == "yes"
    if isinstance(col.type, db.Date):
        return _parse_date_val(val)
    if isinstance(col.type, db.Integer):
        try:
            return int(val)
        except (TypeError, ValueError):
            match = re.search(r"\d+", str(val))
            return int(match.group()) if match else None
    if isinstance(col.type, db.Numeric):
        try:
            return float(val)
        except (TypeError, ValueError):
            match = re.search(r"\d+(?:\.\d+)?", str(val))
            return float(match.group()) if match else None
    return val


def apply_c346_foreign_keys(model, data, db_kwargs=None, rec=None):
    target = db_kwargs if db_kwargs is not None else rec
    is_dict = db_kwargs is not None

    if hasattr(model, "teacher_id") or hasattr(model, "pi_id"):
        t_id = resolve_teacher_id(data)
        if t_id:
            if hasattr(model, "teacher_id"):
                if is_dict:
                    db_kwargs["teacher_id"] = t_id
                else:
                    rec.teacher_id = t_id
            if hasattr(model, "pi_id"):
                if is_dict:
                    db_kwargs["pi_id"] = t_id
                else:
                    rec.pi_id = t_id

    if hasattr(model, "student_id"):
        sid = resolve_student_id_c346(data)
        if sid:
            if is_dict:
                db_kwargs["student_id"] = sid
            else:
                rec.student_id = sid


def apply_c346_column_mapping(model, data, db_kwargs):
    for col in model.__table__.columns:
        if col.name == "id":
            continue
        val, has_val = map_ui_value_for_column(col, data)
        if not has_val:
            continue
        db_kwargs[col.name] = coerce_column_value(col, val)



def apply_c346_update(model, data, rec):
    apply_c346_foreign_keys(model, data, rec=rec)
    for col in model.__table__.columns:
        if col.name == "id":
            continue
        val, has_val = map_ui_value_for_column(col, data)
        if has_val:
            setattr(rec, col.name, coerce_column_value(col, val))


def register_c346_routes(api_bp, to_dict_fn):
    @api_bp.route("/records/3_1_1_2", methods=["POST"])
    def add_record_3_1_1_2():
        data = request.json or {}
        try:
            rec = C3ResearchProjects(
                project_name=data.get("project_name", ""),
                co_investigator=data.get("pi_name", data.get("co_investigator", "")),
                department=data.get("department", ""),
                year_of_award=int(data["year_of_award"]) if data.get("year_of_award") and str(data["year_of_award"]).isdigit() else None,
                amount_sanctioned=data.get("amount_sanctioned") or None,
                duration=data.get("duration", ""),
                funding_agency=data.get("funding_agency", ""),
                funding_type=data.get("funding_type", ""),
                created_by_id=session.get("user_id"),
                updated_by_id=session.get("user_id"),
            )
            db.session.add(rec)
            db.session.commit()
            return jsonify({"success": True, "data": to_dict_fn(rec)})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)}), 400

    @api_bp.route("/records/3_2_2", methods=["POST"])
    def add_record_3_2_2():
        data = request.json or {}
        teacher_ids = data.get("teacher_ids", [])
        other_name = data.get("other_teacher_name", "")
        names, primary_tid = [], None
        for tid in teacher_ids:
            t = Teacher.query.get(int(tid))
            if t:
                names.append(t.name)
                if primary_tid is None:
                    primary_tid = t.id
        if other_name:
            names.append(other_name)
            if primary_tid is None:
                t = Teacher.query.filter_by(name=other_name).first()
                if not t:
                    t = Teacher(name=other_name)
                    db.session.add(t)
                    db.session.flush()
                primary_tid = t.id
        try:
            rec = C322Books(
                teacher_id=primary_tid,
                other_teacher_name=other_name,
                author_names=", ".join(names),
                teacher_ids=",".join(map(str, teacher_ids)),
                book_title=data.get("book_title", ""),
                paper_title=data.get("paper_title", ""),
                chapter_title=data.get("book_title", ""),
                conference_name=data.get("conference_name", ""),
                proceedings_title=data.get("proceedings_title", ""),
                level=data.get("level", ""),
                year_of_publication=data.get("year_of_publication") or None,
                isbn_issn=data.get("isbn_issn", ""),
                affiliating_institute=data.get("affiliating_institute", ""),
                publisher=data.get("publisher", ""),
                created_by_id=session.get("user_id"),
                updated_by_id=session.get("user_id"),
            )
            db.session.add(rec)
            db.session.commit()
            d = to_dict_fn(rec)
            d["author_names"] = rec.author_names
            d["teacher_ids"] = teacher_ids
            d["other_teacher_name"] = other_name
            return jsonify({"success": True, "data": d})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)}), 400

    @api_bp.route("/records/3_2_2/<int:id>", methods=["PUT"])
    def update_record_3_2_2(id):
        rec = C322Books.query.get(id)
        if not rec:
            return jsonify({"success": False, "error": "Record not found"}), 404
        data = request.json or {}
        teacher_ids = data.get("teacher_ids", [])
        other_name = data.get("other_teacher_name", "")
        names, primary_tid = [], None
        for tid in teacher_ids:
            t = Teacher.query.get(int(tid))
            if t:
                names.append(t.name)
                if primary_tid is None:
                    primary_tid = t.id
        if other_name:
            names.append(other_name)
        try:
            rec.teacher_id = primary_tid
            rec.teacher_ids = ",".join(map(str, teacher_ids))
            rec.other_teacher_name = other_name
            rec.author_names = ", ".join(names)
            rec.book_title = data.get("book_title", "")
            rec.paper_title = data.get("paper_title", "")
            rec.chapter_title = data.get("book_title", "")
            rec.conference_name = data.get("conference_name", "")
            rec.proceedings_title = data.get("proceedings_title", "")
            rec.level = data.get("level", "")
            rec.year_of_publication = data.get("year_of_publication") or None
            rec.isbn_issn = data.get("isbn_issn", "")
            rec.affiliating_institute = data.get("affiliating_institute", "")
            rec.publisher = data.get("publisher", "")
            rec.updated_by_id = session.get("user_id")
            db.session.commit()
            d = to_dict_fn(rec)
            d["author_names"] = rec.author_names
            d["teacher_ids"] = teacher_ids
            d["other_teacher_name"] = other_name
            return jsonify({"success": True, "data": d})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)}), 400
