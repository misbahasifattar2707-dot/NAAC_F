/**
 * Select with optional "+ Add more…" → modal saves via API (lookup / programme / teacher / student / elective).
 */
import { useState } from "react";
import {
  addLookup,
  addProgramme,
  addTeacher,
  addStudent,
  addElective,
} from "../../api/apiService";
import { programmeDisplayLabel } from "../../utils/programmeDisplay";

export const ADD_MORE_SENTINEL = "__ADD_MORE_DROPDOWN__";

export default function DropdownWithAddMore({
  label,
  value,
  onChange,
  options = [],
  optionValue = (o) => (typeof o === "object" ? o.value ?? o.code ?? o : o),
  optionLabel = (o) => (typeof o === "object" ? o.label ?? o.name ?? String(o) : String(o)),
  optionDisabled,
  placeholder = "Select…",
  required = false,
  disabled = false,
  className = "",
  id,
  name,
  selectClassName,
  /** null | 'lookup' | 'programme' | 'teacher' | 'student' | 'elective' */
  addMoreMode = null,
  lookupKey,
  programmeCollectDepartment = false,
  /** When true, after adding a programme the select value becomes the department label (Criterion 1.2.1 dept dropdown). */
  emitDepartmentLabel = false,
  /** When addMoreMode='programme': emit programme code (default) or programme name */
  programmeValueField = "code",
  /** When true with programme mode + programmeValueField 'name': emit programmeDisplayLabel (e.g. MCA) instead of raw DB name */
  programmeEmitDisplayLabel = false,
  /** When addMoreMode='teacher': call onChange with teacher id ('id') or name ('name'). Default 'name'. */
  teacherEmitField = "name",
  onAfterAdd,
  addMoreLabel = "+ Add more…",
}) {
  const cid = id || name || label?.replace(/\s+/g, "-").toLowerCase();
  const showAddMore = Boolean(addMoreMode);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectKey, setSelectKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [lookupInput, setLookupInput] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progName, setProgName] = useState("");
  const [progDept, setProgDept] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [stuName, setStuName] = useState("");
  const [stuEnroll, setStuEnroll] = useState("");
  const [stuProg, setStuProg] = useState("");
  const [stuCat, setStuCat] = useState("");
  const [elecCode, setElecCode] = useState("");
  const [elecName, setElecName] = useState("");

  const openModal = () => {
    setModalError("");
    setLookupInput("");
    setProgCode("");
    setProgName("");
    setProgDept("");
    setTeacherName("");
    setStuName("");
    setStuEnroll("");
    setStuProg("");
    setStuCat("");
    setElecCode("");
    setElecName("");
    setModalOpen(true);
    setSelectKey((k) => k + 1);
  };

  const handleSelectChange = (raw) => {
    if (showAddMore && raw === ADD_MORE_SENTINEL) {
      openModal();
      return;
    }
    onChange(raw);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setModalError("");
  };

  const submitModal = async () => {
    setModalError("");
    setSaving(true);
    try {
      if (addMoreMode === "lookup") {
        if (!lookupKey) {
          setModalError("Missing lookup key.");
          return;
        }
        const v = lookupInput.trim();
        if (!v) {
          setModalError("Enter a value.");
          return;
        }
        const res = await addLookup(lookupKey, v);
        if (!res.success) {
          setModalError(res.error || "Could not save.");
          return;
        }
        onChange(v);
        onAfterAdd?.();
        closeModal();
        return;
      }

      if (addMoreMode === "programme") {
        const code = progCode.trim();
        const pname = progName.trim();
        const dept = progDept.trim();
        if (!code || !pname) {
          setModalError("Programme code and name are required.");
          return;
        }
        const res = await addProgramme(code, pname, dept || undefined);
        if (!res.success) {
          setModalError(res.error || "Could not save programme.");
          return;
        }
        const p = res.program;
        if (emitDepartmentLabel && dept) {
          onChange(dept);
        } else if (programmeValueField === "name") {
          onChange(programmeEmitDisplayLabel ? programmeDisplayLabel(p) : p.name);
        } else {
          onChange(p.code);
        }
        onAfterAdd?.();
        closeModal();
        return;
      }

      if (addMoreMode === "teacher") {
        const n = teacherName.trim();
        if (!n) {
          setModalError("Teacher name is required.");
          return;
        }
        const res = await addTeacher({ name: n });
        if (!res.success) {
          setModalError(res.error || "Could not save teacher.");
          return;
        }
        const emit =
          teacherEmitField === "id" && res.teacher?.id != null
            ? String(res.teacher.id)
            : res.teacher.name;
        onChange(emit);
        onAfterAdd?.();
        closeModal();
        return;
      }

      if (addMoreMode === "student") {
        const n = stuName.trim();
        const en = stuEnroll.trim();
        if (!n || !en) {
          setModalError("Student name and enrollment number are required.");
          return;
        }
        const res = await addStudent({
          name: n,
          enrollment_number: en,
          program_code: stuProg.trim() || undefined,
          category: stuCat.trim() || undefined,
        });
        if (!res.success) {
          setModalError(res.message || res.error || "Could not save student.");
          return;
        }
        onChange(res.student.name);
        onAfterAdd?.();
        closeModal();
        return;
      }

      if (addMoreMode === "elective") {
        const c = elecCode.trim().toUpperCase();
        const nm = elecName.trim();
        if (!c || !nm) {
          setModalError("Subject code and name are required.");
          return;
        }
        const res = await addElective(c, nm);
        if (!res.success) {
          setModalError(res.error || "Could not save subject.");
          return;
        }
        onChange(res.elective.code);
        onAfterAdd?.();
        closeModal();
      }
    } finally {
      setSaving(false);
    }
  };

  const mergedOptions = showAddMore
    ? [...options, { __addMore: true, value: ADD_MORE_SENTINEL, label: addMoreLabel }]
    : options;

  const selCls =
    selectClassName ??
    `form-select form-select-sm${required && !value ? " border-danger" : ""}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={cid} className="form-label-custom">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        key={`${selectKey}-${options.length}`}
        id={cid}
        name={name}
        className={selCls}
        value={value ?? ""}
        onChange={(e) => handleSelectChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {mergedOptions.map((o, i) => {
          const isAddMore = o && typeof o === 'object' && o.__addMore;
          const v = isAddMore ? o.value : optionValue(o);
          const lab = isAddMore ? o.label : optionLabel(o);
          const dis = !isAddMore && (optionDisabled ? optionDisabled(o, i) : false);
          return (
            <option key={`${v}-${i}`} value={v} disabled={dis}>
              {typeof lab === 'object' ? String(lab) : lab}
            </option>
          );
        })}
      </select>

      {modalOpen && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">
                  {addMoreMode === "lookup" && "Add option"}
                  {addMoreMode === "programme" && "Add programme"}
                  {addMoreMode === "teacher" && "Add teacher"}
                  {addMoreMode === "student" && "Add student"}
                  {addMoreMode === "elective" && "Add elective subject"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal} aria-label="Close" />
              </div>
              <div className="modal-body p-4">
                {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}

                {addMoreMode === "lookup" && (
                  <div>
                    <label className="form-label fw-bold small">New value</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                {addMoreMode === "programme" && (
                  <div className="d-flex flex-column gap-2">
                    {programmeCollectDepartment && (
                      <div>
                        <label className="form-label fw-bold small">Department (shown in dept dropdown)</label>
                        <input type="text" className="form-control" value={progDept} onChange={(e) => setProgDept(e.target.value)} placeholder="e.g. MCA" />
                      </div>
                    )}
                    <div>
                      <label className="form-label fw-bold small">Programme code</label>
                      <input type="text" className="form-control" value={progCode} onChange={(e) => setProgCode(e.target.value)} autoFocus />
                    </div>
                    <div>
                      <label className="form-label fw-bold small">Programme name</label>
                      <input type="text" className="form-control" value={progName} onChange={(e) => setProgName(e.target.value)} />
                    </div>
                  </div>
                )}

                {addMoreMode === "teacher" && (
                  <div>
                    <label className="form-label fw-bold small">Full name</label>
                    <input type="text" className="form-control" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} autoFocus />
                  </div>
                )}

                {addMoreMode === "student" && (
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <label className="form-label fw-bold small">Student name</label>
                      <input type="text" className="form-control" value={stuName} onChange={(e) => setStuName(e.target.value)} autoFocus />
                    </div>
                    <div>
                      <label className="form-label fw-bold small">Enrollment number</label>
                      <input type="text" className="form-control" value={stuEnroll} onChange={(e) => setStuEnroll(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label fw-bold small">Program code (optional)</label>
                      <input type="text" className="form-control" value={stuProg} onChange={(e) => setStuProg(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label fw-bold small">Category (optional)</label>
                      <input type="text" className="form-control" value={stuCat} onChange={(e) => setStuCat(e.target.value)} />
                    </div>
                  </div>
                )}

                {addMoreMode === "elective" && (
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <label className="form-label fw-bold small">Subject code</label>
                      <input type="text" className="form-control" value={elecCode} onChange={(e) => setElecCode(e.target.value)} autoFocus />
                    </div>
                    <div>
                      <label className="form-label fw-bold small">Subject name</label>
                      <input type="text" className="form-control" value={elecName} onChange={(e) => setElecName(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger fw-bold px-4" disabled={saving} onClick={submitModal}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
