// ============================================================
// Criterion2_3.jsx — 2.3 Number of Outgoing Students
// Import CSV/Xlsx list; optional single “year of passing” for whole batch.
// ============================================================
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAcademicYears, getRecords, addRecord, updateRecord, deleteRecord, parseOutgoingStudentListFile } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";
import { getSessionYear } from "../../utils/session";

const emptyRow = () => ({ passing_year: getSessionYear(), student_name: "", enrollment_number: "" });

export default function Criterion2_3() {
  const fileInputRef = useRef(null);

  const [yearOptions, setYearOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);

  /** One year applies to every draft row on save (time-saving for whole cohort). */
  const [sameYearForAll, setSameYearForAll] = useState(true);
  const [batchPassingYear, setBatchPassingYear] = useState("");
  const [importingFile, setImportingFile] = useState(false);
  useEffect(() => {
    Promise.all([getAcademicYears(), getRecords("2_3")])
      .then(([years, recs]) => {
        setYearOptions(years);
        setRecords(recs);
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4500);
  };

  const draftHasContent = () =>
    rows.some((r) => r.student_name?.trim() || String(r.enrollment_number || "").trim());

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const clearDraft = () => {
    setRows([emptyRow()]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyBatchYearToEveryRow = () => {
    if (!batchPassingYear.trim()) {
      return showAlert("Choose a year first, then click Apply to all rows.", "warning");
    }
    setRows((prev) => prev.map((r) => ({ ...r, passing_year: batchPassingYear })));
    showAlert(`Year ${batchPassingYear} copied to every draft row.`, "success");
  };

  const passingYearForRow = (row) =>
    sameYearForAll ? batchPassingYear.trim() : (row.passing_year || "").trim();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (draftHasContent()) {
      const ok = window.confirm(
        "Replace the current draft rows with students from this file? (Saved records in the table below are not affected.)"
      );
      if (!ok) return;
    }

    setImportingFile(true);
    try {
      const res = await parseOutgoingStudentListFile(file);
      if (!res.success) {
        showAlert(res.error || "Could not read the file.", "danger");
        return;
      }
      const list = res.students || [];
      if (!list.length) {
        showAlert("No students found in the file.", "warning");
        return;
      }
      const next = list.map((s) => ({
        passing_year: sameYearForAll ? batchPassingYear : "",
        student_name: (s.student_name || "").trim(),
        enrollment_number: String(s.enrollment_number || "").trim(),
      }));
      setRows(next);
      showAlert(`Imported ${next.length} student(s). Set year of passing and click Save Records.`, "success");
    } catch (err) {
      showAlert(err.message || "Upload failed.", "danger");
    } finally {
      setImportingFile(false);
    }
  };

  const handleSave = async () => {
    const pyCommon = batchPassingYear.trim();
    if (sameYearForAll && !pyCommon) {
      return showAlert("Select the year of passing for this batch (same for everyone).", "danger");
    }

    let saved = 0;
    for (const r of rows) {
      const py = passingYearForRow(r);
      const name = (r.student_name || "").trim();
      const en = String(r.enrollment_number || "").trim();
      if (!name && !en) continue;
      if (!py || !name || !en) {
        return showAlert(
          sameYearForAll
            ? "Each imported row needs student name and enrollment number."
            : "Fill year of passing, student name, and enrollment number on every draft row.",
          "danger"
        );
      }
      const result = await addRecord("2_3", {
        passing_year: py,
        student_name: name,
        enrollment_number: en,
      });
      if (result.success) {
        setRecords((prev) => [...prev, result.data]);
        saved++;
      } else {
        return showAlert(result.error || "Save failed.", "danger");
      }
    }

    if (saved === 0) {
      return showAlert("Nothing to save — add rows or import a list.", "warning");
    }

    clearDraft();
    showAlert(`${saved} record(s) saved to the table below.`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_3", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("2_3", editRecord.id, editRecord);
    setRecords((prev) => prev.map((r) => (r.id === editRecord.id ? editRecord : r)));
    setEditRecord(null);
    showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Criteria 2
            </p>
            <h4>2.3: Number of Outgoing Students</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => { window.location.href = '/api/export-excel/2_3'; }}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: 10 }}>
              <i className={`bi ${alert.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
              {alert.msg}
              <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add outgoing students
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay">
                  <div className="spinner-border text-danger"></div>
                </div>
              ) : (
                <>
                  <div className="border rounded p-3 mb-4 bg-light bg-opacity-50" style={{ borderRadius: 12 }}>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-8">
                        <p className="small fw-bold text-uppercase mb-1 text-muted" style={{ letterSpacing: 0.6 }}>
                          Import student list (.csv or .xlsx)
                        </p>
                        <p className="small text-muted mb-2 mb-md-0">
                          File must include columns for <strong>enrollment number</strong> (or Seat No / PRN / Roll No) and{" "}
                          <strong>student name</strong>. Duplicates by enrollment are skipped. Rows appear below as a draft until you save.
                        </p>
                      </div>
                      <div className="col-md-4 text-md-end">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                          className="d-none"
                          onChange={handleImportFile}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm fw-semibold me-2"
                          disabled={importingFile}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {importingFile ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" />
                              Reading…
                            </>
                          ) : (
                            <>
                              <i className="bi bi-upload me-1"></i>
                              Choose file
                            </>
                          )}
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearDraft} disabled={importingFile}>
                          Clear draft
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-4 pb-3 border-bottom align-items-end">
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="c23-same-year"
                          checked={sameYearForAll}
                          onChange={(e) => setSameYearForAll(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold small" htmlFor="c23-same-year">
                          Same year of passing for everyone in this draft (enter once — saves time)
                        </label>
                      </div>
                      <DropdownWithAddMore
                        label={sameYearForAll ? "Year of passing (whole batch)" : "Year of passing (copy to all rows)"}
                        selectClassName="form-select form-select-sm"
                        value={batchPassingYear}
                        onChange={setBatchPassingYear}
                        options={yearOptions.map((y) => ({ value: y, label: y }))}
                        optionValue={(o) => o.value}
                        optionLabel={(o) => o.label}
                        placeholder="Select year"
                        addMoreMode="lookup"
                        lookupKey="academic-years"
                        onAfterAdd={() => getAcademicYears().then((ys) => setYearOptions(ys || []))}
                      />
                    </div>
                    {!sameYearForAll && (
                      <div className="col-md-6">
                        <label className="form-label-custom small text-muted d-block">&nbsp;</label>
                        <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={applyBatchYearToEveryRow}>
                          <i className="bi bi-files me-1"></i>
                          Apply selected year to every draft row
                        </button>
                        <small className="text-muted d-block mt-1">
                          Use per-row years below; this copies the dropdown above into each row.
                        </small>
                      </div>
                    )}
                  </div>

                  <p className="small text-muted mb-2">
                    <i className="bi bi-pencil-square me-1"></i>
                    <strong>Draft</strong> — lines below are not saved until you click Save Records.
                  </p>

                  <div className="row g-2 mb-1 d-none d-md-flex">
                    {!sameYearForAll ? (
                      <>
                        <div className="col-md-3">
                          <span className="form-label-custom">Year of Passing</span>
                        </div>
                        <div className="col-md-4">
                          <span className="form-label-custom">Student Name</span>
                        </div>
                        <div className="col-md-4">
                          <span className="form-label-custom">Enrollment Number</span>
                        </div>
                        <div className="col-md-1"></div>
                      </>
                    ) : (
                      <>
                        <div className="col-md-5">
                          <span className="form-label-custom">Student Name</span>
                        </div>
                        <div className="col-md-6">
                          <span className="form-label-custom">Enrollment Number</span>
                        </div>
                        <div className="col-md-1"></div>
                      </>
                    )}
                  </div>

                  {sameYearForAll && batchPassingYear && (
                    <div className="alert alert-secondary py-2 small mb-2">
                      Saving will assign year <strong>{batchPassingYear}</strong> to each draft student below.
                    </div>
                  )}

                  {rows.map((row, i) => (
                    <div key={`${row.enrollment_number}-${i}`} className="row g-2 mb-2 align-items-center">
                      {!sameYearForAll && (
                        <div className="col-md-3">
                          <DropdownWithAddMore
                            label=""
                            selectClassName="form-select form-select-sm"
                            value={row.passing_year}
                            onChange={(v) => updateRow(i, "passing_year", v)}
                            options={yearOptions.map((y) => ({ value: y, label: y }))}
                            optionValue={(o) => o.value}
                            optionLabel={(o) => o.label}
                            placeholder="Select Year"
                            addMoreMode="lookup"
                            lookupKey="academic-years"
                            onAfterAdd={() => getAcademicYears().then((ys) => setYearOptions(ys || []))}
                          />
                        </div>
                      )}
                      <div className={sameYearForAll ? "col-md-5" : "col-md-4"}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Full Name"
                          value={row.student_name}
                          onChange={(e) => updateRow(i, "student_name", e.target.value)}
                        />
                      </div>
                      <div className={sameYearForAll ? "col-md-6" : "col-md-4"}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Enrollment ID"
                          value={row.enrollment_number}
                          onChange={(e) => updateRow(i, "enrollment_number", e.target.value)}
                        />
                      </div>
                      <div className="col-md-1">
                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => removeRow(i)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
                      <i className="bi bi-plus-lg me-1"></i> Add blank row
                    </button>
                    <button type="button" className="btn btn-danger px-4 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Records
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="card-header bg-white border-bottom py-2">
              <span className="fw-semibold small text-muted text-uppercase" style={{ letterSpacing: 0.05 }}>
                Saved records
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Year of Passing</th>
                    <th>Student Name</th>
                    <th>Enrollment Number</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-5">
                        No saved records yet.
                      </td>
                    </tr>
                  ) : (
                    records.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>
                            {row.passing_year}
                          </span>
                        </td>
                        <td className="fw-semibold">{row.student_name}</td>
                        <td className="text-muted small">{row.enrollment_number}</td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-outline-primary" onClick={() => setEditRecord({ ...row })}>
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(row.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          <CriterionProofFileSection criterionKey="2_3" />
          <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Student Record</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <DropdownWithAddMore
                  label="Year of Passing"
                  selectClassName="form-select"
                  value={editRecord.passing_year}
                  onChange={(v) => setEditRecord({ ...editRecord, passing_year: v })}
                  options={yearOptions.map((y) => ({ value: y, label: y }))}
                  optionValue={(o) => o.value}
                  optionLabel={(o) => o.label}
                  placeholder="Select Year"
                  addMoreMode="lookup"
                  lookupKey="academic-years"
                  onAfterAdd={() => getAcademicYears().then((ys) => setYearOptions(ys || []))}
                />
                <div className="mb-3 mt-3">
                  <label className="form-label-custom">Student Name</label>
                  <input
                    className="form-control"
                    value={editRecord.student_name}
                    onChange={(e) => setEditRecord({ ...editRecord, student_name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Enrollment Number</label>
                  <input
                    className="form-control"
                    value={editRecord.enrollment_number}
                    onChange={(e) => setEditRecord({ ...editRecord, enrollment_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>
                  Update Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
