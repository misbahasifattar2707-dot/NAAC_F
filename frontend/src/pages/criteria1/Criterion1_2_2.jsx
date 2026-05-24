// ============================================================
// Criterion1_2_2.jsx — 1.2.2 & 1.2.3 Add on / Certificate Programs
// CriterionProofFileSection: combined proof → Excel link
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getRecords,
  addRecord,
  deleteRecord,
  updateRecord,
  getExcelExportUrl,
  getAcademicYears,
  getAddonDurations,
} from "../../api/apiService";
import { DropdownWithAddMore } from "../../components/forms";
import { getSessionYear } from "../../utils/session";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";

const emptyForm = () => ({
  programName: "",
  courseCode: "",
  yearOffering: getSessionYear(),
  timesOffered: 1,
  duration: "",
  studentsEnrolled: "",
  studentsCompleted: "",
});

export default function Criterion1_2_2() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);
  const [yearChoices, setYearChoices] = useState([]);
  const [durationChoices, setDurationChoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    Promise.allSettled([getRecords("1_2_2"), getAcademicYears(), getAddonDurations()]).then(
      (settled) => {
        const val = (i) => (settled[i].status === "fulfilled" ? settled[i].value : null);
        setRecords(Array.isArray(val(0)) ? val(0) : []);
        setYearChoices(Array.isArray(val(1)) ? val(1) : []);
        setDurationChoices(Array.isArray(val(2)) ? val(2) : []);
        if (settled[0].status === "rejected") {
          console.warn("1_2_2 records load failed:", settled[0].reason);
        }
      },
    );
  }, []);

  const grouped = records.reduce((acc, rec) => {
    const yr = rec.yearOffering || "Unknown";
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(rec);
    return acc;
  }, {});

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.programName?.trim()) return showAlert("Program / Course Name is required.", "danger");
    if (!form.yearOffering) return showAlert("Year of Offering is required.", "danger");
    if (!form.duration) return showAlert("Duration is required.", "danger");
    if (form.studentsEnrolled === "" || form.studentsEnrolled === undefined)
      return showAlert("Number of Students Enrolled is required.", "danger");

    setSubmitting(true);
    try {
      const payload = { ...form };
      const result = await addRecord("1_2_2", payload);
      if (result.success) {
        setRecords((prev) => [...prev, result.data]);
        setForm(emptyForm());
        showAlert("Program saved. Upload more rows, then Combine proofs for Excel.", "success");
      } else {
        showAlert(result.error || "Failed to save record.", "danger");
      }
    } catch (err) {
      showAlert(err.message || "Save failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteRecord("1_2_2", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload = { ...editRecord };
      delete payload.proofFile;
      await updateRecord("1_2_2", editRecord.id, payload);
      setRecords((prev) => prev.map((r) => (r.id === editRecord.id ? { ...payload, id: editRecord.id } : r)));
      setEditRecord(null);
      showAlert("Updated!", "success");
    } catch (err) {
      showAlert(err.message || "Update failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="app-layout">
      <Sidebar activePage="1_2_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <h4 className="mb-0">1.2.2 & 1.2.3 Add on / Certificate Programs</h4>
            <p className="mb-0 text-muted small">
              1.2.2 Programs offered | 1.2.3 Students enrolled — combine proofs via the proof section below for Excel.
            </p>
          </div>
          <button
            className="btn btn-success btn-sm"
            onClick={() => window.open(getExcelExportUrl("1_2_2"), "_blank")}
          >
            <i className="bi bi-file-earmark-excel me-1"></i> Excel Export
          </button>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-5">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label-custom">Name of Add on / Certificate Program</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Digital Marketing"
                      value={form.programName}
                      onChange={(e) => setForm({ ...form, programName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Course Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.courseCode}
                      onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <DropdownWithAddMore
                      label="Year of Offering"
                      selectClassName="form-select"
                      value={form.yearOffering}
                      onChange={(v) => setForm({ ...form, yearOffering: v })}
                      options={yearChoices.map((y) => ({ value: y, label: y }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Year"
                      required
                      addMoreMode="lookup"
                      lookupKey="academic-years"
                      onAfterAdd={() => getAcademicYears().then((ys) => setYearChoices(ys || []))}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Times Offered</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.timesOffered}
                      onChange={(e) => setForm({ ...form, timesOffered: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <DropdownWithAddMore
                      label="Duration"
                      selectClassName="form-select"
                      value={form.duration}
                      onChange={(v) => setForm({ ...form, duration: v })}
                      options={durationChoices}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      placeholder="Select Duration"
                      required
                      addMoreMode="lookup"
                      lookupKey="addon-durations"
                      onAfterAdd={() => getAddonDurations().then((d) => setDurationChoices(d || []))}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Students Enrolled</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.studentsEnrolled}
                      onChange={(e) => setForm({ ...form, studentsEnrolled: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Students Completed</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.studentsCompleted}
                      onChange={(e) => setForm({ ...form, studentsCompleted: e.target.value })}
                    />
                  </div>
                  <div className="col-12 text-end mt-2">
                    <button type="submit" className="btn btn-danger px-5 fw-bold" disabled={submitting}>
                      {submitting ? "Saving…" : "Add Program Record"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-5 text-muted">No records yet.</div>
          ) : (
            Object.entries(grouped)
              .sort()
              .map(([year, yearRecords]) => (
                <div className="card mb-4 border-0 shadow-sm overflow-hidden" key={year}>
                  <div className="card-header bg-warning text-dark fw-bold">
                    Academic Year: {year} ({yearRecords.length} programs)
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Program Name</th>
                          <th>Code</th>
                          <th>Times</th>
                          <th>Duration</th>
                          <th>Enrolled</th>
                          <th>Completed</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearRecords.map((rec) => (
                          <tr key={rec.id}>
                            <td>
                              <strong>{rec.programName}</strong>
                            </td>
                            <td>
                              <code>{rec.courseCode}</code>
                            </td>
                            <td>{rec.timesOffered}</td>
                            <td>{rec.duration}</td>
                            <td>{rec.studentsEnrolled}</td>
                            <td>{rec.studentsCompleted}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => setEditRecord({ ...rec })}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(rec.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          )}
          <CriterionProofFileSection criterionKey="1_2_2" />
        </div>

        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title">Edit Program</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setEditRecord(null)}
                  ></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-bold">Program Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editRecord.programName || ""}
                      onChange={(e) => setEditRecord({ ...editRecord, programName: e.target.value })}
                      required
                    />
                  </div>
                  {[
                    { label: "Course Code", field: "courseCode" },
                    { label: "Year", field: "yearOffering" },
                    { label: "Times Offered", field: "timesOffered" },
                    { label: "Duration", field: "duration" },
                    { label: "Enrolled", field: "studentsEnrolled" },
                    { label: "Completed", field: "studentsCompleted" },
                  ].map(({ label, field }) => (
                    <div className="col-md-4" key={field}>
                      <label className="form-label fw-bold">{label}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editRecord[field] ?? ""}
                        onChange={(e) => setEditRecord({ ...editRecord, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
