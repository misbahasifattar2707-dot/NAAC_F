# Criteria 2 — Field types, files, APIs, and tables

The Flask app uses generic CRUD routes: `GET/POST /api/records/<criterion>`,
`PUT/DELETE /api/records/<criterion>/<id>`, plus `POST /api/upload-evidence` for combined PDF evidence.
Set `SQLALCHEMY_DATABASE_URI` for MySQL (e.g. `mysql+pymysql://user:pass@localhost/naac_db`) or keep the default PostgreSQL URI in `app.py`.

| Criterion | UI file | Field types (rationale) | REST API | MySQL / SQLAlchemy table |
|-----------|-----------|-------------------------|----------|---------------------------|
| 2.1 | `frontend/src/pages/criteria2/Criterion2_1.jsx` | Dropdown: academic year (fixed list). Text: name, enrolment no. Date: enrolment date. Number: — | `GET/POST/PUT/DELETE /api/records/2_1` | `c21_students_during_year` |
| 2.2 | `frontend/src/pages/criteria2/Criterion2_2.jsx` | Dropdown: year, category. Number: reserved seats. Text (URL): document link | `GET/POST/DELETE /api/records/2_2` | `c22_reserved_seats` |
| 2.1.1 | `frontend/src/pages/criteria2/Criterion2_1_1.jsx` | Dropdown: programme name (from `program_lookup`). Text: programme code. Number: seats & admitted | `GET/POST/DELETE /api/records/2_1_1` | `c211_enrolment` |
| 2.1.2 | `frontend/src/pages/criteria2/Criterion2_1_2.jsx` | Dropdown: academic year. Number: earmarked/admitted by category (SC/ST/OBC/Gen/Others) | `GET/POST/DELETE /api/records/2_1_2` | `c212_reservation` |
| 2.3 | `frontend/src/pages/criteria2/Criterion2_3.jsx` | Dropdown: year of passing. Text: student name & enrolment no. (resolved to `student_lookup`) | `GET/POST/PUT/DELETE /api/records/2_3` | `c23_outgoing_students` |
| 2.3.3 | `frontend/src/pages/criteria2/Criterion2_3_3.jsx` | Dropdown: academic year for new rows. Text: branch. Number: year-wise counts; mentor count via meta | `GET/POST/DELETE /api/records/2_3_3`; `GET/PUT /api/records/2_3_3_meta` | `c233_mentor_ratio`, `c233_mentor_meta` |
| 2.4.1 | `frontend/src/pages/criteria2/Criterion2_4_1.jsx` | Text: name, PAN, designation. Number: appointment year, experience. Dropdown: nature (`GET /api/records/2_4_1_nature_options`) | `GET/POST/PUT/DELETE /api/records/2_4_1` | `c241_teachers` + `teacher_lookup` |
| 2.4.2 | `frontend/src/pages/criteria2/Criterion2_4_2.jsx` | Text: teacher name. Dropdown: qualification (`GET /api/records/2_4_2_qualification_options`). Number: obtaining year | `GET/POST/PUT/DELETE /api/records/2_4_2` | `c242_teacher_phd` + `teacher_lookup` |
| 2.6.3 | `frontend/src/pages/criteria2/Criterion2_6_3.jsx` | Dropdown: academic year & programme code. Number: appeared / passed | `GET/POST/DELETE /api/records/2_6_3` | `c263_pass_percentage` |

Reusable components live under `frontend/src/components/forms/` (`DropdownComponent`, `InputComponent`, `NumberInputComponent`, `DatePickerComponent`, `TextareaComponent`, `FileUploadComponent`, `TableComponent`, `useSearchFilter`, `ValidationMessageComponent`).

Reference DDL: `backend/scripts/mysql_schema_criteria2.sql`.
