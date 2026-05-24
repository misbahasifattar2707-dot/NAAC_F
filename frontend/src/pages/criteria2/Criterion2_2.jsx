// ============================================================
// Criterion2_2.jsx — 2.2 Reserved Category Seats
// Year & Category dropdowns fetched from apiService
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAcademicYears, getReservedCategories, getRecords, addRecord, deleteRecord, getExcelExportUrl } from "../../api/apiService";
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";
import { DropdownWithAddMore } from "../../components/forms";
import { getSessionYear } from "../../utils/session";

const catColors = {
  SC: { bg: "#dbeafe", text: "#1d4ed8" },
  ST: { bg: "#dcfce7", text: "#16a34a" },
  OBC: { bg: "#fef9c3", text: "#ca8a04" },
  Divyangjan: { bg: "#f3e8ff", text: "#7c3aed" },
  "Gen-EWS": { bg: "#ffedd5", text: "#c2410c" },
  Others: { bg: "#f1f5f9", text: "#475569" },
};

const emptyRow = () => ({ year: getSessionYear(), category: "", reserved_seats: "" });

export default function Criterion2_2() {
  const [yearOptions, setYearOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    Promise.all([getAcademicYears(), getReservedCategories(), getRecords("2_2")])
      .then(([years, cats, recs]) => {
        setYearOptions(years);
        setCategoryOptions(cats);
        setRecords(recs);
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSave = async () => {
    try {
    for (const r of rows) {
      if (!r.year || !r.category || !r.reserved_seats) {
        return showAlert("Fill Year, Category and Seats for every row.", "danger");
      }
      let payload = { year: r.year, category: r.category, reserved_seats: r.reserved_seats };
      const result = await addRecord("2_2", payload);
      if (!result.success) {
        return showAlert(result.error || "Failed to save record. Check all fields.", "danger");
      }
    }
    } catch (err) {
      return showAlert(err.message || "Save failed.", "danger");
    }
    setRows([emptyRow()]);
    const updated = await getRecords("2_2");
    setRecords(Array.isArray(updated) ? updated : []);
    showAlert("Records saved!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleExportExcel = () => window.open(getExcelExportUrl("2_2"), "_blank");

  return (
    <div className="app-layout">
      <Sidebar activePage="2_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.2: Reserved Category Seats</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => { window.location.href = '/api/export-excel/2_2'; }}>
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

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Reserved Seat Records
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay"><div className="spinner-border text-danger"></div></div>
              ) : (
                <>
                  <div className="row g-2 mb-1 d-none d-md-flex">
                    {["Academic Year", "Category", "No. of Reserved Seats", ""].map((h, i) => (
                      <div
                        key={i}
                        className={i === 3 ? "col-md-1" : i === 2 ? "col-md-7" : "col-md-2"}
                      >
                        <span className="form-label-custom">{h}</span>
                      </div>
                    ))}
                  </div>

                  {rows.map((row, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-2">
                        <DropdownWithAddMore
                          label=""
                          selectClassName="form-select form-select-sm"
                          value={row.year}
                          onChange={(v) => updateRow(i, "year", v)}
                          options={yearOptions.map((y) => ({ value: y, label: y }))}
                          optionValue={(o) => o.value}
                          optionLabel={(o) => o.label}
                          placeholder="Select Year"
                          addMoreMode="lookup"
                          lookupKey="academic-years"
                          onAfterAdd={() =>
                            getAcademicYears().then((ys) => setYearOptions(ys || []))
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <DropdownWithAddMore
                          label=""
                          selectClassName="form-select form-select-sm"
                          value={row.category}
                          onChange={(v) => updateRow(i, "category", v)}
                          options={categoryOptions.map((c) => ({ value: c, label: c }))}
                          optionValue={(o) => o.value}
                          optionLabel={(o) => o.label}
                          placeholder="Select Category"
                          addMoreMode="lookup"
                          lookupKey="reserved-categories"
                          onAfterAdd={() =>
                            getReservedCategories().then((cats) => setCategoryOptions(cats || []))
                          }
                        />
                      </div>
                      <div className="col-md-7">
                        <input type="number" className="form-control form-control-sm" placeholder="No. of Seats"
                          value={row.reserved_seats} onChange={e => updateRow(i, "reserved_seats", e.target.value)} />
                      </div>
                      <div className="col-md-1">
                        <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeRow(i)}>×</button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <button className="btn btn-outline-primary btn-sm" onClick={addRow}>
                      <i className="bi bi-plus-lg me-1"></i> Add Row
                    </button>
                    <button className="btn btn-danger px-4 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Records
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
                    <th>Category</th>
                    <th>Reserved Seats</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-5">No records found.</td></tr>
                  ) : records.map(row => {
                    const c = catColors[row.category] || { bg: "#f1f5f9", text: "#475569" };
                    return (
                      <tr key={row.id}>
                        <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>{row.year}</span></td>
                        <td>
                          <span className="badge px-3 py-2" style={{ background: c.bg, color: c.text, fontWeight: 700, fontSize: "0.75rem" }}>
                            {row.category}
                          </span>
                        </td>
                        <td className="fw-bold">{row.reserved_seats}</td>
                        <td className="text-center">
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(row.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          <CriterionProofFileSection criterionKey="2_2" />
          <Footer />
      </div>
    </div>
  );
}
