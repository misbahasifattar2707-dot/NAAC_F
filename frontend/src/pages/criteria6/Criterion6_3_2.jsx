// Criterion6_3_2.jsx — 6.3.2 Number of teachers provided with financial support
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getAcademicYears, getRecords, addRecord, updateRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";

const emptyForm = () => ({
  year: "", name_of_teacher: "", name_of_conference_workshop: "",
  name_of_professional_body: "", amount_of_support: "",
});

export default function Criterion6_3_2() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAcademicYears(), getRecords("6_3_2")])
      .then(([years, recs]) => { setYearOptions(years); setRecords(recs); })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };
  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { year, name_of_teacher, name_of_conference_workshop, amount_of_support } = form;
    if (!year || !name_of_teacher || !name_of_conference_workshop || !amount_of_support)
      return showAlert("Please fill all required fields.", "danger");
    const result = await addRecord("6_3_2", form);
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm()); showAlert("Record saved!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("6_3_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("6_3_2", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null); showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="6_3_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 6</p>
            <h4>6.3.2: Teachers with Financial Support for Conferences / Workshops</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("6_3_2"), "_blank")}>
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
            <div className="fw-bold mb-1" style={{ fontSize: "0.92rem" }}>
              <i className="bi bi-info-circle-fill me-2 text-info"></i>
              6.3.2 Number of teachers provided with financial support to attend conferences/workshops and towards membership fee of professional bodies during the year
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Financial Support Record
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
                    <div className="col-md-3">
                      <label className="form-label-custom">Name of Teacher <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Full name"
                        value={form.name_of_teacher} onChange={e => handleChange("name_of_teacher", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Name of Conference / Workshop Attended (for which financial support provided) <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Conference or workshop name"
                        value={form.name_of_conference_workshop} onChange={e => handleChange("name_of_conference_workshop", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Name of the Professional Body for which Membership Fee is Provided</label>
                      <input type="text" className="form-control" placeholder="Professional body name"
                        value={form.name_of_professional_body} onChange={e => handleChange("name_of_professional_body", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Amount of Support <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. 1000/-"
                        value={form.amount_of_support} onChange={e => handleChange("amount_of_support", e.target.value)} />
                    </div>
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
                    <th>Name of Teacher</th>
                    <th>Name of Conference/Workshop Attended</th>
                    <th>Professional Body (Membership Fee)</th>
                    <th>Amount of Support</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700 }}>{row.year}</span></td>
                      <td className="fw-semibold">{row.name_of_teacher}</td>
                      <td>{row.name_of_conference_workshop}</td>
                      <td>{row.name_of_professional_body}</td>
                      <td className="fw-bold text-success">{row.amount_of_support}</td>
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
                  <CriterionProofFileSection criterionKey="6_3_2" />
        <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label-custom">Year</label>
                    <select className="form-select" value={editRecord.year} onChange={e => setEditRecord({ ...editRecord, year: e.target.value })}>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Name of Teacher</label>
                    <input type="text" className="form-control" value={editRecord.name_of_teacher}
                      onChange={e => setEditRecord({ ...editRecord, name_of_teacher: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Conference / Workshop</label>
                    <input type="text" className="form-control" value={editRecord.name_of_conference_workshop}
                      onChange={e => setEditRecord({ ...editRecord, name_of_conference_workshop: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Professional Body</label>
                    <input type="text" className="form-control" value={editRecord.name_of_professional_body}
                      onChange={e => setEditRecord({ ...editRecord, name_of_professional_body: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Amount</label>
                    <input type="text" className="form-control" value={editRecord.amount_of_support}
                      onChange={e => setEditRecord({ ...editRecord, amount_of_support: e.target.value })} />
                  </div>
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
