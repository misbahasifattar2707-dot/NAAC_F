// ============================================================
// Criterion2_1_2.jsx — 2.1.2 Seats Filled Against Reserved Seats
// Academic year dropdown fetched from apiService
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import {
  getAcademicYears, getRecords, addRecord, deleteRecord, getExcelExportUrl
} from "../../api/apiService";

const CATS = ["SC", "ST", "OBC", "Gen", "Others"];

const emptyForm = () => ({
  year: "",
  ear_sc: "", ear_st: "", ear_obc: "", ear_gen: "", ear_others: "",
  adm_sc: "", adm_st: "", adm_obc: "", adm_gen: "", adm_others: "",
});

export default function Criterion2_1_2() {
  const [yearOptions, setYearOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    Promise.all([getAcademicYears(), getRecords("2_1_2")])
      .then(([years, recs]) => { setYearOptions(years); setRecords(recs); })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleSave = async () => {
    if (!form.year) return showAlert("Please select an academic year.", "danger");
    const result = await addRecord("2_1_2", form);
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Entry saved successfully!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_1_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const inputStyle = {
    border: "1px solid #dee2e6", borderRadius: 6,
    padding: "5px 6px", fontSize: "0.8rem",
    textAlign: "center", width: "100%", outline: "none"
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_1_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.1.2: Seats Filled Against Reserved Seats</h4>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Exclusive of supernumerary seats</small>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("2_1_2"), "_blank")}>
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

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add New Entry
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay"><div className="spinner-border text-danger"></div></div>
              ) : (
                <>
                  <div className="mb-4" style={{ maxWidth: 220 }}>
                    <label className="form-label-custom">Academic Year</label>
                    <select className="form-select form-select-sm" value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })}>
                      <option value="">Select Year</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  <div className="row g-4">
                    {/* Earmarked */}
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ border: "2px solid #fee2e2", background: "#fff5f5" }}>
                        <p className="fw-bold mb-3" style={{ fontSize: "0.82rem", color: "#b31d1d", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <i className="bi bi-bookmark-fill me-2"></i>Seats Earmarked (GOI/State Rule)
                        </p>
                        <div className="row g-2">
                          {CATS.map(cat => (
                            <div key={cat} className="col">
                              <label className="form-label-custom text-center d-block">{cat}</label>
                              <input type="number" style={inputStyle} placeholder="0"
                                value={form[`ear_${cat.toLowerCase()}`]}
                                onChange={e => setForm({ ...form, [`ear_${cat.toLowerCase()}`]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Admitted */}
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ border: "2px solid #dcfce7", background: "#f0fdf4" }}>
                        <p className="fw-bold mb-3" style={{ fontSize: "0.82rem", color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <i className="bi bi-person-check-fill me-2"></i>Students Admitted from Reserved Category
                        </p>
                        <div className="row g-2">
                          {CATS.map(cat => (
                            <div key={cat} className="col">
                              <label className="form-label-custom text-center d-block">{cat}</label>
                              <input type="number" style={inputStyle} placeholder="0"
                                value={form[`adm_${cat.toLowerCase()}`]}
                                onChange={e => setForm({ ...form, [`adm_${cat.toLowerCase()}`]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                    <button className="btn btn-danger px-4 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Entry
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0 text-center" style={{ fontSize: "0.83rem" }}>
                <thead className="table-dark">
                  <tr>
                    <th rowSpan={2} className="align-middle">Year</th>
                    <th colSpan={5} style={{ background: "#374151" }}>Seats Earmarked (GOI/State)</th>
                    <th colSpan={5} style={{ background: "#4b5563" }}>Students Admitted</th>
                    <th rowSpan={2} className="align-middle">Actions</th>
                  </tr>
                  <tr style={{ background: "#4b5563", color: "#d1d5db" }}>
                    {[...CATS, ...CATS].map((c, i) => <th key={i} style={{ fontSize: "0.72rem" }}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={12} className="text-center text-muted py-5">No records found. Add data above.</td></tr>
                  ) : records.map((row, i) => (
                    <tr key={row.id} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                      <td className="fw-bold">{row.year}</td>
                      {["ear_sc","ear_st","ear_obc","ear_gen","ear_others"].map(k => (
                        <td key={k} style={{ color: "#1d4ed8", fontWeight: 600 }}>{row[k] || 0}</td>
                      ))}
                      {["adm_sc","adm_st","adm_obc","adm_gen","adm_others"].map(k => (
                        <td key={k} style={{ color: "#16a34a", fontWeight: 600 }}>{row[k] || 0}</td>
                      ))}
                      <td>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-light border-top">
              <small className="text-muted">* For Minority Institutions, use the 'Others' column to specify minority status.</small>
            </div>
          </div>
        </div>

          <CriterionProofFileSection criterionKey="2_1_2" />
        <Footer />
      </div>
    </div>
  );
}
