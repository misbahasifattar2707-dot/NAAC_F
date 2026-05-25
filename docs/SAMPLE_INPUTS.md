# Sample Inputs for Testing — MCA Programme

Use these values to test each criterion in the UI. All tests use:

| Field | Value |
|-------|-------|
| Academic year | 2024-25 |
| Program code | 515124110 |
| Program name | MCA |
| Department | MCA |
| Teacher | Dr. Test Teacher |
| Student | Test Student MCA |
| Enrollment | TEST001 |

---

## Criterion 1

| Page | Key fields |
|------|------------|
| **1.1** | department: MCA, programCode: 515124110, programName: FYMCA-SEM-I, courseCode: MCA101, courseName: Test Course, year: 2024 |
| **1.1.3** | year: 2024-25, teacherName: Dr. Test Teacher, bodyName: Board of Studies |
| **1.2.1** | programCode: 515124110, programName: MCA, department: MCA, yearIntro: 2024, cbcsStatus: Yes, cbcsYear: 2024 |
| **1.2.2** | programName: Certificate in Data Analytics, yearOffering: 2024-25, timesOffered: 1, duration: 30 Hours, studentsEnrolled: 10, studentsCompleted: 8 |
| **1.3.2** | programCode: 515124110, programName: MCA, year: 2024-25, studentName: Test Student MCA, courseType: Major Project, courseCode: MCA-MP-001 |
| **1.3.3** | programCode: 515124110, programName: MCA, studentName: Test Student MCA |

---

## Criterion 2

| Page | Key fields |
|------|------------|
| **2.1** | enrollment_year: 2024-25, student_name: Test Student MCA, enrollment_number: TEST001 |
| **2.1.1** | programme_code: 515124110, programme_name: MCA, academic_year: 2024-25, seats_sanctioned: 60, students_admitted: 55 |
| **2.1.2** | year: 2024-25, ear_sc: 10, ear_st: 5, ear_obc: 15, ear_gen: 30, adm_sc: 8, adm_st: 4, adm_obc: 12, adm_gen: 28 |
| **2.2** | year: 2024-25, category: SC, reserved_seats: 5 |
| **2.3** | passing_year: 2024-25, student_name: Test Student MCA, enrollment_number: TEST001 |
| **2.3.3** | academic_year: 2024-25, branch: MCA, first: 20, second: 18, third: 0, fourth: 0 |
| **2.4.1** | name: Dr. Test Teacher, department: MCA, pan: ABCDE1234F, designation: Assistant Professor, year: 2024, nature: Regular, experience: 5 |
| **2.4.2** | teacher_name: Dr. Test Teacher, qualification: Ph.D., obtaining_year: 2024 |
| **2.6.3** | year: 2024-25, program_code: 515124110, program_name: MCA, appeared_count: 50, passed_count: 45 |

---

## Criteria 3–6 (examples)

| Page | Key fields |
|------|------------|
| **3.1** | teacherName: Dr. Test Teacher, academic_year: 2024-25, sanctioned_posts: 1 |
| **3.2.2** | other_teacher_name: Dr. Test Teacher, book_title: Test Book Chapter |
| **4.1.3** | room_number: LAB-101 |
| **5.2.1** | year: 2024, student_name: Test Student MCA, program: MCA, employer_name: Test Company |
| **6.2.3** | areas_of_e_governance: Examination, name_of_vendor: Vendor Test 9876543210, year_of_implementation: 2024 |

---

## Automated test

Developers can run the full API smoke test:

```powershell
cd backend
..\.venv\Scripts\python.exe scripts\test_all_criteria_basic.py
```

Expected result: **43/43 criteria passed**.
