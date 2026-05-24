// ============================================================
// Criterion2_4_2.jsx — 2.4.2 Teachers with Ph.D./NET/SET
// Qualification dropdown fetched from backend
// ============================================================
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, updateRecord, deleteRecord, getTeachers } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";

const emptyForm = () => ({
  teacher_id: "",
  teacher_name: "",
  qualification: "",
  obtaining_year: "",
  number_of_full_time_teachers: "",
});

export default function Criterion2_4_2() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [qualificationOptions, setQualificationOptions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTeachers = useCallback(() => {
    getTeachers()
      .then((tlist) => setTeachers(Array.isArray(tlist) ? tlist : []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    Promise.allSettled([
      getRecords("2_4_2"),
      getRecords("2_4_2_qualification_options"),
      getTeachers(),
    ]).then(([recsR, optsR, tlistR]) => {
      const recs  = recsR.status  === "fulfilled" ? recsR.value  : [];
      const opts  = optsR.status  === "fulfilled" ? optsR.value  : [];
      const tlist = tlistR.status === "fulfilled" ? tlistR.value : [];
      setRecords(Array.isArray(recs) ? recs : []);
      setQualificationOptions(
        opts && opts.length > 0
          ? opts.map(o => (typeof o === "string" ? o : o.value || o.label))
          : []
      );
      setTeachers(Array.isArray(tlist) ? tlist : []);
    }).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleTeacherSelect = (rawId) => {
    const tid = parseInt(rawId, 10);
    const t = teachers.find(x => x.id === tid);
    setForm(f => ({
      ...f,
      teacher_id: Number.isFinite(tid) ? tid : "",
      teacher_name: t?.name ?? "",
    }));
  };

  const handleSave = async () => {
    const { teacher_name, qualification, obtaining_year, number_of_full_time_teachers } = form;
    if (!teacher_name || !qualification || !obtaining_year || number_of_full_time_teachers === "") {
      return showAlert("Please fill all fields.", "danger");
    }
    const nfte = parseInt(number_of_full_time_teachers, 10);
    if (!Number.isFinite(nfte) || nfte < 0) {
      return showAlert("Enter a valid non-negative number for full-time teachers.", "danger");
    }
    try {
    let payload = {
      teacher_name,
      qualification,
      obtaining_year,
      number_of_full_time_teachers: nfte,
    };
    const result = await addRecord("2_4_2", payload);
    if (result.success) {
      const updated = await getRecords("2_4_2");
      setRecords(Array.isArray(updated) ? updated : []);
      setForm(emptyForm());
      showAlert("Qualification record saved!");
    } else {
      showAlert(result.error || "Could not save.", "danger");
    }
    } catch (err) {
      showAlert(err.message || "Save failed.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_4_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    const nfte = parseInt(editRecord.number_of_full_time_teachers, 10);
    if (!Number.isFinite(nfte) || nfte < 0) {
      return showAlert("Enter a valid non-negative number for full-time teachers.", "danger");
    }
    let payload = {
      qualification: editRecord.qualification,
      obtaining_year: editRecord.obtaining_year,
      number_of_full_time_teachers: nfte,
    };
    const result = await updateRecord("2_4_2", editRecord.id, payload);
    if (result.success && result.data) {
      setRecords(prev => prev.map(r => r.id === editRecord.id ? result.data : r));
      setEditRecord(null);
      showAlert("Record updated!");
    } else {
      showAlert(result.error || "Update failed.", "danger");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_4_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.4.2: Teachers with Ph.D. / NET / SET</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => { window.location.href = '/api/export-excel/2_4_2'; }}>
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
                <i className="bi bi-award me-2 text-danger"></i>Add Teacher Qualification Record
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <DropdownWithAddMore
                      label="Name of Full-time Teacher"
                      selectClassName="form-select"
                      required
                      value={form.teacher_id ? String(form.teacher_id) : ""}
                      onChange={handleTeacherSelect}
                      options={teachers}
                      optionValue={(o) => String(o.id)}
                      optionLabel={(o) => o.name}
                      placeholder="Select teacher…"
                      addMoreMode="teacher"
                      teacherEmitField="id"
                      onAfterAdd={refreshTeachers}
                    />
                  </div>
                  <div className="col-md-2">
                    <DropdownWithAddMore
                      label="Qualification"
                      selectClassName="form-select"
                      value={form.qualification}
                      onChange={(v) => handleChange("qualification", v)}
                      options={qualificationOptions.map((q) => ({ value: q, label: q }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Qualification"
                      addMoreMode="lookup"
                      lookupKey="highest-degrees"
                      onAfterAdd={() =>
                        getRecords("2_4_2_qualification_options").then((opts) =>
                          setQualificationOptions(
                            opts?.length ? opts.map((o) => (typeof o === "string" ? o : o.value || o.label)) : []
                          )
                        )
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Year of Obtaining</label>
                    <input type="text" className="form-control" placeholder="e.g. 2021"
                      value={form.obtaining_year} onChange={e => handleChange("obtaining_year", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Number of full-time teachers</label>
                    <input type="number" className="form-control" min="0"
                      value={form.number_of_full_time_teachers}
                      onChange={e => handleChange("number_of_full_time_teachers", e.target.value)} />
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
                    <th>Teacher Name</th>
                    <th>Qualification</th>
                    <th>Year of Obtaining</th>
                    <th>No. of full-time teachers</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.teacher_name}</td>
                      <td>
                        <span className="badge bg-info text-dark fw-semibold">{row.qualification}</span>
                      </td>
                      <td>{row.obtaining_year}</td>
                      <td className="fw-semibold">{row.number_of_full_time_teachers ?? "—"}</td>
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
          <CriterionProofFileSection criterionKey="2_4_2" />
          <Footer />
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Qualification: {editRecord.teacher_name}</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <DropdownWithAddMore
                    label="Qualification"
                    selectClassName="form-select"
                    value={editRecord.qualification}
                    onChange={(v) => setEditRecord({ ...editRecord, qualification: v })}
                    options={qualificationOptions.map((q) => ({ value: q, label: q }))}
                    optionValue={(o) => o.value}
                    optionLabel={(o) => o.label}
                    placeholder="Select Qualification"
                    addMoreMode="lookup"
                    lookupKey="highest-degrees"
                    onAfterAdd={() =>
                      getRecords("2_4_2_qualification_options").then((opts) =>
                        setQualificationOptions(
                          opts?.length ? opts.map((o) => (typeof o === "string" ? o : o.value || o.label)) : []
                        )
                      )
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Year of Obtaining</label>
                  <input type="text" className="form-control" value={editRecord.obtaining_year}
                    onChange={e => setEditRecord({ ...editRecord, obtaining_year: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Number of full-time teachers</label>
                  <input type="number" className="form-control" min="0"
                    value={editRecord.number_of_full_time_teachers ?? ""}
                    onChange={e =>
                      setEditRecord({ ...editRecord, number_of_full_time_teachers: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
