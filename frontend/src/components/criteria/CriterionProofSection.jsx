import { useRef, useState } from "react";
import { resolveProofHref } from "../../utils/proofUrl";
import { useCriterionFileProof } from "../../hooks/useCriterionProof";

function mergeProofFileLists(existing, incoming) {
  const key = (f) => `${f.name}::${f.size}::${f.lastModified}`;
  const map = new Map();
  for (const f of existing) map.set(key(f), f);
  for (const f of incoming) map.set(key(f), f);
  return Array.from(map.values());
}

function ProofLinkActions({ proofLink, onSave, onDelete, saveLabel = "Save proof link" }) {
  const openProof = () => {
    const url = resolveProofHref(proofLink);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="input-group">
      <input type="text" className="form-control" value={proofLink || ""} readOnly placeholder="Combined proof link" />
      {proofLink ? (
        <button type="button" className="btn btn-outline-danger" onClick={openProof}>
          View PDF
        </button>
      ) : null}
      {proofLink ? (
        <button type="button" className="btn btn-outline-secondary" onClick={onDelete}>
          Delete proof
        </button>
      ) : null}
      <button type="button" className="btn btn-success" onClick={onSave}>
        {saveLabel}
      </button>
    </div>
  );
}

export default function CriterionProofSection({
  proofLink,
  setProofLink,
  combining,
  rowsWithProofCount = 0,
  totalRecords = 0,
  onCombine,
  onSaveLink,
  onDeleteLink,
  description,
}) {
  const openProof = () => {
    const url = resolveProofHref(proofLink);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-4 p-4 rounded shadow-sm bg-white border">
      <h5 className="fw-bold text-dark mb-1">Combine proofs for Excel export</h5>
      {description ? <p className="text-muted small mb-3">{description}</p> : null}
      <p className="small mb-3">
        Rows with saved proof: <strong>{rowsWithProofCount}</strong> / {totalRecords}
      </p>
      <button
        type="button"
        className="btn btn-primary mb-3"
        disabled={combining || totalRecords === 0}
        onClick={onCombine}
      >
        {combining ? "Combining…" : "Combine all row proofs into one PDF"}
      </button>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Combined proof link"
          value={proofLink || ""}
          onChange={(e) => setProofLink?.(e.target.value)}
        />
        {proofLink ? (
          <button type="button" className="btn btn-outline-danger" onClick={openProof}>
            View PDF
          </button>
        ) : null}
        {proofLink && onDeleteLink ? (
          <button type="button" className="btn btn-outline-secondary" onClick={onDeleteLink}>
            Delete proof
          </button>
        ) : null}
        <button type="button" className="btn btn-success" onClick={onSaveLink}>
          Save proof link
        </button>
      </div>
    </div>
  );
}

/** One combined proof for the whole criterion (1.3.2 / 1.3.3 — single Excel proof column). */
export function CriterionProofFileSection({
  criterionKey,
  description = "Upload proof PDFs/images, combine into one file. That link is written to the proof column for every student row in Excel. Files can be in different folders on your PC — use Add proof files once per folder.",
}) {
  const {
    proofLink,
    setProofLink,
    combining,
    combineUploadedFiles,
    saveProofLinkManual,
    deleteProofLinkManual,
  } = useCriterionFileProof(criterionKey);

  const fileInputRef = useRef(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [msg, setMsg] = useState(null);

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) {
      setProofFiles((prev) => mergeProofFileLists(prev, picked));
      setMsg(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeProofFile = (index) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearProofFiles = () => {
    setProofFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCombine = async () => {
    setMsg(null);
    const res = await combineUploadedFiles(proofFiles);
    setMsg(res);
    if (res?.ok) {
      setProofFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setMsg(null);
    const res = await saveProofLinkManual();
    setMsg(res);
  };

  const handleDelete = async () => {
    setMsg(null);
    const res = await deleteProofLinkManual();
    setMsg(res);
  };

  return (
    <div className="mt-4 p-4 rounded shadow-sm bg-white border">
      <h5 className="fw-bold text-dark mb-1">Criterion proof (for Excel export)</h5>
      <p className="text-muted small mb-3">{description}</p>
      {msg ? (
        <div className={`alert alert-${msg.type || "info"} py-2 small`}>{msg.message}</div>
      ) : null}
      <div className="mb-3">
        <label className="form-label fw-bold small">Proof files to combine</label>
        <p className="text-muted small mb-2">
          Files can be in different folders. Click <strong>Add proof files</strong> for each folder,
          then combine once all proofs are listed below.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          multiple
          accept="application/pdf,.pdf,image/png,image/jpeg,.jpg,.jpeg,.webp,.png"
          onChange={handleAddFiles}
        />
        <div className="d-flex flex-wrap gap-2 mb-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            + Add proof files
          </button>
          {proofFiles.length > 0 ? (
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearProofFiles}>
              Clear list
            </button>
          ) : null}
        </div>
        {proofFiles.length > 0 ? (
          <ul className="list-group list-group-flush border rounded small mb-0">
            {proofFiles.map((f, idx) => (
              <li
                key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                className="list-group-item d-flex justify-content-between align-items-center py-2"
              >
                <span className="text-truncate me-2" title={f.name}>
                  {idx + 1}. {f.name}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeProofFile(idx)}
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small text-muted mb-0">No files added yet.</p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-primary mb-3"
        disabled={combining || proofFiles.length === 0}
        onClick={handleCombine}
      >
        {combining ? "Combining…" : "Combine uploaded proofs into one PDF"}
      </button>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Combined proof link"
          value={proofLink || ""}
          onChange={(e) => setProofLink(e.target.value)}
        />
        {proofLink ? (
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => {
              const url = resolveProofHref(proofLink);
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            View PDF
          </button>
        ) : null}
        {proofLink ? (
          <button type="button" className="btn btn-outline-secondary" onClick={handleDelete}>
            Delete proof
          </button>
        ) : null}
        <button type="button" className="btn btn-success" onClick={handleSave}>
          Save proof link
        </button>
      </div>
    </div>
  );
}

export { ProofLinkActions };
