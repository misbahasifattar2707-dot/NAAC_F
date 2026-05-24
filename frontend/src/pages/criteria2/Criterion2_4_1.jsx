// ============================================================
// Criterion2_4_1.jsx — 2.4.1 List of Full-time Teachers
// Teachers from teacher_lookup dropdown; designation from lookups (+ Add more);
// Department from login session; still serving Yes/No + optional last year.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, updateRecord, deleteRecord, getTeachers, getLookupValues } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";

const emptyForm = () => ({
  teacher_id: "",
  name: "",
  pan: "",
  designation: "",
  year: "",
  nature: "",
  experience: "",
  still_serving: "Yes",
  last_year_of_service: "",
});

export default function Criterion2_4_1() {
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [natureOptions, setNatureOptions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [designationOpts, setDesignationOpts] = useState([]);
  const [loginDept, setLoginDept] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("mettrack_user") || "{}");
      setLoginDept(String(u.department || u.program || "").trim());
    } catch {
      setLoginDept("");
    }
  }, []);

  const refreshTeachers = useCallback(() => {
    getTeachers()
      .then((tlist) => setTeachers(Array.isArray(tlist) ? tlist : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.allSettled([
      getRecords("2_4_1"),
      getRecords("2_4_1_nature_options"),
      getTeachers(),
      getLookupValues("designations"),
    ])
      .then(([recsR, optsR, tlistR, desigsR]) => {
        const recs   = recsR.status   === "fulfilled" ? recsR.value   : [];
        const opts   = optsR.status   === "fulfilled" ? optsR.value   : [];
        const tlist  = tlistR.status  === "fulfilled" ? tlistR.value  : [];
        const desigs = desigsR.status === "fulfilled" ? desigsR.value : [];
        setRecords(Array.isArray(recs) ? recs : []);
        setNatureOptions(
          opts && opts.length > 0
            ? opts.map((o) => (typeof o === "string" ? o : o.value || o.label))
            : []
        );
        setTeachers(Array.isArray(tlist) ? tlist : []);
        setDesignationOpts(Array.isArray(desigs) ? desigs : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleTeacherChangeAdd = async (rawId) => {
    const tid = rawId ? parseInt(rawId, 10) : NaN;
    let list = teachers;
    let t = list.find((x) => x.id === tid);
    if ((!t || !t.name) && Number.isFinite(tid)) {
      list = await getTeachers();
      setTeachers(Array.isArray(list) ? list : []);
      t = list.find((x) => x.id === tid);
    }
    setForm((prev) => ({
      ...prev,
      teacher_id: Number.isFinite(tid) ? tid : "",
      name: t?.name ?? "",
      pan: t?.pan ?? "",
      designation: t?.designation ? t.designation : prev.designation,
    }));
  };

  const handleTeacherChangeEdit = async (rawId) => {
    const tid = rawId ? parseInt(rawId, 10) : NaN;
    let list = teachers;
    let t = list.find((x) => x.id === tid);
    if ((!t || !t.name) && Number.isFinite(tid)) {
      list = await getTeachers();
      setTeachers(Array.isArray(list) ? list : []);
      t = list.find((x) => x.id === tid);
    }
    setEditRecord((prev) =>
      prev
        ? {
            ...prev,
            teacher_id: Number.isFinite(tid) ? tid : "",
            name: t?.name ?? "",
            pan: t?.pan ?? "",
            designation: t?.designation ? t.designation : prev.designation,
          }
        : prev
    );
  };

  const buildPayload = (src) => ({
    teacher_id: src.teacher_id,
    department: loginDept,
    pan: src.pan,
    designation: src.designation,
    year: src.year,
    nature: src.nature,
    experience:
      typeof src.experience === "number"
        ? src.experience
        : parseFloat(String(src.experience || "").replace(",", ".")),
    is_still_serving: src.still_serving === "Yes",
    last_year_of_service:
      src.still_serving === "No" && src.last_year_of_service !== ""
        ? parseInt(src.last_year_of_service, 10)
        : null,
  });

  const handleSave = async () => {
    const { teacher_id, pan, designation, year, nature, experience, still_serving, last_year_of_service } =
      form;
    if (!loginDept) {
      return showAlert(
        "Department/programme is missing. Please log in again.",
        "danger"
      );
    }
    if (!teacher_id) return showAlert("Select a teacher from the list.", "danger");
    if (!pan?.trim() || !designation?.trim() || !year || !nature || experience === "") {
      return showAlert("Please fill all required fields.", "danger");
    }
    if (still_serving === "No") {
      const ly = parseInt(last_year_of_service, 10);
      if (!Number.isFinite(ly)) {
        return showAlert(
          "Enter the last year of service when the answer is No.",
          "danger"
        );
      }
    }
    const payload = buildPayload(form);
    if (!Number.isFinite(payload.experience)) {
      return showAlert("Enter a valid number for experience.", "danger");
    }
    const result = await addRecord("2_4_1", payload);
    if (result.success) {
      setRecords((prev) => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Teacher record saved!");
    } else {
      showAlert(result.error || "Could not save.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_4_1", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    if (!loginDept) {
      return showAlert(
        "Department/programme is missing. Please log in again.",
        "danger"
      );
    }
    if (!editRecord.teacher_id) {
      return showAlert("Select a teacher.", "danger");
    }
    if (
      editRecord.still_serving === "No" &&
      editRecord.last_year_of_service === ""
    ) {
      return showAlert("Enter the last year of service when the answer is No.", "danger");
    }
    const payload = buildPayload(editRecord);
    if (!Number.isFinite(payload.experience)) {
      return showAlert("Enter a valid number for experience.", "danger");
    }
    const result = await updateRecord("2_4_1", editRecord.id, payload);
    if (result.success && result.data) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editRecord.id ? result.data : r))
      );
      setEditRecord(null);
      showAlert("Record updated!");
    } else {
      showAlert(result.error || "Update failed.", "danger");
    }
  };

  const openEdit = (row) => {
    setEditRecord({
      ...row,
      still_serving: row.still_serving === "No" ? "No" : "Yes",
      last_year_of_service:
        row.last_year_of_service != null ? String(row.last_year_of_service) : "",
      teacher_id: row.teacher_id ?? "",
      experience:
        row.experience != null && row.experience !== ""
          ? row.experience
          : "",
    });
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_4_1" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p
              className="text-muted mb-0"
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Criteria 2
            </p>
            <h4>2.4.1: List of Full-time Teachers</h4>
          </div>
          <button
            className="btn btn-success btn-sm fw-semibold"
            onClick={() => { window.location.href = '/api/export-excel/2_4_1'; }}
          >
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">
          {alert && (
            <div
              className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 shadow-sm`}
              style={{ borderRadius: 10 }}
            >
              <i
                className={`bi ${alert.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
              ></i>
              {alert.msg}
              <button className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}
              >
                <i className="bi bi-person-plus me-2 text-danger"></i>Add Full-time Teacher
              </h6>
              <div className="mb-3 small text-muted">
                <strong>Name of department:</strong>{" "}
                <span className="text-dark fw-semibold">{loginDept || "—"}</span>
                <span className="ms-2">
                  (from your login / programme selection)
                </span>
              </div>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger"></div>
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-md-4">
                    <DropdownWithAddMore
                      label="Name of Teacher"
                      selectClassName="form-select"
                      required
                      value={form.teacher_id ? String(form.teacher_id) : ""}
                      onChange={handleTeacherChangeAdd}
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
                    <label className="form-label-custom">PAN</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ABCDE1234F"
                      value={form.pan}
                      onChange={(e) => handleChange("pan", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <DropdownWithAddMore
                      label="Designation"
                      selectClassName="form-select"
                      required
                      value={form.designation}
                      onChange={(v) => handleChange("designation", v)}
                      options={designationOpts}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label ?? o.value}
                      placeholder="Select designation…"
                      addMoreMode="lookup"
                      lookupKey="designations"
                      onAfterAdd={() =>
                        getLookupValues("designations").then((d) =>
                          setDesignationOpts(Array.isArray(d) ? d : [])
                        )
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Year of appointment</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="2024"
                      value={form.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <DropdownWithAddMore
                      label="Nature of Appointment"
                      selectClassName="form-select"
                      value={form.nature}
                      onChange={(v) => handleChange("nature", v)}
                      options={natureOptions.map((n) => ({ value: n, label: n }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Nature"
                      addMoreMode="lookup"
                      lookupKey="appointment-types"
                      onAfterAdd={() =>
                        getRecords("2_4_1_nature_options").then((opts) =>
                          setNatureOptions(
                            opts?.length
                              ? opts.map((o) =>
                                  typeof o === "string" ? o : o.value || o.label
                                )
                              : []
                          )
                        )
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">
                      Total years of experience in the same institution
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="e.g. 18"
                      value={form.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">
                      Is the teacher still serving the institution?
                    </label>
                    <select
                      className="form-select"
                      value={form.still_serving}
                      onChange={(e) =>
                        handleChange("still_serving", e.target.value)
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  {form.still_serving === "No" && (
                    <div className="col-md-3">
                      <label className="form-label-custom">
                        If not — last year of service
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 2024"
                        value={form.last_year_of_service}
                        onChange={(e) =>
                          handleChange("last_year_of_service", e.target.value)
                        }
                      />
                    </div>
                  )}
                  <div className="col-12 text-end">
                    <button className="btn btn-danger px-5 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Teacher Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Department</th>
                    <th>Name</th>
                    <th>PAN</th>
                    <th>Designation</th>
                    <th>Appointment yr.</th>
                    <th>Nature</th>
                    <th>Exp. (same inst.)</th>
                    <th>Still serving?</th>
                    <th>Last yr. service</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted py-5">
                        No records yet.
                      </td>
                    </tr>
                  ) : (
                    records.map((row) => (
                      <tr key={row.id}>
                        <td className="small">{row.department || loginDept || "—"}</td>
                        <td className="fw-semibold">{row.name}</td>
                        <td className="text-muted small">{row.pan}</td>
                        <td>{row.designation}</td>
                        <td>{row.year}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: "#fee2e2",
                              color: "#b31d1d",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          >
                            {row.nature}
                          </span>
                        </td>
                        <td>{row.experience}</td>
                        <td>{row.still_serving ?? "Yes"}</td>
                        <td className="small text-muted">
                          {row.last_year_of_service != null ? row.last_year_of_service : "—"}
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEdit(row)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(row.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          <CriterionProofFileSection criterionKey="2_4_1" />
          <Footer />
      </div>

      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 14 }}
            >
              <div
                className="modal-header"
                style={{
                  background: "#b31d1d",
                  color: "white",
                  borderRadius: "14px 14px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">Edit Teacher</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setEditRecord(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="small text-muted mb-3">
                  <strong>Department:</strong>{" "}
                  {editRecord.department || loginDept || "—"}
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <DropdownWithAddMore
                      label="Name of Teacher"
                      selectClassName="form-select"
                      required
                      value={
                        editRecord.teacher_id ? String(editRecord.teacher_id) : ""
                      }
                      onChange={handleTeacherChangeEdit}
                      options={teachers}
                      optionValue={(o) => String(o.id)}
                      optionLabel={(o) => o.name}
                      placeholder="Select teacher…"
                      addMoreMode="teacher"
                      teacherEmitField="id"
                      onAfterAdd={refreshTeachers}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">PAN</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editRecord.pan ?? ""}
                      onChange={(e) =>
                        setEditRecord({ ...editRecord, pan: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownWithAddMore
                      label="Designation"
                      selectClassName="form-select"
                      value={editRecord.designation ?? ""}
                      onChange={(v) =>
                        setEditRecord({ ...editRecord, designation: v })
                      }
                      options={designationOpts}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label ?? o.value}
                      placeholder="Select designation…"
                      addMoreMode="lookup"
                      lookupKey="designations"
                      onAfterAdd={() =>
                        getLookupValues("designations").then((d) =>
                          setDesignationOpts(Array.isArray(d) ? d : [])
                        )
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Year of appointment</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editRecord.year ?? ""}
                      onChange={(e) =>
                        setEditRecord({ ...editRecord, year: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownWithAddMore
                      label="Nature of Appointment"
                      selectClassName="form-select"
                      value={editRecord.nature ?? ""}
                      onChange={(v) =>
                        setEditRecord({ ...editRecord, nature: v })
                      }
                      options={natureOptions.map((n) => ({ value: n, label: n }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Nature"
                      addMoreMode="lookup"
                      lookupKey="appointment-types"
                      onAfterAdd={() =>
                        getRecords("2_4_1_nature_options").then((opts) =>
                          setNatureOptions(
                            opts?.length
                              ? opts.map((o) =>
                                  typeof o === "string" ? o : o.value || o.label
                                )
                              : []
                          )
                        )
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">
                      Total years of experience (same institution)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={editRecord.experience ?? ""}
                      onChange={(e) =>
                        setEditRecord({
                          ...editRecord,
                          experience: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">
                      Still serving the institution?
                    </label>
                    <select
                      className="form-select"
                      value={editRecord.still_serving}
                      onChange={(e) =>
                        setEditRecord({
                          ...editRecord,
                          still_serving: e.target.value,
                          last_year_of_service:
                            e.target.value === "Yes"
                              ? ""
                              : editRecord.last_year_of_service,
                        })
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  {editRecord.still_serving === "No" && (
                    <div className="col-md-6">
                      <label className="form-label-custom">Last year of service</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editRecord.last_year_of_service ?? ""}
                        onChange={(e) =>
                          setEditRecord({
                            ...editRecord,
                            last_year_of_service: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div
                className="modal-footer bg-light"
                style={{ borderRadius: "0 0 14px 14px" }}
              >
                <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>
                  Update Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
