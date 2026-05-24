// ============================================================

// Criterion2_1.jsx — 2.1 Number of Students During the Year

// Select enrollment year once → upload PDF/Excel → auto-save all rows

// ============================================================

import { useState, useEffect, useRef } from "react";

import Sidebar from "../../components/Sidebar";

import Footer from "../../components/Footer";

import {

  getAcademicYears,

  getRecords,

  addRecord,

  updateRecord,

  deleteRecord,

  bulkImportCriterion21,

  previewCriterion21PdfText,

  getExcelExportUrl,

} from "../../api/apiService";

import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";

import {

  ValidationMessageComponent,

  DropdownWithAddMore,

  InputComponent,

  DatePickerComponent,

  useSearchFilter,

} from "../../components/forms";

import { getSessionYear } from "../../utils/session";



function toInputDate(v) {

  if (!v) return "";

  if (typeof v === "string" && v.length >= 10) return v.slice(0, 10);

  return String(v).slice(0, 10);

}



export default function Criterion2_1() {

  const fileInputRef = useRef(null);

  const previewInputRef = useRef(null);



  const [yearOptions, setYearOptions] = useState([]);

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [batchEnrollmentYear, setBatchEnrollmentYear] = useState(getSessionYear());

  const [records, setRecords] = useState([]);

  const [editRecord, setEditRecord] = useState(null);

  const [alert, setAlert] = useState(null);

  const [importing, setImporting] = useState(false);

  const [pdfPreviewing, setPdfPreviewing] = useState(false);

  const [rawTextLines, setRawTextLines] = useState(null);



  const { query, setQuery, filteredRows } = useSearchFilter(records, [

    "enrollment_year",

    "student_name",

    "enrollment_number",

  ]);



  useEffect(() => {

    Promise.all([getAcademicYears(), getRecords("2_1")])

      .then(([years, recs]) => {

        const yrList = Array.isArray(years) ? years : [];

        setYearOptions(yrList);

        setRecords(Array.isArray(recs) ? recs : []);

        const sessionYr = getSessionYear();

        if (sessionYr && yrList.includes(sessionYr)) {

          setBatchEnrollmentYear(sessionYr);

        } else if (yrList.length) {

          setBatchEnrollmentYear(yrList[0]);

        }

      })

      .catch(() => {

        setYearOptions([]);

        setRecords([]);

        showAlert("Could not load data from the server.", "danger");

      })

      .finally(() => setLoadingDropdowns(false));

  }, []);



  const showAlert = (msg, type = "success") => {

    setAlert({ msg, type });

    setTimeout(() => setAlert(null), 4500);

  };



  const handleImportFile = async (e) => {

    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;



    const year = (batchEnrollmentYear || "").trim();

    if (!year) {

      return showAlert("Select the year of enrollment first (same for all students).", "danger");

    }



    setImporting(true);

    try {

      const res = await bulkImportCriterion21(year, file);

      if (!res.success) {

        showAlert(res.error || "Import failed.", "danger");

        return;

      }



      const updated = await getRecords("2_1");

      setRecords(Array.isArray(updated) ? updated : []);



      const parts = [];

      if (res.added) parts.push(`${res.added} added`);

      if (res.updated) parts.push(`${res.updated} updated with enrollment dates`);

      if (res.skipped) parts.push(`${res.skipped} skipped`);

      showAlert(

        `${parts.join(", ") || "Import complete"}. Uploaded file saved as proof link.`,

        "success",

      );

    } catch (err) {

      showAlert(err.message || "Upload failed.", "danger");

    } finally {

      setImporting(false);

    }

  };



  const handlePreviewSelected = async (e) => {

    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    setPdfPreviewing(true);

    try {

      const res = await previewCriterion21PdfText(file);

      if (!res.success) {

        showAlert(res.error || "Could not read PDF text.", "danger");

        return;

      }

      setRawTextLines(res.raw_lines || []);

    } catch (err) {

      showAlert(err.message || "Preview failed.", "danger");

    } finally {

      setPdfPreviewing(false);

    }

  };



  const handleDelete = async (id) => {

    if (!window.confirm("Delete this record?")) return;

    await deleteRecord("2_1", id);

    setRecords((prev) => prev.filter((r) => r.id !== id));

    showAlert("Record deleted.");

  };



  const handleEditSave = async () => {

    try {

      await updateRecord("2_1", editRecord.id, editRecord);

      setRecords((prev) =>

        prev.map((r) => (r.id === editRecord.id ? { ...editRecord, id: editRecord.id } : r)),

      );

      setEditRecord(null);

      showAlert("Record updated!");

    } catch (err) {

      showAlert(err.message || "Update failed.", "danger");

    }

  };



  const openEdit = (row) => {

    setEditRecord({

      ...row,

      enrollment_date: toInputDate(row.enrollment_date),

    });

  };



  const handleAddSingle = async () => {

    const year = (batchEnrollmentYear || "").trim();

    if (!year) {

      return showAlert("Select year of enrollment first.", "danger");

    }

    const name = window.prompt("Student name:");

    if (!name?.trim()) return;

    const en = window.prompt("Enrollment number:");

    if (!en?.trim()) return;

    const result = await addRecord("2_1", {

      enrollment_year: year,

      student_name: name.trim(),

      enrollment_number: en.trim(),

    });

    if (result.success) {

      setRecords((prev) => [...prev, result.data]);

      showAlert("Student added.");

    } else {

      showAlert(result.error || "Could not add student.", "danger");

    }

  };



  return (

    <div className="app-layout">

      <Sidebar activePage="2_1" />



      <div className="main-content">

        <header className="page-header">

          <div>

            <p

              className="text-muted mb-0"

              style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}

            >

              Criteria 2

            </p>

            <h4>2.1: Number of Students During the Year</h4>

          </div>

          <button

            className="btn btn-success btn-sm fw-semibold"

            onClick={() => window.open(getExcelExportUrl("2_1"), "_blank")}

          >

            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel

          </button>

        </header>



        <div className="container-fluid p-4 fade-in">

          {alert && (

            <ValidationMessageComponent

              message={alert.msg}

              type={alert.type}

              onClose={() => setAlert(null)}

              className="mb-3"

            />

          )}



          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>

            <div className="card-body p-4">

              <h6

                className="fw-bold text-uppercase mb-3"

                style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}

              >

                <i className="bi bi-cloud-upload me-2 text-danger"></i>Import student list

              </h6>



              {loadingDropdowns ? (

                <div className="spinner-overlay">

                  <div className="spinner-border text-danger" role="status"></div>

                </div>

              ) : (

                <div className="border rounded p-4 bg-light bg-opacity-50" style={{ borderRadius: 12 }}>

                  <div className="row g-3 align-items-end">

                    <div className="col-md-4">

                      <DropdownWithAddMore

                        label="Year of enrollment (same for all)"

                        value={batchEnrollmentYear}

                        onChange={setBatchEnrollmentYear}

                        options={yearOptions}

                        optionValue={(y) => y}

                        optionLabel={(y) => y}

                        placeholder="Select year"

                        required

                        addMoreMode="lookup"

                        lookupKey="academic-years"

                        onAfterAdd={() =>

                          getAcademicYears().then((ys) => setYearOptions(ys || []))

                        }

                      />

                    </div>

                    <div className="col-md-8">

                      <p className="small text-muted mb-2">

                        Upload one <strong>PDF</strong> (selectable text) or <strong>Excel/CSV</strong> with

                        columns <strong>Name of Students</strong>, <strong>Student Enrollment Number</strong>, and{" "}

                        <strong>Date of Enrollment</strong>. Year is taken from the dropdown above; dates come from the Excel file.

                      </p>

                      <input

                        ref={fileInputRef}

                        type="file"

                        accept=".pdf,.csv,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"

                        className="d-none"

                        onChange={handleImportFile}

                      />

                      <input

                        ref={previewInputRef}

                        type="file"

                        accept=".pdf,application/pdf"

                        className="d-none"

                        onChange={handlePreviewSelected}

                      />

                      <div className="d-flex flex-wrap gap-2">

                        <button

                          type="button"

                          className="btn btn-danger btn-sm fw-semibold"

                          disabled={importing || !batchEnrollmentYear}

                          onClick={() => fileInputRef.current?.click()}

                        >

                          {importing ? (

                            <>

                              <span className="spinner-border spinner-border-sm me-2" role="status" />

                              Importing…

                            </>

                          ) : (

                            <>

                              <i className="bi bi-upload me-1"></i>

                              Upload PDF / Excel

                            </>

                          )}

                        </button>

                        <button

                          type="button"

                          className="btn btn-outline-info btn-sm fw-semibold"

                          disabled={importing || pdfPreviewing}

                          onClick={() => previewInputRef.current?.click()}

                        >

                          {pdfPreviewing ? "Loading…" : "Preview PDF text"}

                        </button>

                        <button

                          type="button"

                          className="btn btn-outline-secondary btn-sm"

                          onClick={handleAddSingle}

                        >

                          + Add one student manually

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>



          <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>

            <div className="card-body py-3">

              <InputComponent

                label="Search saved records"

                value={query}

                onChange={setQuery}

                placeholder="Name, enrolment no., or year…"

              />

            </div>

          </div>



          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">

                  <tr>

                    <th>Year</th>

                    <th>Student Name</th>

                    <th>Enrollment Number</th>

                    <th>Date of Enrollment</th>

                    <th className="text-center">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {records.length === 0 ? (

                    <tr>

                      <td colSpan={5} className="text-center text-muted py-5">

                        No records yet. Select year and upload a PDF or Excel file above.

                      </td>

                    </tr>

                  ) : filteredRows.length === 0 ? (

                    <tr>

                      <td colSpan={5} className="text-center text-muted py-4">

                        No rows match your search.

                      </td>

                    </tr>

                  ) : (

                    filteredRows.map((row) => (

                      <tr key={row.id}>

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

                            {row.enrollment_year}

                          </span>

                        </td>

                        <td className="fw-semibold">{row.student_name}</td>

                        <td className="text-muted small">{row.enrollment_number}</td>

                        <td className="text-muted small">{toInputDate(row.enrollment_date) || "—"}</td>

                        <td className="text-center">

                          <div className="btn-group btn-group-sm">

                            <button

                              type="button"

                              className="btn btn-outline-primary"

                              onClick={() => openEdit(row)}

                              title="Edit"

                            >

                              <i className="bi bi-pencil-square"></i>

                            </button>

                            <button

                              type="button"

                              className="btn btn-outline-danger"

                              onClick={() => handleDelete(row.id)}

                              title="Delete"

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



          <CriterionProofFileSection

            criterionKey="2_1"

            description="Optional: upload additional proof PDFs/images if needed. The imported student list file is already saved as proof when you upload above."

          />

          <Footer />

        </div>



        {editRecord && (

          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>

                <div

                  className="modal-header"

                  style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}

                >

                  <h5 className="modal-title fw-bold">Edit Student Record</h5>

                  <button

                    type="button"

                    className="btn-close btn-close-white"

                    onClick={() => setEditRecord(null)}

                  ></button>

                </div>

                <div className="modal-body p-4">

                  <div className="mb-3">

                    <DropdownWithAddMore

                      label="Year of Enrollment"

                      value={editRecord.enrollment_year}

                      onChange={(v) => setEditRecord({ ...editRecord, enrollment_year: v })}

                      options={yearOptions}

                      optionValue={(y) => y}

                      optionLabel={(y) => y}

                      required

                      addMoreMode="lookup"

                      lookupKey="academic-years"

                      onAfterAdd={() =>

                        getAcademicYears().then((ys) => setYearOptions(ys || []))

                      }

                    />

                  </div>

                  <div className="mb-3">

                    <InputComponent

                      label="Student Name"

                      value={editRecord.student_name}

                      onChange={(v) => setEditRecord({ ...editRecord, student_name: v })}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <InputComponent

                      label="Enrollment Number"

                      value={editRecord.enrollment_number}

                      onChange={(v) => setEditRecord({ ...editRecord, enrollment_number: v })}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <DatePickerComponent

                      label="Date of Enrollment (optional)"

                      value={editRecord.enrollment_date}

                      onChange={(v) => setEditRecord({ ...editRecord, enrollment_date: v })}

                    />

                  </div>

                </div>

                <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>

                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>

                    Cancel

                  </button>

                  <button type="button" className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>

                    Update Record

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}



        {rawTextLines !== null && (

          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>

            <div className="modal-dialog modal-lg modal-dialog-scrollable">

              <div className="modal-content" style={{ borderRadius: 14 }}>

                <div className="modal-header">

                  <h5 className="modal-title fw-bold">

                    <i className="bi bi-file-text me-2 text-info"></i>

                    Raw PDF Text Preview

                  </h5>

                  <button type="button" className="btn-close" onClick={() => setRawTextLines(null)} />

                </div>

                <div className="modal-body">

                  <p className="small text-muted mb-2">

                    Text extracted from your PDF. If empty, the PDF may be scanned/image-only.

                  </p>

                  {rawTextLines.length === 0 ? (

                    <div className="alert alert-warning">No text could be extracted from this PDF.</div>

                  ) : (

                    <pre

                      className="border rounded p-3 bg-light small"

                      style={{ maxHeight: 420, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}

                    >

                      {rawTextLines.map((l, i) => `${String(i + 1).padStart(4, " ")}  ${l}`).join("\n")}

                    </pre>

                  )}

                </div>

                <div className="modal-footer bg-light">

                  <button type="button" className="btn btn-secondary" onClick={() => setRawTextLines(null)}>

                    Close

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


