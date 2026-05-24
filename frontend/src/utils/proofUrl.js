export function resolveProofHref(link) {
  if (!link || typeof link !== "string") return null;
  const t = link.trim().replace(/\\/g, "/");
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return `http://127.0.0.1:5000${path}`;
}

export function getRecordProofHref(row) {
  if (!row) return null;
  return (
    row.documentPath ||
    row.docLink ||
    row.proof_links ||
    row.proof_document ||
    row.pdfPath ||
    row.document_link ||
    row.supporting_document ||
    null
  );
}

export function recordHasProof(row) {
  return Boolean(getRecordProofHref(row));
}
