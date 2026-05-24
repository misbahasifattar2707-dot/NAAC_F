// ============================================================
// Criterion1_1.jsx — 1.1 Courses Offered
// ALL dropdowns are fetched from apiService (not hardcoded)
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getDepartments, getSemesters, getCoursesBySemester, addCourse,
  getRecords, addRecord, deleteRecord, updateRecord, addLookup,
  getExcelExportUrl,
} from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";

export default function Criterion1_1() {
  // ---- Dropdown state (loaded from API) ----
  const [departments, setDepartments]   = useState([]);
  const [semesters, setSemesters]       = useState([]);
  const [courses, setCourses]           = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ---- Form state ----
  const user = JSON.parse(localStorage.getItem("mettrack_user") || '{}');
  const [selectedDept, setSelectedDept]       = useState("");
  const [programCode, setProgramCode]         = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [year, setYear]                       = useState(() => {
    if (user.academic_year) {
      const start = user.academic_year.split('-')[0];
      return start.length === 4 ? start : "";
    }
    return "";
  });
  const [courseRows, setCourseRows]           = useState([{ courseCode: "", courseName: "" }]);
  const [submitting, setSubmitting]             = useState(false);
  const [records, setRecords]     = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert]         = useState(null);
  // const user = JSON.parse(localStorage.getItem("mettrack_user") || '{}'); // Moved up

  // ---- "Other" inline form state ----
  const [showOtherSem, setShowOtherSem]     = useState(false);
  const [newSemInput, setNewSemInput]       = useState("");
  const [savingSem, setSavingSem]           = useState(false);
  // Per-row "Other Course" inline forms: { [rowIndex]: { show, code, name, saving } }
  const [otherCourse, setOtherCourse]       = useState({});

  // ---- Load dropdowns on mount ----
  useEffect(() => {
    Promise.all([getDepartments(), getSemesters(), getRecords("1_1")])
      .then(([depts, sems, recs]) => {
        setDepartments(depts);
        setSemesters(sems);
        setRecords(recs);
        
        // Auto-select based on user profile
        if (user.department) {
          const d = depts.find(x => x.code === user.department) || depts[0];
          if (d) {
            setSelectedDept(d.code);
            setProgramCode(user.programCode || d.programCode);
          }
        }
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  // ---- When semester changes, load its courses from API ----
  const handleSemesterChange = async (sem) => {
    if (sem === "__ADD_NEW__") {
      setShowOtherSem(true);
      setSelectedSemester("");
      return;
    }
    setShowOtherSem(false);
    setSelectedSemester(sem);
    setCourseRows([{ courseCode: "", courseName: "" }]);
    setOtherCourse({});
    if (sem) {
      const data = await getCoursesBySemester(sem);
      setCourses(data);
    } else {
      setCourses([]);
    }
  };

  // ---- Save a new semester (inline form) ----
  const handleSaveNewSem = async () => {
    const val = newSemInput.trim();
    if (!val) return;
    setSavingSem(true);
    const res = await addLookup('semesters', val);
    if (res.success) {
      const sems = await getSemesters();
      setSemesters(sems);
      setSelectedSemester(val);
      const data = await getCoursesBySemester(val);
      setCourses(data);
      setShowOtherSem(false);
      setNewSemInput("");
    } else {
      showAlert("Could not add semester: " + res.error, "danger");
    }
    setSavingSem(false);
  };

  // ---- When department changes, auto-fill program code ----
  const handleDeptChange = (deptCode) => {
    setSelectedDept(deptCode);
    const dept = departments.find(d => d.code === deptCode);
    setProgramCode(dept ? dept.programCode : "");
  };

  // ---- Course row handlers ----
  const handleCourseCodeChange = (index, code) => {
    if (code === "__ADD_NEW__") {
      setOtherCourse(prev => ({ ...prev, [index]: { show: true, code: "", name: "", saving: false } }));
      return;
    }
    setOtherCourse(prev => { const n = { ...prev }; delete n[index]; return n; });
    const course = courses.find(c => c.code === code);
    const updated = [...courseRows];
    updated[index] = { courseCode: code, courseName: course ? course.name : "" };
    setCourseRows(updated);
  };

  // ---- Save a new course (inline form) for a given row ----
  const handleSaveNewCourse = async (index) => {
    const oc = otherCourse[index] || {};
    if (!oc.code || !oc.name) return;
    const sem = selectedSemester;
    if (!sem) { showAlert("Please select a semester first", "warning"); return; }

    setOtherCourse(prev => ({ ...prev, [index]: { ...prev[index], saving: true } }));
    const res = await addCourse(sem, oc.code.trim().toUpperCase(), oc.name.trim());
    if (res.success) {
      const data = await getCoursesBySemester(sem);
      setCourses(data);
      const updated = [...courseRows];
      updated[index] = { courseCode: res.course.code, courseName: res.course.name };
      setCourseRows(updated);
      setOtherCourse(prev => { const n = { ...prev }; delete n[index]; return n; });
    } else {
      showAlert("Could not add course: " + res.error, "danger");
      setOtherCourse(prev => ({ ...prev, [index]: { ...prev[index], saving: false } }));
    }
  };

  const addCourseRow = () => {
    setCourseRows([...courseRows, { courseCode: "", courseName: "" }]);
  };

  const removeCourseRow = (index) => {
    if (courseRows.length > 1) {
      setCourseRows(courseRows.filter((_, i) => i !== index));
    }
  };

  // ---- Submit form ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDept) return showAlert("Please select a Department / Programme.", "danger");
    if (!selectedSemester) return showAlert("Please select a Semester.", "danger");
    if (!year) return showAlert("Year of Introduction is required.", "danger");
    for (const row of courseRows) {
      if (!row.courseCode) return showAlert("Please select a Course Code for every row.", "danger");
    }
    
    let saved = 0, skipped = 0, errors = [];
    setSubmitting(true);
    try {
    for (const row of courseRows) {
      let data = {
        department:  selectedDept,
        programCode,
        programName: selectedSemester,
        courseCode:  row.courseCode,
        courseName:  row.courseName,
        year,
        academicYear: user.academic_year || "",
      };
      const result = await addRecord("1_1", data);
      if (result.success) {
        setRecords(prev => [...prev, result.data]);
        saved++;
      } else if (result.error && result.error.includes("already exists")) {
        skipped++;
      } else {
        errors.push(result.error || "Unknown error");
      }
    }
    
    // Reset form
    setCourseRows([{ courseCode: "", courseName: "" }]);
    setYear("");
    setOtherCourse({});
    
    if (errors.length > 0) {
      showAlert(`Errors: ${errors.join("; ")}`, "danger");
    } else if (skipped > 0 && saved === 0) {
      showAlert(`All ${skipped} course(s) already exist for ${selectedSemester} — ${year}. No duplicates added.`, "warning");
    } else if (skipped > 0) {
      showAlert(`${saved} record(s) saved. ${skipped} duplicate(s) skipped.`, "info");
    } else {
      showAlert(`${saved} record(s) saved successfully!`, "success");
    }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete single ----
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("1_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };


  // ---- Edit ----
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload = { ...editRecord };
      delete payload.proofFile;
      await updateRecord("1_1", editRecord.id, payload);
      setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...payload, id: editRecord.id } : r));
      setEditRecord(null);
      showAlert("Record updated!", "success");
    } catch (err) {
      showAlert(err.message || "Update failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };


  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };
  
  const handleExportExcel = () => {
      window.open(getExcelExportUrl("1_1"), "_blank");
  };
  const currentAcademicYear = user.academic_year || "";

  const getCourseOptionStatus = (rowIndex, courseCode) => {
    const selectedInOtherRow = courseRows.some(
      (r, i) => i !== rowIndex && r.courseCode === courseCode
    );

    // Check DB-loaded records as well (not just current page row selections).
    // If a course already exists in records, mark it as already added.
    const alreadySaved = records.some((r) => {
      if (r.courseCode !== courseCode) return false;
      const recAcademicYear = r.academicYear || r.academic_year;
      // Prefer current academic year context when available.
      if (currentAcademicYear) return recAcademicYear === currentAcademicYear;
      return true;
    });

    return { selectedInOtherRow, alreadySaved };
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_1" />

      <div className="main-content">
        {/* Header */}
        <header className="page-header">
          <div>
            <h4 className="mb-0 fw-bold text-danger">Criteria 1.1: Curriculum Design</h4>
            <p className="mb-0 text-muted small">1.1 Number of courses offered by the Institution across all programs during the year</p>
          </div>
          <button className="btn btn-success btn-sm" onClick={handleExportExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}
              <button className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          {/* ---- ADD FORM ---- */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Row 1: Dept / Program Code / Semester / Year */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <label className="form-label-custom">Department</label>
                    {loadingDropdowns ? (
                      <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                    ) : (
                      <select
                        className="form-select"
                        value={selectedDept}
                        onChange={e => handleDeptChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Dept</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.code}>{d.code}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="col-md-2">
                    <label className="form-label-custom">Program Code</label>
                    <input
                      type="text" className="form-control bg-light"
                      value={programCode} readOnly
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label-custom">Program Name</label>
                    <select
                      className="form-select"
                      value={selectedSemester}
                      onChange={e => handleSemesterChange(e.target.value)}
                      required={!showOtherSem}
                    >
                      <option value="" disabled>Select Semester</option>
                      {semesters.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                      <option value="__ADD_NEW__">+ Add New Semester...</option>
                    </select>

                    {/* Inline "Add New Semester" form */}
                    {showOtherSem && (
                      <div className="mt-2 p-3 border rounded bg-light">
                        <label className="form-label fw-bold small mb-1">New Semester Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm mb-2"
                          placeholder="e.g. TYMCA-SEM-V"
                          value={newSemInput}
                          onChange={e => setNewSemInput(e.target.value)}
                          autoFocus
                        />
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={handleSaveNewSem}
                            disabled={savingSem || !newSemInput.trim()}
                          >
                            {savingSem ? "Saving..." : "Save Semester"}
                          </button>
                          <button type="button" className="btn btn-sm btn-secondary"
                            onClick={() => { setShowOtherSem(false); setNewSemInput(""); }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label-custom">Year of Introduction</label>
                    <select
                      className="form-select"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Year</option>
                      {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Rows */}
                <div id="course-container">
                  <small className="text-muted d-block mb-2">
                    Labels: <strong>(Selected)</strong> = already chosen in another row,{" "}
                    <strong>(Already Added)</strong> = already saved for this semester/year.
                  </small>
                  {courseRows.map((row, idx) => (
                    <div key={idx}>
                      <div className="row g-3 mb-2">
                        <div className="col-md-5">
                          <select
                            className="form-select"
                            value={row.courseCode}
                            onChange={e => handleCourseCodeChange(idx, e.target.value)}
                            required={!otherCourse[idx]}
                          >
                            <option value="" disabled>
                              {selectedSemester ? "Select Course Code" : "Select a semester first"}
                            </option>
                            {courses.map(c => {
                              const { selectedInOtherRow, alreadySaved } = getCourseOptionStatus(idx, c.code);
                              const isUnavailable = selectedInOtherRow || alreadySaved;
                              let suffix = "";
                              if (selectedInOtherRow) suffix = " (Selected)";
                              else if (alreadySaved) suffix = " (Already Added)";

                              return (
                                <option
                                  key={c.code}
                                  value={c.code}
                                  disabled={isUnavailable}
                                  style={{
                                    color: isUnavailable ? "#9ca3af" : "#111827",
                                    fontWeight: isUnavailable ? 400 : 700
                                  }}
                                >
                                  {c.code} — {c.name}{suffix}
                                </option>
                              );
                            })}
                            <option value="__ADD_NEW__">+ Add New Course...</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <input
                            type="text" className="form-control bg-light"
                            value={row.courseName} readOnly
                            placeholder="Course Name (auto-filled)"
                          />
                        </div>
                        <div className="col-md-1">
                          <button
                            type="button" className="btn btn-outline-danger w-100"
                            onClick={() => removeCourseRow(idx)}
                          >×</button>
                        </div>
                      </div>

                      {/* Inline "Add New Course" form for this row */}
                      {otherCourse[idx] && (
                        <div className="mt-2 mb-2 p-3 border border-primary rounded bg-light">
                          <p className="fw-bold small mb-2 text-primary">Add New Course to "{selectedSemester}"</p>
                          <div className="row g-2">
                            <div className="col-md-3">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Course Code (e.g. 410915)"
                                value={otherCourse[idx].code}
                                onChange={e => setOtherCourse(prev => ({ ...prev, [idx]: { ...prev[idx], code: e.target.value } }))}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Course Name"
                                value={otherCourse[idx].name}
                                onChange={e => setOtherCourse(prev => ({ ...prev, [idx]: { ...prev[idx], name: e.target.value } }))}
                              />
                            </div>
                            <div className="col-md-3 d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-success flex-grow-1"
                                disabled={otherCourse[idx].saving || !otherCourse[idx].code || !otherCourse[idx].name}
                                onClick={() => handleSaveNewCourse(idx)}
                              >
                                {otherCourse[idx].saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => setOtherCourse(prev => { const n = { ...prev }; delete n[idx]; return n; })}
                              >✕</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCourseRow}>
                    + Add Course Row
                  </button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Academic Records"}
                  </button>
                </div>
              </form>
            </div>
          </div>


          {/* ---- TABLE ---- */}
          <div className="table-responsive bg-white shadow-sm p-3 rounded">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>

                  <th>Program Name</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Year of Introduction</th>
                  <th>Academic Year</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.filter(r => {
                  if (!user.academic_year) return true;
                  const startYear = user.academic_year.split('-')[0];
                  return (
                    r.academicYear === user.academic_year ||
                    r.academic_year === user.academic_year ||
                    String(r.year) === startYear
                  );
                }).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <i className="bi bi-folder-x" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}></i>
                      No records found for Academic Year {user.academic_year}.
                    </td>
                  </tr>
                ) : records
                  .filter(r => {
                    if (!user.academic_year) return true;
                    const startYear = user.academic_year.split('-')[0];
                    return (
                      r.academicYear === user.academic_year ||
                      r.academic_year === user.academic_year ||
                      String(r.year) === startYear
                    );
                  })
                  .map((row) => (
                  <tr key={row.id}>

                    <td>{row.programName}</td>
                    <td>{row.courseCode}</td>
                    <td>{row.courseName}</td>
                    <td>{row.year}</td>
                    <td>{row.academicYear || row.year}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setEditRecord({ ...row })}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(row.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CriterionProofFileSection criterionKey="1_1" />
        </div>

        {/* ---- EDIT MODAL ---- */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Edit Record</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  {[
                    { label: "Department",   field: "department" },
                    { label: "Course Code",  field: "courseCode" },
                    { label: "Course Name",  field: "courseName" },
                    { label: "Year",         field: "year" },
                  ].map(({ label, field }) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label fw-bold">{label}</label>
                      <input
                        type="text" className="form-control"
                        value={editRecord[field] || ""}
                        onChange={e => setEditRecord({ ...editRecord, [field]: e.target.value })}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
