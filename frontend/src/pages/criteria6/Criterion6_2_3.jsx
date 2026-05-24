// ============================================================
// Criterion6_2_3.jsx — 6.2.3 Implementation of e-governance
// Areas: Administration, Finance & Accounts, Student Admission & Support, Examination
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getRecords, addRecord, updateRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";

const AREAS = ["Administration", "Finance and Accounts", "Student Admission and Support", "Examination"];

const emptyForm = () => ({
  areas_of_e_governance: "",
  name_of_vendor_with_contact_details: "",
  year_of_implementation: "",
});

export default function Criterion6_2_3() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords("6_2_3").then(setRecords).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { areas_of_e_governance, name_of_vendor_with_contact_details, year_of_implementation } = form;
    if (!areas_of_e_governance || !name_of_vendor_with_contact_details || !year_of_implementation) {
      return showAlert("Please fill all fields.", "danger");
    }
    const result = await addRecord("6_2_3", form);
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Record saved successfully!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("6_2_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("6_2_3", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="6_2_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 6</p>
            <h4>6.2.3: Implementation of e-governance in areas of operation</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => window.open(getExcelExportUrl("6_2_3"), "_blank")}>
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

          {/* Info Banner */}
          <div className="alert alert-info border-0 shadow-sm mb-4" style={{ borderRadius: 12, background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)" }}>
            <div className="fw-bold mb-1" style={{ fontSize: "0.92rem" }}>
              <i className="bi bi-info-circle-fill me-2 text-info"></i>
              6.2.3 Implementation of e-governance in areas of operation
            </div>
            <div className="text-muted" style={{ fontSize: "0.84rem" }}>
              1. Administration, 2. Finance and Accounts, 3. Student Admission and Support, 4. Examination
            </div>
          </div>

          {/* Add Form */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add e-Governance Record
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label-custom">Areas of e-Governance</label>
                    <select className="form-select" value={form.areas_of_e_governance} onChange={e => handleChange("areas_of_e_governance", e.target.value)}>
                      <option value="">Select Area</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label-custom">Name of the Vendor with Contact Details</label>
                    <input type="text" className="form-control" placeholder="Vendor name and contact"
                      value={form.name_of_vendor_with_contact_details} onChange={e => handleChange("name_of_vendor_with_contact_details", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Year of Implementation</label>
                    <input type="text" className="form-control" placeholder="e.g. 2022-23"
                      value={form.year_of_implementation} onChange={e => handleChange("year_of_implementation", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-danger w-100 fw-bold" onClick={handleSave}>
                      <i className="bi bi-plus-circle me-1"></i> Add Record
                    </button>
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
                    <th>#</th>
                    <th>Areas of e-Governance</th>
                    <th>Name of the Vendor with Contact Details</th>
                    <th>Year of Implementation</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td className="fw-semibold">{row.areas_of_e_governance}</td>
                      <td>{row.name_of_vendor_with_contact_details}</td>
                      <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>{row.year_of_implementation}</span></td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => setEditRecord({ ...row })}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(row.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
                  <CriterionProofFileSection criterionKey="6_2_3" />
        <Footer />
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit e-Governance Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label-custom">Areas of e-Governance</label>
                    <select className="form-select" value={editRecord.areas_of_e_governance}
                      onChange={e => setEditRecord({ ...editRecord, areas_of_e_governance: e.target.value })}>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label-custom">Vendor with Contact Details</label>
                    <input type="text" className="form-control" value={editRecord.name_of_vendor_with_contact_details}
                      onChange={e => setEditRecord({ ...editRecord, name_of_vendor_with_contact_details: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Year of Implementation</label>
                    <input type="text" className="form-control" value={editRecord.year_of_implementation}
                      onChange={e => setEditRecord({ ...editRecord, year_of_implementation: e.target.value })} />
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
