// Criterion6_5_3.jsx — 6.5.3 Quality Assurance Initiatives of the Institution
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getAcademicYears, getRecords, addRecord, updateRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";

const emptyForm = () => ({
  year: "",
  conferences_seminars_workshops_on_quality: "",
  academic_administrative_audit_aaa: "",
  participation_in_nirf: "",
  iso_certification: "",
  nba_or_other_certification: "",
  collaborative_quality_initiatives: "",
  orientation_programme_on_quality_issues: "",
});

export default function Criterion6_5_3() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAcademicYears(), getRecords("6_5_3")])
      .then(([years, recs]) => { setYearOptions(years); setRecords(recs); })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };
  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!form.year) return showAlert("Please select the Year.", "danger");
    const result = await addRecord("6_5_3", form);
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm()); showAlert("Record saved!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("6_5_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("6_5_3", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null); showAlert("Record updated!");
  };

  const fields = [
    { key: "conferences_seminars_workshops_on_quality",   label: "Conferences, Seminars, Workshops on Quality Conducted",                                                                     col: "col-md-6" },
    { key: "academic_administrative_audit_aaa",          label: "Academic Administrative Audit (AAA) and Initiation of Follow-up Action",                                                    col: "col-md-6" },
    { key: "participation_in_nirf",                      label: "Participation in NIRF along with Status",                                                                                   col: "col-md-4" },
    { key: "iso_certification",                          label: "ISO Certification — Nature and Validity Period",                                                                             col: "col-md-4" },
    { key: "nba_or_other_certification",                 label: "NBA or any other Certification Received with Program Specifications",                                                        col: "col-md-4" },
    { key: "collaborative_quality_initiatives",          label: "Collaborative Quality Initiatives with other Institution(s)",                                                                col: "col-md-6" },
    { key: "orientation_programme_on_quality_issues",    label: "Orientation Programme on Quality Issues for Teachers and Students (Date From-To)",                                           col: "col-md-6" },
  ];

  return (
    <div className="app-layout">
      <Sidebar activePage="6_5_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 6</p>
            <h4>6.5.3: Quality Assurance Initiatives of the Institution</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("6_5_3"), "_blank")}>
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

          <div className="alert alert-info border-0 shadow-sm mb-4" style={{ borderRadius: 12, background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)" }}>
            <div className="fw-bold mb-2" style={{ fontSize: "0.92rem" }}>
              <i className="bi bi-info-circle-fill me-2 text-info"></i>
              Criteria 6.5.3 Quality assurance initiatives of the institution include:
            </div>
            <ol className="mb-0 text-muted small" style={{ paddingLeft: "1.2rem" }}>
              <li>Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements</li>
              <li>Collaborative quality initiatives with other institution(s)</li>
              <li>Participation in NIRF</li>
              <li>Any other quality audit recognised by state, national or international agencies (ISO Certification, NBA)</li>
            </ol>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Quality Assurance Record
              </h6>
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-2">
                      <label className="form-label-custom">Year <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.year} onChange={e => handleChange("year", e.target.value)}>
                        <option value="">Select Year</option>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {fields.map(f => (
                      <div className={f.col} key={f.key}>
                        <label className="form-label-custom">{f.label}</label>
                        <input type="text" className="form-control" placeholder={`Enter ${f.label.toLowerCase()}`}
                          value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div className="text-end">
                    <button className="btn btn-danger px-5 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Record
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
                    <th>Year</th>
                    <th>Conferences, Seminars, Workshops on Quality</th>
                    <th>Academic Administrative Audit (AAA)</th>
                    <th>Participation in NIRF</th>
                    <th>ISO Certification</th>
                    <th>NBA / Other Certification</th>
                    <th>Collaborative Quality Initiatives</th>
                    <th>Orientation Programme</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700 }}>{row.year}</span></td>
                      <td className="small">{row.conferences_seminars_workshops_on_quality}</td>
                      <td className="small">{row.academic_administrative_audit_aaa}</td>
                      <td className="small">{row.participation_in_nirf}</td>
                      <td className="small">{row.iso_certification}</td>
                      <td className="small">{row.nba_or_other_certification}</td>
                      <td className="small">{row.collaborative_quality_initiatives}</td>
                      <td className="small">{row.orientation_programme_on_quality_issues}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => setEditRecord({ ...row })}><i className="bi bi-pencil-square"></i></button>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
                  <CriterionProofFileSection criterionKey="6_5_3" />
        <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Quality Assurance Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label-custom">Year</label>
                    <select className="form-select" value={editRecord.year}
                      onChange={e => setEditRecord({ ...editRecord, year: e.target.value })}>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  {fields.map(f => (
                    <div className={f.col} key={f.key}>
                      <label className="form-label-custom">{f.label}</label>
                      <input type="text" className="form-control" value={editRecord[f.key] || ""}
                        onChange={e => setEditRecord({ ...editRecord, [f.key]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>Update Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
