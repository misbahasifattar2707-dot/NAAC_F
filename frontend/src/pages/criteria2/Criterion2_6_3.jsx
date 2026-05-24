// ============================================================
// Criterion2_6_3.jsx — 2.6.3 Pass Percentage of Students
// Year and program name dropdowns fetched from backend
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAcademicYears, getProgrammes, getRecords, addRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";
import { programmeDisplayLabel } from "../../utils/programmeDisplay";
import { getSessionYear } from "../../utils/session";

const emptyForm = () => ({ year: getSessionYear(), program_code: "", program_name: "", appeared_count: "", passed_count: "" });

export default function Criterion2_6_3() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      getAcademicYears(),
      getProgrammes(),
      getRecords("2_6_3"),
    ]).then(([years, progs, recs]) => {
      setYearOptions(years);
      setProgrammeOptions(progs);
      setRecords(recs);
    }).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // When a programme is selected from dropdown, auto-fill code + name
  const handleProgrammeSelect = (val) => {
    const prog = programmeOptions.find((p) => p.code === val);
    setForm((f) => ({
      ...f,
      program_code: prog ? prog.code : val,
      program_name: prog ? programmeDisplayLabel(prog) : "",
    }));
  };

  const handleSave = async () => {
    const { year, program_code, program_name, appeared_count, passed_count } = form;
    if (!year || !program_code || !program_name || !appeared_count || !passed_count) {
      return showAlert("Please fill all fields.", "danger");
    }
    try {
      const payload = {
        ...form,
        appeared_count: parseInt(appeared_count),
        passed_count: parseInt(passed_count),
      };
      const result = await addRecord("2_6_3", payload);
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Pass percentage record saved!");
    } else {
      showAlert(result.error || "Could not save.", "danger");
    }
    } catch (err) {
      showAlert(err.message || "Save failed.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteRecord("2_6_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const calcPercent = (appeared, passed) => {
    if (!appeared || appeared <= 0) return "0.00%";
    return ((passed || 0) / appeared * 100).toFixed(2) + "%";
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_6_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.6.3: Pass Percentage of Students</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => { window.location.href = '/api/export-excel/2_6_3'; }}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: 10 }}>
              <i className={`bi ${alert.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
              {alert.msg}
              <button className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          {/* Add Form */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-bar-chart me-2 text-danger"></i>Add Pass Percentage Record
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <div className="row g-3 align-items-end">
                  <div className="col-md-2">
                    <DropdownWithAddMore
                      label="Academic Year"
                      selectClassName="form-select"
                      value={form.year}
                      onChange={(v) => handleChange("year", v)}
                      options={yearOptions.map((y) => ({ value: y, label: y }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Year"
                      addMoreMode="lookup"
                      lookupKey="academic-years"
                      onAfterAdd={() =>
                        getAcademicYears().then((ys) => setYearOptions(ys || []))
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <DropdownWithAddMore
                      label="Program"
                      selectClassName="form-select"
                      value={form.program_code}
                      onChange={(v) => handleProgrammeSelect(v)}
                      options={programmeOptions}
                      optionValue={(p) => p.code}
                      optionLabel={(p) => `${p.code} — ${programmeDisplayLabel(p)}`}
                      placeholder="Select Program"
                      addMoreMode="programme"
                      programmeCollectDepartment
                      programmeValueField="code"
                      onAfterAdd={() =>
                        getProgrammes().then((progs) => setProgrammeOptions(progs || []))
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Program Name</label>
                    <input type="text" className="form-control" placeholder="Auto-filled or manual"
                      value={form.program_name} onChange={e => handleChange("program_name", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Appeared</label>
                    <input type="number" className="form-control" min="0"
                      value={form.appeared_count} onChange={e => handleChange("appeared_count", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Passed</label>
                    <input type="number" className="form-control" min="0"
                      value={form.passed_count} onChange={e => handleChange("passed_count", e.target.value)} />
                  </div>
                  <div className="col-md-1">
                    <button className="btn btn-danger w-100 fw-bold" onClick={handleSave}>Add</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Year</th>
                    <th>Code</th>
                    <th>Program Name</th>
                    <th>Appeared</th>
                    <th>Passed</th>
                    <th>Percentage</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td>
                        <span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>
                          {row.year}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{row.program_code}</span>
                      </td>
                      <td className="fw-semibold">{row.program_name}</td>
                      <td>{row.appeared_count}</td>
                      <td>{row.passed_count}</td>
                      <td>
                        <strong className="text-success">{calcPercent(row.appeared_count, row.passed_count)}</strong>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          <CriterionProofFileSection criterionKey="2_6_3" />
          <Footer />
      </div>
    </div>
  );
}
