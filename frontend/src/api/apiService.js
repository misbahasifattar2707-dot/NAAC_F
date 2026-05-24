// ============================================================
// apiService.js — THE KEY FILE
//
// HOW TO SWITCH TO REAL BACKEND:
//   1. Set USE_MOCK = false
//   2. Set BASE_URL to your backend URL
//   Done! Every dropdown & record call goes to real API.
//
// SHARE THIS WITH YOUR BACKEND DEVELOPER:
//   GET  /api/teachers              → [{id, name}]
//   GET  /api/departments           → [{id, code, programCode, programName}]
//   GET  /api/semesters             → [{value, label}]
//   GET  /api/courses?sem=X         → [{code, name}]
//   GET  /api/electives             → [{code, name}]
//   GET  /api/program-codes         → [{code, label}]
//   GET  /api/course-types          → [{value, label, courseCode}]
//   --- CRITERIA 2 ---
//   GET  /api/academic-years        → ["2021-22","2022-23","2023-24","2024-25"]
//   GET  /api/programmes            → [{ code, name, department?, display_name? }]
//   POST /api/programmes            → { program_code, program_name }
//   GET  /api/reserved-categories   → ["SC","ST","OBC","Divyangjan","Gen-EWS","Others"]
//   POST /api/criteria2/2_3/parse-outgoing-list → multipart `file` (.csv/.xlsx) → { success, students:[{enrollment_number, student_name}], count }
//   GET  /api/records/2_4_1_nature_options → string[]  (e.g. ["Regular","Temporary","Permanent"])
//   GET  /api/records/2_4_2_qualification_options → string[]  (e.g. ["Ph.D.","NET","SET","SLET"])
//   --- RECORDS ---
//   GET  /api/records/:criterion        → [array of records]
//   POST /api/records/:criterion        → {success, data}
//   PUT  /api/records/:criterion/:id    → {success}
//   DELETE /api/records/:criterion/:id  → {success}
//   POST /api/records/:criterion/bulk-delete → {success}
// ============================================================

const BASE_URL = "/api";

