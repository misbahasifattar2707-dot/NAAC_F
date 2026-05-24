// ============================================================
// Criterion1_3_3.jsx — 1.3.3 Students undertaking project/internship
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { getRecords, addRecord, deleteRecord, updateRecord, getExcelExportUrl, uploadEvidence } from "../../api/apiService";

import DynamicStudentSelect from "../../components/DynamicStudentSelect";

const emptyForm = {
  programName: "MCA", programCode: "515124110",
  selectedStudents: [], isSelectAll: false, docLink: "", pdfPath: null
};

export default function Criterion1_3_3() {
  const [records, setRecords]       = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert]           = useState(null);
  
  const [studentClass, setStudentClass] = useState("");
  const [proofFiles, setProofFiles] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    getRecords("1_3_3").then(setRecords);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form, 
      select_all: form.isSelectAll,
      student_list: form.isSelectAll ? "" : form.selectedStudents.join(", "),
    };
    const result = await addRecord("1_3_3", payload);
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm); }
    showAlert("Student record added!", "success");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("1_3_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateRecord("1_3_3", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!", "success");
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleProofUpload = async () => {
    if (!proofFiles || proofFiles.length === 0) return showAlert("Please select files first.", "warning");
    setUploadingProof(true);
    const res = await uploadEvidence("1_3_3", proofFiles);
    setUploadingProof(false);
    if (res.success) {
        setForm({ ...form, docLink: res.link, pdfPath: res.link });
        showAlert("Proof files uploaded and combined into PDF successfully!", "success");
    } else {
        showAlert("Upload failed: " + res.error, "danger");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_3_3" />
      <div className="main-content">
        <header className="page-header">
          <h4>1.3.3 Students undertaking project work / field work / internships</h4>
          <div className="btn-group">
            <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_3_3"), "_blank")}>
              <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
            </button>
          </div>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          {/* Form */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label-custom">Programme Name</label>
                    <input type="text" className="form-control" value={form.programName} readOnly />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Program Code</label>
                    <input type="text" className="form-control" value={form.programCode} readOnly />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Student Class Filter</label>
                    <select className="form-select" value={studentClass} onChange={e => setStudentClass(e.target.value)}>
                      <option value="">All</option>
                      <option value="310920">FYMCA</option>
                      <option value="410912">SYMCA</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-custom">Students (Multi-Select)</label>
                    <DynamicStudentSelect 
                      selectedStudents={form.selectedStudents} 
                      onChange={(students, isAll) => setForm({ ...form, selectedStudents: students, isSelectAll: isAll })}
                      courseCode={studentClass}
                      defaultProgramCode={form.programCode}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-custom">Document Link (Drive/URL)</label>
                    <input
                      type="url" className="form-control"
                      placeholder="https://drive.google.com/..."
                      value={form.docLink}
                      onChange={e => setForm({ ...form, docLink: e.target.value })}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label-custom" style={{ color: "#dc3545" }}>Upload Document (PDF)</label>
                    <div className="input-group">
                      <input type="file" className="form-control" multiple accept="image/*,.pdf"
                        onChange={e => setProofFiles(e.target.files)} />
                      <button type="button" className="btn btn-outline-danger" onClick={handleProofUpload} disabled={uploadingProof}>
                        {uploadingProof ? "Merging..." : "Merge & Get Link"}
                      </button>
                    </div>
                  </div>
                  <div className="col-12 text-end mt-4">
                    <button type="submit" className="btn btn-success px-5 fw-bold">
                      Add Student Record
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive bg-white shadow-sm rounded">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>PROGRAM</th>
                  <th>P.CODE</th>
                  <th>STUDENT NAME</th>
                  <th>EVIDENCE</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <i className="bi bi-folder-x" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}></i>
                      No records yet. Add student records using the form above.
                    </td>
                  </tr>
                ) : records.map(row => (
                  <tr key={row.id}>
                    <td>{row.programName}</td>
                    <td><span className="badge bg-secondary">{row.programCode}</span></td>
                    <td className="fw-bold">{row.student_list || row.studentName}</td>
                    <td>
                      <div className="btn-group">
                        {row.docLink && (
                          <a href={row.docLink} target="_blank" className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-link-45deg"></i> Link
                          </a>
                        )}
                        {row.pdfPath && (
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-file-pdf"></i> PDF
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setEditRecord({ ...row })}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(row.id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Edit Record</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Student List</label>
                    <input
                      type="text" className="form-control"
                      value={editRecord.student_list || editRecord.studentName || ""}
                      onChange={e => setEditRecord({ ...editRecord, student_list: e.target.value })} required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Document Link</label>
                    <input
                      type="url" className="form-control"
                      value={editRecord.docLink || ""}
                      onChange={e => setEditRecord({ ...editRecord, docLink: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Update PDF Evidence (Optional)</label>
                    <input type="file" className="form-control" accept=".pdf" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Record</button>
                </div>
              </form>
            </div>
          </div>
        )}

                  <CriterionProofFileSection criterionKey="1_3_3" />
        <Footer />
      </div>
    </div>
  );
}
