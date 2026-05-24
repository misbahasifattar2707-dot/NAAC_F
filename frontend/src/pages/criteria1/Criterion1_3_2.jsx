// Criterion 1.3.2 — select course → select students → enter each course code → add rows
import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getDepartments,
  getCourseTypes,
  getRecords,
  addRecord,
  deleteRecord,
  deleteRecordsBulk,
  updateRecord,
  getStudents,
  uploadStudents,
  deleteAllStudents,
  applyAdmissionYearToUntagged,
  getExcelExportUrl,
  getAcademicYears,
} from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";
import { getSessionDept, getSessionProgramCode, getSessionYear } from "../../utils/session";

const emptyCommon = () => ({
  programName: getSessionDept() || "MCA",
  programCode: getSessionProgramCode() || "",
  courseType: "",
  year: getSessionYear(),
});

function recordKey(r) {
  const yr = String(r.year ?? "").trim();
  const yrNorm = /^\d{4}$/.test(yr) ? yr : yr.includes("-") ? yr.split("-")[0] : yr;
  return `${(r.programCode || "").trim()}|${(r.courseCode || "").trim()}|${yrNorm}|${normName(r.studentName || "").toLowerCase()}`;
}

function normName(name) {
  return (name || "").replace(/\s+/g, " ").trim();
}

function studentByName(students, name) {
  const key = normName(name).toLowerCase();
  return students.find((s) => normName(s.name).toLowerCase() === key);
}

function manualCodeFor(manualByName, studentName) {
  const n = normName(studentName);
  return (manualByName[n] ?? manualByName[studentName] ?? "").trim();
}

/** Code typed when selected, or from Excel — auto 310920+ on add if empty. */
function resolveCourseCode(stu, manualByName) {
  if (!stu) return "";
  const manual = manualCodeFor(manualByName, stu.name);
  if (manual) return manual;
  return (stu.course_code || "").trim();
}

function courseCodeWithOffset(base, offset) {
  const s = String(base || "").trim();
  if (!s) return String(310920 + offset);
  const m = s.match(/^(.*?)(\d+)$/);
  if (!m) return offset === 0 ? s : `${s}${offset}`;
  const [, prefix, digits] = m;
  const n = parseInt(digits, 10) + offset;
  return `${prefix}${String(n).padStart(digits.length, "0")}`;
}

function fillMissingCourseCodes(names, students, manualByName, startCode = "310920") {
  const next = { ...manualByName };
  let offset = 0;
  for (const name of names) {
    const stu = studentByName(students, name);
    if (!resolveCourseCode(stu, next)) {
      next[normName(name)] = courseCodeWithOffset(startCode, offset);
      offset += 1;
    }
  }
  return next;
}

