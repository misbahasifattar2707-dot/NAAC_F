// ============================================================
// Criterion2_1_1.jsx — 2.1.1 Enrolment Number
// Programme dropdown: default institute list + API merge + “Add more”
// ============================================================
import { useMemo, useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProgrammes, getRecords, addRecord, deleteRecord, addProgramme } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import {
  ValidationMessageComponent,
  DropdownComponent,
  NumberInputComponent,
  InputComponent,
} from "../../components/forms";
import { programmeDisplayLabel, formatProgrammeOptionLabel } from "../../utils/programmeDisplay";
import { getSessionDept, getSessionProgramCode } from "../../utils/session";

/** Sentinel value for the extra dropdown option (must not match a real programme name). */
const ADD_MORE_VALUE = "__ADD_MORE_PROGRAMME__";

/** Institute programme master list for Criteria 2.1.1 (matches NAAC dropdown data). */
const DEFAULT_CRITERIA211_PROGRAMMES = [
  { code: "515199510", name: "Artificial Intelligence and Data Science" },
  { code: "541861210", name: "Mechanical Engineering" },
  { code: "515124510", name: "Computer Engineering" },
  { code: "515124610", name: "Information Technology" },
  { code: "515119110", name: "Civil Engineering" },
  { code: "515129310", name: "Electrical Engineering" },
  { code: "515137210", name: "Electronics and Telecommunication" },
  { code: "515124110", name: "MCA" },
  { code: "519124510", name: "PG Computer Engineering" },
  { code: "549861210", name: "PG Mechanical Engineering" },
];

function mergeProgrammeLists(defaults, apiList) {
  const byCode = new Map();
  const push = (row) => {
    const c = String(row.code || "").trim();
    if (!c) return;
    byCode.set(c, {
      code: c,
      name: String(row.name || "").trim(),
      department: row.department != null ? String(row.department) : "",
      display_name: row.display_name != null ? String(row.display_name) : "",
    });
  };
  for (const p of defaults || []) push(p);
  for (const p of apiList || []) push(p);
  return Array.from(byCode.values());
}

const emptyRow = () => ({
  programme_name: getSessionDept() || "",
  programme_code: getSessionProgramCode() || "",
  seats_sanctioned: "",
  students_admitted: "",
});

