// ============================================================
// Criterion1_2_1.jsx — 1.2.1 CBCS / Elective Course System
// Per-programme entry: Programme Code, Programme Name,
// Year of Introduction, CBCS Status, Year of Implementation
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getDepartments, getRecords, addRecord, deleteRecord, updateRecord,
  getExcelExportUrl
} from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getSessionDept, getSessionProgramCode } from "../../utils/session";

const YEARS = Array.from({ length: 12 }, (_, i) => 2015 + i);   // 2015 – 2026

/** NAAC programme label — degree name (MCA), not semester rows like FYMCA-SEM-I */
const displayProgramName = (row) => {
  const code = String(row?.programCode || "").trim();
  const name = String(row?.programName || row?.program_name || "").trim();
  if (code === "515124110" || /FYMCA|SYMCA/i.test(name)) return "MCA";
  return name;
};

const normalizeRecord = (row) => ({ ...row, programName: displayProgramName(row) });

const emptyRow = () => ({ cbcsStatus: "Yes", yearIntro: "", cbcsYear: "" });

export default function Criterion1_2_1() {
  const [departments, setDepartments] = useState([]);
  const [records, setRecords]         = useState([]);
  const [alert, setAlert]             = useState(null);
  const [editRecord, setEditRecord]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Shared programme (same for all rows in one submission)
  const [progCode, setProgCode] = useState("");
  const [progName, setProgName] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Multi-row form (one row = one programme entry)
  const [rows, setRows] = useState([emptyRow()]);
  useEffect(() => {
    Promise.all([getDepartments(), getRecords("1_2_1")])
      .then(([depts, recs]) => {
        setDepartments(depts);
        setRecords(recs.map(normalizeRecord));

        // Auto-fill from login session
        const sessionDept = getSessionDept();
        const sessionCode = getSessionProgramCode();
        if (sessionDept) {
          const d = depts.find(x => x.code === sessionDept);
          setSelectedDept(sessionDept);
          setProgCode(sessionCode || (d ? d.programCode : ""));
          setProgName(d ? (d.programName || sessionDept) : sessionDept);
        }
      });
  }, []);

  const handleDeptChange = (code) => {
    setSelectedDept(code);
    const dept = departments.find(d => d.code === code);
    if (dept) {
      setProgCode(dept.programCode || "");
      setProgName(dept.programName || (dept.programCode === "515124110" ? "MCA" : code));
    }
  };

  const updateRow = (idx, field, val) => {
    const updated = [...rows];
    updated[idx][field] = val;
    setRows(updated);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (idx) => { if (rows.length > 1) setRows(rows.filter((_, i) => i !== idx)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!progCode) return showAlert("Programme Code is required.", "danger");
    if (!progName) return showAlert("Programme Name is required.", "danger");
    for (const row of rows) {
      if (!row.yearIntro) return showAlert("Year of Introduction is required for every row.", "danger");
      if (row.cbcsStatus === "Yes" && !row.cbcsYear)
        return showAlert("Year of Implementation is required when status is Yes.", "danger");
    }

    let saved = 0;
    setSubmitting(true);
    try {
    for (const row of rows) {
      let payload = {
        programCode: progCode,
        programName: progName,
        department: selectedDept,
        yearIntro: row.yearIntro,
        cbcsStatus: row.cbcsStatus,
        cbcsYear: row.cbcsStatus === "Yes" ? row.cbcsYear : "",
      };
      const result = await addRecord("1_2_1", payload);
      if (result.success) { setRecords(prev => [...prev, normalizeRecord(result.data)]); saved++; }
      else return showAlert(result.error || "Failed to save record.", "danger");
    }
    } catch (err) {
      return showAlert(err.message || "Save failed.", "danger");
    } finally {
      setSubmitting(false);
    }
    setRows([emptyRow()]);
    showAlert(`${saved} record(s) saved successfully!`, "success");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("1_2_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload = { ...editRecord };
      delete payload.proofFile;
      await updateRecord("1_2_1", editRecord.id, payload);
      const fresh = await getRecords("1_2_1");
      setRecords(fresh.map(normalizeRecord));
      setEditRecord(null);
      showAlert("Record updated!", "success");
    } catch (err) {
      showAlert(err.message || "Update failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };
  return (
    <div className="app-layout">
      <Sidebar activePage="1_2_1" />
      <div className="main-content">

        {/* Header */}
        <header className="page-header">
          <div>
            <h4 className="mb-0 fw-bold text-danger">Criteria 1.2.1</h4>
            <p className="mb-0 text-muted small">
              1.2.1 Number of Programmes in which Choice Based Credit System (CBCS)/ elective course system has been implemented
            </p>
          </div>
          <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_2_1"), "_blank")}>
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

          {/* ── ADD FORM ── */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>

                {/* Programme header row */}
                <div className="row g-3 mb-4 border-bottom pb-4">
                  <div className="col-md-3">
                    <label className="form-label-custom">Department</label>
                    <select
                      className="form-select"
                      value={selectedDept}
                      onChange={e => handleDeptChange(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.code}>{d.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Programme Code</label>
                    <input type="text" className="form-control bg-light" value={progCode}
                      onChange={e => setProgCode(e.target.value)} placeholder="e.g. 515124110" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Programme Name</label>
                    <input type="text" className="form-control bg-light" value={progName}
                      onChange={e => setProgName(e.target.value)} placeholder="e.g. MCA" required />
                  </div>
                </div>

                {/* Data rows */}
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "28%" }}>Year of Introduction</th>
                        <th style={{ width: "28%" }}>Status of implementation of CBCS /<br />elective course system (Yes/No)</th>
                        <th style={{ width: "34%" }}>Year of implementation of CBCS /<br />elective course system</th>
                        <th style={{ width: "6%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={row.yearIntro}
                              onChange={e => updateRow(idx, "yearIntro", e.target.value)}
                              required
                            >
                              <option value="" disabled>Select Year</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={row.cbcsStatus}
                              onChange={e => updateRow(idx, "cbcsStatus", e.target.value)}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </td>
                          <td>
                            {row.cbcsStatus === "Yes" ? (
                              <select
                                className="form-select form-select-sm"
                                value={row.cbcsYear}
                                onChange={e => updateRow(idx, "cbcsYear", e.target.value)}
                                required
                              >
                                <option value="" disabled>Select Year</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            ) : (
                              <span className="text-muted small">N/A</span>
                            )}
                          </td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-outline-danger"
                              onClick={() => removeRow(idx)}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow}>
                    + Add Row
                  </button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Records"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── RECORDS TABLE ── */}
          <div className="table-responsive bg-white shadow-sm p-3 rounded mb-4">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Programme Code</th>
                  <th>Programme Name</th>
                  <th>Year of Introduction</th>
                  <th>Status of Implementation (Yes/No)</th>
                  <th>Year of Implementation</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No records yet.</td></tr>
                ) : records.map(row => (
                  <tr key={row.id}>
                    <td><strong>{row.programCode}</strong></td>
                    <td>{displayProgramName(row)}</td>
                    <td>{row.yearIntro}</td>
                    <td>
                      <span className={`badge ${row.cbcsStatus === "Yes" ? "bg-success" : "bg-secondary"}`}>
                        {row.cbcsStatus}
                      </span>
                    </td>
                    <td>{row.cbcsYear || "—"}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setEditRecord({ ...row })}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CriterionProofFileSection criterionKey="1_2_1" />
        </div>

        {/* ── EDIT MODAL ── */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Edit Record</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Programme Code</label>
                    <input type="text" className="form-control" value={editRecord.programCode || ""}
                      onChange={e => setEditRecord({ ...editRecord, programCode: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Programme Name</label>
                    <input type="text" className="form-control" value={editRecord.programName || ""}
                      onChange={e => setEditRecord({ ...editRecord, programName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Year of Introduction</label>
                    <select className="form-select" value={editRecord.yearIntro || ""}
                      onChange={e => setEditRecord({ ...editRecord, yearIntro: e.target.value })}>
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Status of Implementation (Yes/No)</label>
                    <select className="form-select" value={editRecord.cbcsStatus || "Yes"}
                      onChange={e => setEditRecord({ ...editRecord, cbcsStatus: e.target.value })}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  {editRecord.cbcsStatus === "Yes" && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Year of Implementation</label>
                      <select className="form-select" value={editRecord.cbcsYear || ""}
                        onChange={e => setEditRecord({ ...editRecord, cbcsYear: e.target.value })}>
                        <option value="">Select Year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  )}
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