export default function Criterion1_3_2() {
  const [departments, setDepartments] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(() => getSessionDept() || "");
  const [courseTypes, setCourseTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [common, setCommon] = useState(emptyCommon());
  const [admissionYear, setAdmissionYear] = useState(getSessionYear() || "");
  const [students, setStudents] = useState([]);
  const [selectedNames, setSelectedNames] = useState(() => new Set());
  const [manualCourseCodes, setManualCourseCodes] = useState({});
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [uploadingStudent, setUploadingStudent] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [yearChoices, setYearChoices] = useState([]);
  const [studentFilter, setStudentFilter] = useState("");

  useEffect(() => {
    getAcademicYears().then((ys) => setYearChoices(ys || []));
  }, []);

  /** Same as Criteria 1.2.1 — program dropdown → numerical programme code from DB */
  const handleProgramChange = (deptCode) => {
    setSelectedProgram(deptCode);
    const dept = departments.find((d) => d.code === deptCode);
    if (dept) {
      setCommon((c) => ({
        ...c,
        programName: dept.programName || deptCode,
        programCode: dept.programCode || "",
      }));
    }
  };

  useEffect(() => {
    Promise.all([getDepartments(), getCourseTypes(), getRecords("1_3_2")]).then(
      ([depts, ct, recs]) => {
        setDepartments(depts || []);
        setCourseTypes(ct || []);
        setRecords(Array.isArray(recs) ? recs : []);
        const sessionDept = getSessionDept();
        const sessionCode = getSessionProgramCode();
        const list = depts || [];
        const pick =
          (sessionDept && list.find((x) => x.code === sessionDept)) ||
          list.find((x) => (x.programName || "").toUpperCase() === "MCA") ||
          list[0];
        if (pick) {
          setSelectedProgram(pick.code);
          setCommon((c) => ({
            ...c,
            programCode: sessionCode || pick.programCode || c.programCode,
            programName: pick.programName || pick.code,
          }));
        }
      },
    );
  }, []);

  const loadStudentsByAdmissionYear = async (year) => {
    const yr = (year || "").trim();
    if (!yr) {
      setStudents([]);
      setSelectedNames(new Set());
      setManualCourseCodes({});
      return;
    }
    const data = await getStudents(null, yr);
    setStudents(data || []);
    setSelectedNames(new Set());
    setManualCourseCodes({});
  };

  useEffect(() => {
    if (admissionYear) loadStudentsByAdmissionYear(admissionYear);
  }, []);

  const filteredStudents = useMemo(() => {
    const q = studentFilter.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [students, studentFilter]);

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCourseTypeChange = (value) => {
    setCommon({ ...common, courseType: value });
    setSelectedNames(new Set());
    setManualCourseCodes({});
  };

  const toggleStudent = (name) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    if (!common.courseType) return showAlert("Select course name first (Step 1).", "warning");
    setSelectedNames(new Set(filteredStudents.map((s) => s.name).filter(Boolean)));
  };

  const clearSelection = () => {
    setSelectedNames(new Set());
    setManualCourseCodes({});
  };

  const setManualCode = (name, code) => {
    setManualCourseCodes((prev) => ({ ...prev, [normName(name)]: code }));
  };

  const reloadRecords = async () => {
    const recs = await getRecords("1_3_2");
    setRecords(Array.isArray(recs) ? recs : []);
  };

  const validateCommon = () => {
    if (!common.programCode) return "Step 1: Select programme name (programme code fills automatically).";
    if (!common.courseType) return "Step 1: Select course name (e.g. PBL-1 or Major Project).";
    if (!common.year) return "Step 1: Year of offering is required.";
    return null;
  };

  const addStudentsByNames = async (names, codesOverride = null) => {
    const err = validateCommon();
    if (err) return showAlert(err, "danger");
    if (!names.length) return showAlert("Select at least one student.", "warning");

    const codes = codesOverride || manualCourseCodes;
    setBulkAdding(true);
    try {
      const existingKeys = new Set(records.map(recordKey));
      let added = 0;
      let skipped = 0;
      let failed = 0;
      let noCode = 0;
      let lastError = "";
      const newRows = [];

      for (const name of names) {
        const sname = normName(name);
        if (!sname) continue;
        const stu = studentByName(students, sname);
        const stuCode = resolveCourseCode(stu, codes);
        if (!stuCode) {
          noCode += 1;
          continue;
        }
        const courseType = (common.courseType || "").trim();
        if (!courseType) {
          return showAlert("Step 1: Select course name first.", "danger");
        }
        const payload = {
          programName: common.programName,
          programCode: common.programCode,
          year: common.year,
          studentName: stu?.name || sname,
          courseType,
          courseCode: stuCode,
        };
        const key = recordKey({
          programCode: payload.programCode,
          courseCode: payload.courseCode,
          year: payload.year,
          studentName: sname,
        });
        if (existingKeys.has(key)) {
          skipped += 1;
          continue;
        }
        const result = await addRecord("1_3_2", payload);
        if (result?.success && result?.data) {
          existingKeys.add(key);
          added += 1;
          newRows.push(result.data);
        } else {
          failed += 1;
          if (result?.error) lastError = result.error;
        }
      }

      await reloadRecords();
      const parts = [`Added ${added}`, `skipped ${skipped} duplicate(s)`];
      if (noCode) parts.push(`${noCode} could not get a course code`);
      if (failed) parts.push(`${failed} failed${lastError ? `: ${lastError}` : ""}`);
      if (added === 0 && skipped > 0 && !failed) {
        parts.push("these students may already be in the table below");
      }
      showAlert(parts.join(", ") + ".", failed || (added === 0 && noCode) ? "warning" : "success");
      if (added > 0) clearSelection();
    } finally {
      setBulkAdding(false);
    }
  };

  const handleAddSelected = async () => {
    if (!admissionYear) return showAlert("Select admission year.", "danger");
    if (!selectedNames.size) return showAlert("Select at least one student.", "warning");
    const names = [...selectedNames].map(normName);
    const codes = fillMissingCourseCodes(names, students, manualCourseCodes);
    setManualCourseCodes(codes);
    await addStudentsByNames(names, codes);
  };

  const handleClearTableRecords = async () => {
    if (!records.length) return showAlert("Table is already empty.", "info");
    if (!window.confirm(`Delete all ${records.length} row(s) from the table below?`)) return;
    const res = await deleteRecordsBulk(
      "1_3_2",
      records.map((r) => r.id).filter(Boolean),
    );
    if (res?.success) {
      setRecords([]);
      showAlert("Table cleared. You can add students again.", "success");
    } else {
      showAlert(res?.error || "Could not clear table.", "danger");
    }
  };

  const handleTagAdmissionYear = async () => {
    if (!admissionYear) return showAlert("Select admission year first.", "warning");
    const res = await applyAdmissionYearToUntagged(admissionYear);
    if (res?.success) {
      showAlert(`Set admission year ${admissionYear} on ${res.updated || 0} student(s).`, "success");
      await loadStudentsByAdmissionYear(admissionYear);
    } else {
      showAlert(res?.message || "Could not update admission year.", "danger");
    }
  };

  const handleClearAllStudents = async () => {
    if (
      !window.confirm(
        "Delete ALL students from the database? You can upload a fresh list after this.",
      )
    ) {
      return;
    }
    const res = await deleteAllStudents();
    if (res?.success) {
      showAlert(res.message || "All students deleted.", "success");
      setStudents([]);
      setSelectedNames(new Set());
      setManualCourseCodes({});
    } else {
      showAlert(res?.message || "Could not delete students.", "danger");
    }
  };

  const handleStudentUpload = async () => {
    if (!studentFile) return showAlert("Please select a CSV/Excel file", "warning");
    setUploadingStudent(true);
    const formData = new FormData();
    formData.append("file", studentFile);
    if (admissionYear) formData.append("default_admission_year", admissionYear);
    const res = await uploadStudents(formData);
    setUploadingStudent(false);
    if (res.success) {
      showAlert(res.message || "Students uploaded.", "success");
      if (admissionYear) await loadStudentsByAdmissionYear(admissionYear);
    } else {
      showAlert("Upload failed: " + (res.message || res.error || "Unknown error"), "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this row?")) return;
    await deleteRecord("1_3_2", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...editRecord };
      delete payload.proofFile;
      await updateRecord("1_3_2", editRecord.id, payload);
      setRecords((prev) =>
        prev.map((r) => (r.id === editRecord.id ? { ...payload, id: editRecord.id } : r)),
      );
      setEditRecord(null);
      showAlert("Updated.", "success");
    } catch (err) {
      showAlert(err.message || "Update failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const step2Ready = Boolean(common.courseType?.trim());

  return (
    <div className="app-layout">
      <Sidebar activePage="1_3_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <h4 className="mb-0">1.3.2 Experiential Learning through Projects</h4>
            <p className="mb-0 text-muted small">
              1) Select course name → 2) Tick students → 3) Enter each student&apos;s course code → 4) Add to table
            </p>
          </div>
          <button
            className="btn btn-success btn-sm"
            onClick={() => window.open(getExcelExportUrl("1_3_2"), "_blank")}
          >
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 bg-light rounded">
              <h6 className="fw-bold text-dark mb-2">
                <span className="badge bg-secondary me-2">Upload</span>
                Student list (names only is enough)
              </h6>
              <p className="text-muted small mb-3">
                Minimum columns: <strong>Name</strong> and optional <strong>Admission Year</strong> (or pick year
                before upload). <strong>Enrollment</strong> is optional. Course codes are entered in Step 2.
              </p>
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setStudentFile(e.target.files[0])}
                  />
                </div>
                <div className="col-md-7 d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleStudentUpload}
                    disabled={uploadingStudent}
                  >
                    {uploadingStudent ? "Uploading…" : "Upload Students"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleClearAllStudents}
                  >
                    Delete all students
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 border-primary border-2">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">
                <span className="badge bg-primary me-2">Step 1</span>
                Course name &amp; common fields (same for every student in this batch)
              </h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-bold small">Programme Name *</label>
                  <select
                    className="form-select"
                    value={selectedProgram}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select programme
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.programName || d.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold small">Programme Code</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={common.programCode}
                    readOnly
                    placeholder="e.g. 515124110"
                  />
                </div>
                <div className="col-md-3">
                  <DropdownWithAddMore
                    label="Course name *"
                    selectClassName="form-select"
                    value={common.courseType}
                    onChange={handleCourseTypeChange}
                    options={courseTypes}
                    optionValue={(ct) => ct.value}
                    optionLabel={(ct) => ct.label}
                    placeholder="PBL-1 / Major Project"
                    required
                    addMoreMode="lookup"
                    lookupKey="course-types"
                    onAfterAdd={() => getCourseTypes().then((ct) => setCourseTypes(ct || []))}
                  />
                </div>
                <div className="col-md-3">
                  <DropdownWithAddMore
                    label="Year of Offering *"
                    selectClassName="form-select"
                    value={common.year}
                    onChange={(v) => setCommon({ ...common, year: v })}
                    options={yearChoices.map((y) => ({ value: y, label: y }))}
                    optionValue={(o) => o.value}
                    optionLabel={(o) => o.label}
                    placeholder="2024-25"
                    required
                    addMoreMode="lookup"
                    lookupKey="academic-years"
                    onAfterAdd={() => getAcademicYears().then((ys) => setYearChoices(ys || []))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`card border-0 shadow-sm mb-4 ${!step2Ready ? "opacity-50" : ""}`}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">
                <span className="badge bg-success me-2">Step 2</span>
                Select students for <strong>{common.courseType || "—"}</strong> and enter each course code
              </h6>
              {!step2Ready ? (
                <p className="text-warning mb-0">Choose course name in Step 1 first.</p>
              ) : (
                <>
                  <p className="text-muted small mb-3">
                    Tick students, then click Add. Course codes fill automatically (310920, 310921…) or type your
                    own in the box.
                  </p>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <DropdownWithAddMore
                        label="Admission year"
                        selectClassName="form-select"
                        value={admissionYear}
                        onChange={async (v) => {
                          setAdmissionYear(v);
                          await loadStudentsByAdmissionYear(v);
                        }}
                        options={yearChoices.map((y) => ({ value: y, label: y }))}
                        optionValue={(o) => o.value}
                        optionLabel={(o) => o.label}
                        placeholder="2024-25"
                        addMoreMode="lookup"
                        lookupKey="academic-years"
                        onAfterAdd={() => getAcademicYears().then((ys) => setYearChoices(ys || []))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Search name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search…"
                        value={studentFilter}
                        onChange={(e) => setStudentFilter(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end gap-2">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={selectAllVisible}>
                        Select all
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearSelection}>
                        Clear
                      </button>
                    </div>
                  </div>

                  <p className="small mb-2">
                    Selected: <strong>{selectedNames.size}</strong>
                  </p>

                  <div className="border rounded mb-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
                    <div className="d-flex gap-2 py-2 px-2 border-bottom bg-light small fw-bold text-muted">
                      <span style={{ width: "1.5rem" }}></span>
                      <span className="flex-grow-1">Student name</span>
                      <span style={{ width: "8rem" }}>Course code *</span>
                    </div>
                    {!admissionYear ? (
                      <p className="text-muted small p-3 mb-0">Select admission year.</p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="text-muted small p-3 mb-0">Upload students first.</p>
                    ) : (
                      filteredStudents.map((s) => {
                        const isSelected = selectedNames.has(s.name);
                        const code = resolveCourseCode(s, manualCourseCodes);
                        return (
                          <div
                            key={s.id || s.name}
                            className={`d-flex align-items-center gap-2 py-2 px-2 border-bottom ${isSelected ? "bg-primary bg-opacity-10" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudent(s.name)}
                            />
                            <span className="flex-grow-1">{s.name}</span>
                            <input
                              type="text"
                              className={`form-control form-control-sm ${isSelected && !code ? "border-danger" : ""}`}
                              style={{ width: "8rem" }}
                              placeholder={isSelected ? "Required" : ""}
                              disabled={!isSelected}
                              value={
                              isSelected
                                ? manualCodeFor(manualCourseCodes, s.name) || s.course_code || ""
                                : ""
                            }
                              onChange={(e) => setManualCode(s.name, e.target.value)}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="text-end d-flex flex-wrap gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-success px-5 fw-bold"
                      disabled={bulkAdding || !selectedNames.size}
                      onClick={handleAddSelected}
                    >
                      {bulkAdding
                        ? "Adding…"
                        : `Add ${selectedNames.size || ""} to table below`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <h6 className="fw-bold px-4 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>
                  <span className="badge bg-dark me-2">Table</span>
                  Added records ({records.length})
                </span>
                {records.length > 0 ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleClearTableRecords}
                  >
                    Clear table
                  </button>
                ) : null}
              </h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Program</th>
                      <th>P.Code</th>
                      <th>Course</th>
                      <th>C.Code</th>
                      <th>Year</th>
                      <th>Student</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No rows yet. Complete Steps 1–3 above.
                        </td>
                      </tr>
                    ) : (
                      records.map((row) => (
                        <tr key={row.id}>
                          <td>{row.programName}</td>
                          <td>
                            <span className="badge bg-secondary">{row.programCode}</span>
                          </td>
                          <td>{row.courseType}</td>
                          <td>
                            <code>{row.courseCode}</code>
                          </td>
                          <td>{row.year}</td>
                          <td>
                            <strong>{row.studentName}</strong>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setEditRecord({ ...row })}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(row.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <CriterionProofFileSection criterionKey="1_3_2" />

          {editRecord && (
            <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg">
                <form onSubmit={handleEdit} className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Edit: {editRecord.studentName}</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setEditRecord(null)}
                    ></button>
                  </div>
                  <div className="modal-body row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Course code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editRecord.courseCode || ""}
                        onChange={(e) => setEditRecord({ ...editRecord, courseCode: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Student name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editRecord.studentName || ""}
                        onChange={(e) => setEditRecord({ ...editRecord, studentName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}