export default function Criterion2_1_1() {
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState(null);

  const [addProgrammeRowIndex, setAddProgrammeRowIndex] = useState(null);
  const [newProgCode, setNewProgCode] = useState("");
  const [newProgName, setNewProgName] = useState("");
  const [savingProgramme, setSavingProgramme] = useState(false);

  const dropdownOptions = useMemo(
    () => [
      ...programmeOptions,
      { code: ADD_MORE_VALUE, name: ADD_MORE_VALUE, _addMore: true },
    ],
    [programmeOptions]
  );
  useEffect(() => {
    Promise.all([getProgrammes(), getRecords("2_1_1")])
      .then(([progs, recs]) => {
        setProgrammeOptions(mergeProgrammeLists(DEFAULT_CRITERIA211_PROGRAMMES, progs));
        setRecords(recs);
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const handleProgrammeChange = (i, val) => {
    if (val === ADD_MORE_VALUE) {
      setAddProgrammeRowIndex(i);
      setNewProgCode("");
      setNewProgName("");
      return;
    }
    const prog = programmeOptions.find(
      (p) => programmeDisplayLabel(p) === val || p.name === val
    );
    const updated = [...rows];
    updated[i] = {
      ...updated[i],
      programme_name: val,
      programme_code: prog ? prog.code : "",
    };
    setRows(updated);
  };

  const handleSaveNewProgramme = async () => {
    const code = newProgCode.trim();
    const name = newProgName.trim();
    if (!code || !name) {
      showAlert("Enter both programme code and programme name.", "danger");
      return;
    }
    setSavingProgramme(true);
    try {
      const res = await addProgramme(code, name);
      if (!res.success) {
        showAlert(res.error || "Could not save programme.", "danger");
        return;
      }
      const p = res.program;
      const row = {
        code: p.code,
        name: p.name,
        department: p.department != null ? String(p.department) : "",
        display_name: p.display_name != null ? String(p.display_name) : "",
      };
      setProgrammeOptions((prev) => {
        if (prev.some((x) => x.code === row.code)) return prev;
        return [...prev, row];
      });
      if (addProgrammeRowIndex != null) {
        const label = programmeDisplayLabel(row);
        const updated = [...rows];
        updated[addProgrammeRowIndex] = {
          ...updated[addProgrammeRowIndex],
          programme_name: label,
          programme_code: p.code,
        };
        setRows(updated);
      }
      setAddProgrammeRowIndex(null);
      showAlert(`Programme "${programmeDisplayLabel(row)}" added and selected for this row.`);
    } finally {
      setSavingProgramme(false);
    }
  };

  const handleSave = async () => {
    for (const r of rows) {
      if (!r.programme_name) return showAlert("Programme Name is required for every row.", "danger");
      if (!r.seats_sanctioned) return showAlert("Sanctioned Seats is required for every row.", "danger");
      if (!r.students_admitted) return showAlert("Students Admitted is required for every row.", "danger");
      if (parseInt(r.students_admitted) > parseInt(r.seats_sanctioned))
        return showAlert(`Students Admitted (${r.students_admitted}) cannot exceed Sanctioned Seats (${r.seats_sanctioned}).`, "danger");
      const result = await addRecord("2_1_1", r);
      if (!result.success) {
        return showAlert(result.error || "Failed to save record. Check all fields.", "danger");
      }
    }
    setRows([emptyRow()]);
    const updated = await getRecords("2_1_1");
    setRecords(Array.isArray(updated) ? updated : []);
    showAlert("Records saved successfully!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_1_1", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showAlert("Record deleted.");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_1_1" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Criteria 2
            </p>
            <h4>2.1.1: Enrolment Number</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => { window.location.href = '/api/export-excel/2_1_1'; }}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">
          {alert && (
            <ValidationMessageComponent
              message={alert.msg}
              type={alert.type}
              onClose={() => setAlert(null)}
              className="mb-3"
            />
          )}

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Programme Records
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay">
                  <div className="spinner-border text-danger"></div>
                </div>
              ) : (
                <>
                  <div className="row g-2 mb-1 d-none d-md-flex">
                    {["Programme (name & code)", "Programme Code", "Seats Sanctioned", "Students Admitted", ""].map((h, i) => (
                      <div key={i} className={i === 0 ? "col-md-4" : i === 4 ? "col-md-1" : "col-md-2"}>
                        <span className="form-label-custom">{h}</span>
                      </div>
                    ))}
                  </div>

                  {rows.map((row, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-end">
                      <div className="col-md-4">
                        <DropdownComponent
                          label=""
                          value={row.programme_name}
                          onChange={(v) => handleProgrammeChange(i, v)}
                          options={dropdownOptions}
                          optionValue={(p) => (p._addMore ? ADD_MORE_VALUE : programmeDisplayLabel(p))}
                          optionLabel={(p) => (p._addMore ? "+ Add more programme…" : formatProgrammeOptionLabel(p))}
                          placeholder="Select programme"
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Code"
                          value={row.programme_code}
                          readOnly
                          title="Auto-filled from programme"
                        />
                      </div>
                      <div className="col-md-2">
                        <NumberInputComponent
                          label=""
                          value={row.seats_sanctioned}
                          onChange={(v) => updateRow(i, "seats_sanctioned", v)}
                          placeholder="Seats"
                          min={0}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <InputComponent
                          label=""
                          value={row.students_admitted}
                          onChange={(v) => updateRow(i, "students_admitted", v)}
                          placeholder="e.g. 60 or 60+3"
                          required
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
                      <i className="bi bi-plus-lg me-1"></i> Add Row
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
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Programme Name</th>
                    <th>Programme Code</th>
                    <th>Seats Sanctioned</th>
                    <th>Students Admitted</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">
                        No records yet.
                      </td>
                    </tr>
                  ) : (
                    records.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-semibold">{row.programme_name}</td>
                        <td>
                          <span className="badge bg-secondary">{row.programme_code}</span>
                        </td>
                        <td>{row.seats_sanctioned}</td>
                        <td>{row.students_admitted}</td>
                        <td className="text-center">
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(row.id)}>
                            <i className="bi bi-trash"></i>
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
          <CriterionProofFileSection criterionKey="2_1_1" />
          <Footer />
      </div>

      {addProgrammeRowIndex != null && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Add programme</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAddProgrammeRowIndex(null)} />
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-3">
                  New programmes are saved to the master list (unique programme code). They appear in this dropdown for everyone.
                </p>
                <div className="mb-3">
                  <label className="form-label-custom">Programme code</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 515124110"
                    value={newProgCode}
                    onChange={(e) => setNewProgCode(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Programme name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Computer Engineering"
                    value={newProgName}
                    onChange={(e) => setNewProgName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddProgrammeRowIndex(null)} disabled={savingProgramme}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger fw-bold px-4" onClick={handleSaveNewProgramme} disabled={savingProgramme}>
                  {savingProgramme ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Saving…
                    </>
                  ) : (
                    "Save & use for this row"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