// ---- Helper ----
async function apiFetch(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    ...options,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${res.status} for ${url}: ${text.slice(0, 160)}`);
  }
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("<")) {
    throw new Error(`Expected JSON from ${url} but got HTML (restart backend / rebuild frontend).`);
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

// ============================================================
// DROPDOWN DATA — called on component mount
// ============================================================

/** Normalize GET /teachers → [{ id, name, pan?, designation? }] from teacher_lookup */
export function normalizeTeacherList(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((t) => ({
      id: t.id,
      name: (t.name || t.teacher_name || "").trim(),
      pan: t.pan || "",
      designation: t.designation || "",
    }))
    .filter((t) => t.id != null && t.name);
}

export const getTeachers = async () => {
  const data = await apiFetch("/teachers");
  return normalizeTeacherList(data);
};

export const getDepartments = async () => {
  return apiFetch("/departments");
};

export const getSemesters = async () => {
  return apiFetch("/semesters");
};

export const getCoursesBySemester = async (semester) => {
  return apiFetch(`/courses?sem=${encodeURIComponent(semester)}`);
};

export const addCourse = async (semester, courseCode, courseName) => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ semester, course_code: courseCode, course_name: courseName }),
  });
  return res.json();
};

export const getElectiveSubjects = async () => {
  return apiFetch("/electives");
};

export const getProgramCodes = async () => {
  return apiFetch("/program-codes");
};

export const getCourseTypes = async () => {
  return apiFetch("/course-types");
};

// ============================================================
// RECORDS CRUD — criterion name is the key
// e.g. criterion = "1_1" | "1_1_3" | "1_2_1" | etc.
// ============================================================

export const getRecords = async (criterion) => {
  return apiFetch(`/records/${criterion}`);
};

export const addRecord = async (criterion, data) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateRecord = async (criterion, id, data) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteRecord = async (criterion, id) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

export const deleteRecordsBulk = async (criterion, ids) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return res.json();
};

export const addLookup = async (lookupKey, value) => {
  const res = await fetch(`${BASE_URL}/lookups/${lookupKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  return res.json();
};

// ============================================================
// CRITERIA 2 DROPDOWN DATA
// ============================================================

/** Academic years from academic_year_lookup (e.g. 2024-25). Not for intro/implementation/offering year fields. */
export function normalizeAcademicYearList(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((y) => {
      if (typeof y === "string" || typeof y === "number") return String(y).trim();
      if (y && typeof y === "object")
        return String(y.value ?? y.label ?? y.year_name ?? "").trim();
      return "";
    })
    .filter(Boolean);
}

export const getAcademicYears = async () => {
  try {
    const data = await apiFetch("/academic-years");
    const years = normalizeAcademicYearList(data);
    if (years.length) return years;
  } catch {
    /* fall through */
  }
  try {
    const alt = await apiFetch("/get-lookups/academic-years");
    return normalizeAcademicYearList(
      (alt || []).map((x) => x.value ?? x.label),
    );
  } catch {
    return [];
  }
};

export const getProgrammes = async () => {
  return apiFetch("/programmes");
};

/** Body: { program_code, program_name, department? } — persists to program_lookup */
export const addProgramme = async (program_code, program_name, department = "") => {
  const body = { program_code, program_name };
  if (department) body.department = department;
  const res = await fetch(`${BASE_URL}/programmes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const addTeacher = async (payload) => {
  const res = await fetch(`${BASE_URL}/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const addElective = async (code, name) => {
  const res = await fetch(`${BASE_URL}/electives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, name }),
  });
  return res.json();
};

export const getAddonDurations = async () => {
  try {
    const data = await apiFetch("/addon-durations");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getReservedCategories = async () => {
  return apiFetch("/reserved-categories");
};

/** Parse Criterion 2.1 student list PDF → draft rows (enrollment number + name only). */
export const parseCriterion21StudentPdf = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/criteria2/2_1/parse-student-list-pdf`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

/** Criterion 2.1 — upload PDF/Excel with shared year → auto-save all students + proof link. */
export const bulkImportCriterion21 = async (enrollmentYear, file, enrollmentDate = null) => {
  const formData = new FormData();
  formData.append("enrollment_year", enrollmentYear);
  formData.append("file", file);
  if (enrollmentDate) formData.append("enrollment_date", enrollmentDate);
  const res = await fetch(`${BASE_URL}/records/2_1/bulk-import`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return res.json();
};

/** Criterion 2.1 — Return raw lines extracted from PDF (for debug/preview) */
export const previewCriterion21PdfText = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/criteria2/2_1/preview-pdf-text`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

/** Criterion 2.3 — CSV / Excel student list → { success, students:[{enrollment_number, student_name}], count } */
export const parseOutgoingStudentListFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/criteria2/2_3/parse-outgoing-list`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

// ============================================================
// CRITERIA 4 DROPDOWN DATA
// GET /api/library-resources → string[]
// ============================================================
export const getLibraryResources = async () => {
  return apiFetch("/library-resources");
};

// ============================================================
// CRITERIA 5 DROPDOWN DATA
// GET /api/qualifying-exams  → [{value, label}]
// GET /api/event-levels      → [{value, label}]
// GET /api/award-categories  → [{value, label}]
// ============================================================
export const getQualifyingExams = async () => {
  return apiFetch("/qualifying-exams");
};

export const getEventLevels = async () => {
  return apiFetch("/event-levels");
};

export const getAwardCategories = async () => {
  return apiFetch("/award-categories");
};

export const getLookupValues = async (lookupKey) => {
  return apiFetch(`/get-lookups/${lookupKey}`);
};

// ============================================================
// STUDENTS (DYNAMIC)
// ============================================================
export const getStudents = async (courseCode = null, admissionYear = null) => {
  const params = new URLSearchParams();
  if (courseCode) params.set("course_code", courseCode);
  if (admissionYear) params.set("admission_year", admissionYear);
  const query = params.toString();
  const url = query ? `/students?${query}` : "/students";
  return apiFetch(url);
};

export const addStudent = async (studentData) => {
  const res = await fetch(`${BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  });
  return res.json();
};

export const uploadStudents = async (formData) => {
  const res = await fetch(`${BASE_URL}/students/upload`, {
    method: "POST",
    credentials: "include",
    body: formData, // do not set content-type for formData
  });
  return res.json();
};

/** Delete all rows in student_lookup (fresh upload). */
export const deleteAllStudents = async () => {
  const res = await fetch(`${BASE_URL}/students/all`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

/** Set admission year on all students that have no year saved yet. */
export const applyAdmissionYearToUntagged = async (admissionYear) => {
  return apiFetch("/students/apply-admission-year", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admission_year: admissionYear }),
  });
};

// ============================================================
// EVIDENCE UPLOAD & EXPORT
// ============================================================
export const uploadEvidence = async (criterion, files, recordId = null) => {
  const formData = new FormData();
  formData.append("criterion", criterion);
  if (recordId) formData.append("record_id", recordId);
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  const res = await fetch(`${BASE_URL}/upload-evidence`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

/** Merge PDF proofs already stored on criterion rows → one PDF for Excel export. */
export const combineRecordProofs = async (criterion) => {
  const res = await fetch(`${BASE_URL}/combine-record-proofs/${criterion}`, {
    method: "POST",
    credentials: "include",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error:
        text?.slice(0, 280) ||
        `Combine request failed (${res.status}). Is the Flask server running?`,
    };
  }
};

export const getExcelExportUrl = (criterion) => {
  return `${BASE_URL}/export-excel/${criterion}`;
};

/** Fetch the saved global proof link for a criterion (1_1, 1_2_1, 1_2_2) */
export const getProofLink = async (criterion) => {
  const res = await fetch(`${BASE_URL}/proof-link/${criterion}`);
  return res.json();
};

/** Save (upsert) the global proof link for a criterion */
export const saveProofLink = async (criterion, link) => {
  const res = await fetch(`${BASE_URL}/proof-link/${criterion}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });
  return res.json();
};

/** Clear saved proof link for a criterion */
export const deleteProofLink = async (criterion) => {
  const res = await fetch(`${BASE_URL}/proof-link/${criterion}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

/** Bulk-add 1.3.3 rows (program once + student names). */
export const bulkAddC133 = async (programName, programCode, studentNames) => {
  const res = await fetch(`${BASE_URL}/records/1_3_3/bulk-add`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ programName, programCode, studentNames }),
  });
  return res.json();
};
