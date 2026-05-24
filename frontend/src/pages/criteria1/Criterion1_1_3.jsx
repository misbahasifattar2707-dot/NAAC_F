// ============================================================
// Criterion1_1_3.jsx — 1.1.3 Teacher Participation
// NAAC fields: Year | Name of teacher | Name of the body
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getTeachers, getRecords, addRecord, deleteRecord, updateRecord,
  getExcelExportUrl, getAcademicYears,
} from "../../api/apiService";
import { DropdownWithAddMore } from "../../components/forms";
import { getSessionYear } from "../../utils/session";
import CriterionProofSection from "../../components/criteria/CriterionProofSection";
import { useCriterionProof } from "../../hooks/useCriterionProof";
import PerRowProofInput from "../../components/criteria/PerRowProofInput";
import { attachProofToPayload } from "../../utils/recordProof";
import { getRecordProofHref, resolveProofHref } from "../../utils/proofUrl";

const emptyRow = (defaultYear = "") => ({
  year: defaultYear,
  teacherId: "",
  teacherName: "",
  bodyName: "",
  proofFile: null,
});

export default function Criterion1_1_3() {
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [editProofFile, setEditProofFile] = useState(null);
  const [rows, setRows] = useState([emptyRow(getSessionYear())]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupError, setLookupError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLookupsLoading(true);
      setLookupError("");
      try {
        const [tlist, years] = await Promise.all([getTeachers(), getAcademicYears()]);
        if (cancelled) return;
        setTeachers(tlist);
        setAcademicYears(years);
        const parts = [];
        if (!tlist.length) parts.push("teachers");
        if (!years.length) parts.push("academic years");
        if (parts.length) {
          setLookupError(
            `No ${parts.join(" or ")} in lookup tables. Use + Add more or add data in teacher_lookup / academic_year_lookup.`,
          );
        }
        const sessionYr = getSessionYear();
        const defaultYear =
          sessionYr && years.includes(sessionYr) ? sessionYr : years[0] || "";
        if (defaultYear) {
          setRows((prev) => prev.map((row) => ({ ...row, year: row.year || defaultYear })));
        }
      } catch (e) {
        if (!cancelled) setLookupError(e?.message || "Failed to load dropdown data.");
      } finally {
        if (!cancelled) setLookupsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    getRecords("1_1_3").then((recs) => setRecords(Array.isArray(recs) ? recs : []));
  }, []);

  const {
    proofLink,
    setProofLink,
    combining,
    rowsWithProofCount,
    totalRecords,
    combineAllProofs,
    saveProofLinkManual,
    deleteProofLinkManual,
  } = useCriterionProof("1_1_3", records);

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleTeacherChange = (index, rawId) => {
    const tid = parseInt(rawId, 10);
    const t = teachers.find((x) => x.id === tid);
    const updated = [...rows];
    updated[index].teacherId = Number.isFinite(tid) ? String(tid) : "";
    updated[index].teacherName = t?.name || "";
    setRows(updated);
  };

  const addRow = () => {
    const defaultYear =
      academicYears.includes(getSessionYear()) ? getSessionYear() : academicYears[0] || "";
    setRows([...rows, emptyRow(defaultYear)]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const row of rows) {
      if (!row.year) return showAlert("Year is required for every row.", "danger");
      if (!row.teacherId && !row.teacherName)
        return showAlert("Select a teacher for every row.", "danger");
      if (!row.bodyName.trim())
        return showAlert("Name of the body is required for every row.", "danger");
    }
    let saved = 0;
    setSubmitting(true);
    try {
      for (const row of rows) {
        let payload = {
          year: row.year,
          teacher_id: row.teacherId ? parseInt(row.teacherId, 10) : undefined,
          teacherName: row.teacherName,
          bodyName: row.bodyName.trim(),
        };
        payload = await attachProofToPayload("1_1_3", row.proofFile, payload);

        const result = await addRecord("1_1_3", payload);
        if (result.success) {
          setRecords((prev) => [...prev, result.data]);
          saved++;
        } else {
          showAlert(result.error || "Failed to save record.", "danger");
          return;
        }
      }
      const defaultYear =
        academicYears.includes(getSessionYear()) ? getSessionYear() : academicYears[0] || "";
      setRows([emptyRow(defaultYear)]);
      showAlert(`${saved} record(s) saved successfully!`, "success");
    } catch (err) {
      showAlert(err.message || "Save failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("1_1_3", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload = { ...editRecord };
      delete payload.proofFile;
      payload = await attachProofToPayload("1_1_3", editProofFile, payload);
      const result = await updateRecord("1_1_3", editRecord.id, payload);
      if (result?.success && result?.data) {
        setRecords((prev) => prev.map((r) => (r.id === editRecord.id ? result.data : r)));
      } else {
        setRecords((prev) =>
          prev.map((r) => (r.id === editRecord.id ? { ...payload, id: editRecord.id } : r)),
        );
      }
      setEditRecord(null);
      setEditProofFile(null);
      showAlert("Record updated!", "success");
    } catch (err) {
      showAlert(err.message || "Update failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleCombineProofs = async () => {
    const res = await combineAllProofs();
    showAlert(
      res.message,
      res.ok ? "success" : res.type === "warning" ? "warning" : "danger",
    );
  };

  const handleSaveProofLink = async () => {
    const res = await saveProofLinkManual();
    showAlert(
      res.message,
      res.ok ? "success" : res.type === "warning" ? "warning" : "danger",
    );
  };

  const handleDeleteProofLink = async () => {
    const res = await deleteProofLinkManual();
    if (res.type === "info") return;
    showAlert(res.message, res.ok ? "success" : "danger");
  };
  const openRowProof = (row) => {
    const url = resolveProofHref(getRecordProofHref(row));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else showAlert("No proof on this row.", "warning");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_1_3" />
      <div className="main-content">
        <header className="page-header">
          <h4>Criteria 1.1.3: Teacher Participation</h4>
          <button
            className="btn btn-success btn-sm"
            onClick={() => window.open(getExcelExportUrl("1_1_3"), "_blank")}
          >
            <i className="bi bi-file-earmark-excel me-1"></i> Excel Export
          </button>
        </header>

        <div className="container-fluid p-4">
          <p className="text-muted small mb-3">
            Teachers participating in curriculum development / academic bodies during the year
            (NAAC: Year, name of teacher, name of the body).
          </p>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}
          {lookupError && <div className="alert alert-danger">{lookupError}</div>}
          {lookupsLoading && (
            <div className="alert alert-info py-2">Loading teachers and years…</div>
          )}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {rows.map((row, idx) => (
                  <div className="row g-3 align-items-end mb-3 pb-3 border-bottom" key={idx}>
                    <div className="col-md-3">
                      <DropdownWithAddMore
                        key={`yr-${academicYears.length}-${idx}`}
                        label="Year"
                        selectClassName="form-select form-select-sm"
                        value={row.year}
                        onChange={(v) => updateRow(idx, "year", v)}
                        options={academicYears.map((y) => ({ value: y, label: y }))}
                        optionValue={(o) => o.value}
                        optionLabel={(o) => o.label}
                        placeholder={academicYears.length ? "Select year" : "No years"}
                        required
                        addMoreMode="lookup"
                        lookupKey="academic-years"
                        onAfterAdd={() =>
                          getAcademicYears().then((ys) => setAcademicYears(ys || []))
                        }
                      />
                    </div>
                    <div className="col-md-3">
                      <DropdownWithAddMore
                        key={`tch-${teachers.length}-${idx}`}
                        label="Name of Teacher Participated"
                        selectClassName="form-select form-select-sm"
                        value={row.teacherId ? String(row.teacherId) : ""}
                        onChange={(v) => handleTeacherChange(idx, v)}
                        options={teachers}
                        optionValue={(t) => String(t.id)}
                        optionLabel={(t) => t.name}
                        placeholder={teachers.length ? "Select teacher" : "No teachers"}
                        required
                        addMoreMode="teacher"
                        teacherEmitField="id"
                        onAfterAdd={() => getTeachers().then((list) => setTeachers(list || []))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">
                        Name of the Body in which Teacher Participated
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Paper Assessment / BOS"
                        value={row.bodyName}
                        onChange={(e) => updateRow(idx, "bodyName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <PerRowProofInput
                        className="form-control form-control-sm"
                        onFileChange={(f) => updateRow(idx, "proofFile", f)}
                      />
                    </div>
                    {rows.length > 1 && (
                      <div className="col-md-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeRow(idx)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
                    + Add Another Row
                  </button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold" disabled={submitting}>
                    {submitting ? "Saving…" : "Save All Records"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="table-responsive bg-white shadow-sm p-3 rounded">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Year</th>
                  <th>Name of Teacher Participated</th>
                  <th>Name of the Body</th>
                  <th className="text-center">Proof</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No records yet.
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row.id}>
                      <td>{row.year}</td>
                      <td>{row.teacherName}</td>
                      <td>{row.bodyName}</td>
                      <td className="text-center">
                        {getRecordProofHref(row) ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openRowProof(row)}
                          >
                            View PDF
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setEditProofFile(null);
                              const t = teachers.find((x) => x.name === row.teacherName);
                              setEditRecord({
                                ...row,
                                teacher_id: row.teacher_id || t?.id || null,
                              });
                            }}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(row.id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <CriterionProofSection
            proofLink={proofLink}
            setProofLink={setProofLink}
            combining={combining}
            rowsWithProofCount={rowsWithProofCount}
            totalRecords={totalRecords}
            onCombine={handleCombineProofs}
            onSaveLink={handleSaveProofLink}
            onDeleteLink={handleDeleteProofLink}
            description="Each teacher has a separate proof. Attach a PDF/image on each row above and save — files may be uploaded from different folders on your PC. The system stores each proof separately; when you combine, it finds every saved row proof (wherever it was stored) and merges them into one PDF for Excel."
          />
        </div>

        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Edit Record</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setEditRecord(null);
                      setEditProofFile(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-12">
                    <DropdownWithAddMore
                      key={`edit-yr-${academicYears.length}`}
                      label="Year"
                      selectClassName="form-select"
                      value={editRecord.year || ""}
                      onChange={(v) => setEditRecord({ ...editRecord, year: v })}
                      options={academicYears.map((y) => ({ value: y, label: y }))}
                      optionValue={(o) => o.value}
                      optionLabel={(o) => o.label}
                      required
                      addMoreMode="lookup"
                      lookupKey="academic-years"
                      onAfterAdd={() =>
                        getAcademicYears().then((ys) => setAcademicYears(ys || []))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <DropdownWithAddMore
                      label="Name of Teacher Participated"
                      selectClassName="form-select"
                      value={
                        editRecord.teacher_id
                          ? String(editRecord.teacher_id)
                          : (() => {
                              const t = teachers.find((x) => x.name === editRecord.teacherName);
                              return t ? String(t.id) : "";
                            })()
                      }
                      onChange={(v) => {
                        const tid = parseInt(v, 10);
                        const t = teachers.find((x) => x.id === tid);
                        setEditRecord({
                          ...editRecord,
                          teacher_id: Number.isFinite(tid) ? tid : null,
                          teacherName: t?.name || "",
                        });
                      }}
                      options={teachers}
                      optionValue={(t) => String(t.id)}
                      optionLabel={(t) => t.name}
                      required
                      addMoreMode="teacher"
                      teacherEmitField="id"
                      onAfterAdd={() => getTeachers().then((list) => setTeachers(list || []))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Name of the Body</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editRecord.bodyName || ""}
                      onChange={(e) =>
                        setEditRecord({ ...editRecord, bodyName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <PerRowProofInput
                      label="Replace proof (optional)"
                      onFileChange={setEditProofFile}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditRecord(null);
                      setEditProofFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Changes"}
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
