// Criterion6_4_2.jsx — 6.4.2 Funds/Grants received from non-government bodies
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getRecords, addRecord, updateRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";

const emptyForm = () => ({
  year: "",
  name_of_non_government_funding_agencies_individuals: "",
  purpose_of_the_grant: "",
  funds_grants_received_inr_in_lakhs: "",
  link_to_audited_statement: "",
});

export default function Criterion6_4_2() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords("6_4_2").then(setRecords).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };
  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { year, name_of_non_government_funding_agencies_individuals } = form;
    if (!year || !name_of_non_government_funding_agencies_individuals)
      return showAlert("Please fill all required fields.", "danger");
    const result = await addRecord("6_4_2", form);
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm()); showAlert("Record saved!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("6_4_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("6_4_2", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null); showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="6_4_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 6</p>
            <h4>6.4.2: Funds / Grants from Non-Government Bodies</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("6_4_2"), "_blank")}>
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
              6.4.2 Funds / Grants received from non-government bodies, individuals, philanthropers during the year (not covered in Criterion III)
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Funds / Grants Record
              </h6>
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-2">
                      <label className="form-label-custom">Year <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. 2024-25"
                        value={form.year} onChange={e => handleChange("year", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Name of the Non-Government Funding Agencies / Individuals <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Funding agency or individual name"
                        value={form.name_of_non_government_funding_agencies_individuals} onChange={e => handleChange("name_of_non_government_funding_agencies_individuals", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Purpose of the Grant</label>
                      <input type="text" className="form-control" placeholder="Grant purpose"
                        value={form.purpose_of_the_grant} onChange={e => handleChange("purpose_of_the_grant", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Funds / Grants Received (INR in Lakhs)</label>
                      <input type="text" className="form-control" placeholder="Amount in lakhs"
                        value={form.funds_grants_received_inr_in_lakhs} onChange={e => handleChange("funds_grants_received_inr_in_lakhs", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Link to Audited Statement of Accounts Reflecting the Receipts</label>
                      <input type="text" className="form-control" placeholder="URL or document reference"
                        value={form.link_to_audited_statement} onChange={e => handleChange("link_to_audited_statement", e.target.value)} />
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
                    <th>Name of Non-Government Funding Agencies / Individuals</th>
                    <th>Purpose of the Grant</th>
                    <th>Funds / Grants Received (INR in Lakhs)</th>
                    <th>Link to Audited Statement of Accounts Reflecting the Receipts</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700 }}>{row.year}</span></td>
                      <td className="fw-semibold">{row.name_of_non_government_funding_agencies_individuals}</td>
                      <td>{row.purpose_of_the_grant}</td>
                      <td className="fw-bold text-success">{row.funds_grants_received_inr_in_lakhs}</td>
                      <td className="small text-muted">{row.link_to_audited_statement}</td>
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
                  <CriterionProofFileSection criterionKey="6_4_2" />
        <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Funds / Grants Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label-custom">Year</label>
                    <input type="text" className="form-control" value={editRecord.year}
                      onChange={e => setEditRecord({ ...editRecord, year: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Funding Agency / Individual</label>
                    <input type="text" className="form-control" value={editRecord.name_of_non_government_funding_agencies_individuals}
                      onChange={e => setEditRecord({ ...editRecord, name_of_non_government_funding_agencies_individuals: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Purpose of Grant</label>
                    <input type="text" className="form-control" value={editRecord.purpose_of_the_grant}
                      onChange={e => setEditRecord({ ...editRecord, purpose_of_the_grant: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Funds (INR in Lakhs)</label>
                    <input type="text" className="form-control" value={editRecord.funds_grants_received_inr_in_lakhs}
                      onChange={e => setEditRecord({ ...editRecord, funds_grants_received_inr_in_lakhs: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Link to Audited Statement</label>
                    <input type="text" className="form-control" value={editRecord.link_to_audited_statement}
                      onChange={e => setEditRecord({ ...editRecord, link_to_audited_statement: e.target.value })} />
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
