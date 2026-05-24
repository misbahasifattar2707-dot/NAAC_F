// Criterion6_3_3.jsx — 6.3.3 Number of professional development/administrative training programs
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getRecords, addRecord, updateRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";

const emptyForm = () => ({
  dates_from_to: "", title_of_professional_development_program: "",
  title_of_administrative_training_program: "", no_of_participants: "",
});

export default function Criterion6_3_3() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords("6_3_3").then(setRecords).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };
  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { dates_from_to, no_of_participants } = form;
    if (!dates_from_to || !no_of_participants)
      return showAlert("Please fill all required fields.", "danger");
    const result = await addRecord("6_3_3", form);
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm()); showAlert("Record saved!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("6_3_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("6_3_3", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null); showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="6_3_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 6</p>
            <h4>6.3.3: Professional Development / Administrative Training Programs</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("6_3_3"), "_blank")}>
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
              6.3.3 Number of professional development / administrative training programs organized by the institution for teaching and non-teaching staff during the year
            </div>
            <div className="text-muted small mt-1">
              <strong>Note:</strong> Classify the data and provide during the year
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Training Program Record
              </h6>
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <label className="form-label-custom">Dates (From-to) (DD-MM-YYYY) <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. 3rd to 8th March 2025"
                        value={form.dates_from_to} onChange={e => handleChange("dates_from_to", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Title of the Professional Development Program Organised for Teaching Staff</label>
                      <input type="text" className="form-control" placeholder="Program title for teaching staff"
                        value={form.title_of_professional_development_program} onChange={e => handleChange("title_of_professional_development_program", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Title of the Administrative Training Program Organised for Non-Teaching Staff</label>
                      <input type="text" className="form-control" placeholder="Program title for non-teaching staff"
                        value={form.title_of_administrative_training_program} onChange={e => handleChange("title_of_administrative_training_program", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">No. of Participants <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Number of participants"
                        value={form.no_of_participants} onChange={e => handleChange("no_of_participants", e.target.value)} />
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
                    <th>Dates (From-to) (DD-MM-YYYY)</th>
                    <th>Title of Professional Development Program (Teaching Staff)</th>
                    <th>Title of Administrative Training Program (Non-Teaching Staff)</th>
                    <th>No. of Participants</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.dates_from_to}</td>
                      <td>{row.title_of_professional_development_program}</td>
                      <td>{row.title_of_administrative_training_program}</td>
                      <td><span className="badge bg-primary">{row.no_of_participants}</span></td>
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
                  <CriterionProofFileSection criterionKey="6_3_3" />
        <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Training Program Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label-custom">Dates (From-to)</label>
                    <input type="text" className="form-control" value={editRecord.dates_from_to}
                      onChange={e => setEditRecord({ ...editRecord, dates_from_to: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Professional Development Program (Teaching)</label>
                    <input type="text" className="form-control" value={editRecord.title_of_professional_development_program}
                      onChange={e => setEditRecord({ ...editRecord, title_of_professional_development_program: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Administrative Training Program (Non-Teaching)</label>
                    <input type="text" className="form-control" value={editRecord.title_of_administrative_training_program}
                      onChange={e => setEditRecord({ ...editRecord, title_of_administrative_training_program: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">No. of Participants</label>
                    <input type="text" className="form-control" value={editRecord.no_of_participants}
                      onChange={e => setEditRecord({ ...editRecord, no_of_participants: e.target.value })} />
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
