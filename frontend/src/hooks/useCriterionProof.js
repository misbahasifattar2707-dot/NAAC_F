import { useCallback, useEffect, useState } from "react";
import { combineRecordProofs, deleteProofLink, getProofLink, saveProofLink, uploadEvidence } from "../api/apiService";
import { recordHasProof } from "../utils/proofUrl";

/** Row-based proof merge (other criteria). */
export function useCriterionProof(criterionKey, records = []) {
  const [proofLink, setProofLink] = useState("");
  const [combining, setCombining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProofLink(criterionKey)
      .then((pl) => {
        if (!cancelled && pl?.link) setProofLink(pl.link);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [criterionKey]);

  const rowsWithProofCount = (records || []).filter(recordHasProof).length;

  const combineAllProofs = useCallback(async () => {
    if (rowsWithProofCount === 0) {
      return {
        ok: false,
        type: "warning",
        message: "No row proofs saved yet. Attach file(s) on rows and save first.",
      };
    }
    setCombining(true);
    try {
      const res = await combineRecordProofs(criterionKey);
      if (res?.success && res?.link) {
        setProofLink(res.link);
        const skipped = Array.isArray(res.skipped) ? res.skipped.filter(Boolean) : [];
        let message = `Combined ${res.merged_from_records || 0} proof file(s). Link saved for Excel export.`;
        if (skipped.length) {
          message += ` (${skipped.length} row(s) skipped: ${skipped.slice(0, 2).join("; ")}${skipped.length > 2 ? "…" : ""})`;
        }
        return {
          ok: true,
          type: skipped.length ? "warning" : "success",
          message,
        };
      }
      const skipped = Array.isArray(res?.skipped) ? res.skipped.filter(Boolean) : [];
      let message = res?.error || "Combine failed.";
      if (skipped.length) {
        message += ` ${skipped.slice(0, 3).join("; ")}${skipped.length > 3 ? "…" : ""}`;
      }
      return {
        ok: false,
        type: "danger",
        message,
      };
    } finally {
      setCombining(false);
    }
  }, [criterionKey, rowsWithProofCount]);

  const saveProofLinkManual = useCallback(async () => {
    const link = (proofLink || "").trim();
    if (!link) return { ok: false, type: "warning", message: "Proof link is empty." };
    const res = await saveProofLink(criterionKey, link);
    if (res?.success) return { ok: true, type: "success", message: "Proof link saved for Excel export." };
    return { ok: false, type: "danger", message: res?.error || "Failed to save proof link." };
  }, [criterionKey, proofLink]);

  const deleteProofLinkManual = useCallback(async () => {
    if (!window.confirm("Remove saved proof link? You can upload a new document after.")) {
      return { ok: false, type: "info", message: "Cancelled." };
    }
    const res = await deleteProofLink(criterionKey);
    if (res?.success) {
      setProofLink("");
      return { ok: true, type: "success", message: "Proof link removed." };
    }
    return { ok: false, type: "danger", message: res?.error || "Failed to delete proof link." };
  }, [criterionKey]);

  return {
    proofLink,
    setProofLink,
    combining,
    rowsWithProofCount,
    totalRecords: (records || []).length,
    combineAllProofs,
    saveProofLinkManual,
    deleteProofLinkManual,
  };
}

/** Upload + merge proof files once for whole criterion (e.g. 1.3.2 — no per-student proof). */
export function useCriterionFileProof(criterionKey) {
  const [proofLink, setProofLink] = useState("");
  const [combining, setCombining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProofLink(criterionKey)
      .then((pl) => {
        if (!cancelled && pl?.link) setProofLink(pl.link);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [criterionKey]);

  const combineUploadedFiles = useCallback(async (fileList) => {
    const files = Array.isArray(fileList) ? fileList : fileList ? Array.from(fileList) : [];
    if (!files.length) {
      return { ok: false, type: "warning", message: "Select one or more proof PDF/image files first." };
    }
    setCombining(true);
    try {
      const res = await uploadEvidence(criterionKey, files);
      if (res?.success && res?.link) {
        const saved = await saveProofLink(criterionKey, res.link);
        const mergedCount = res.combined_count || files.length;
        const pageCount = res.page_count ? `, ${res.page_count} page(s) total` : "";
        const skipped = Array.isArray(res.skipped) ? res.skipped.filter(Boolean) : [];
        if (saved?.success) {
          setProofLink(res.link);
          return {
            ok: true,
            type: skipped.length ? "warning" : "success",
            message: `Combined ${mergedCount} file(s)${pageCount}. Link saved for Excel (one proof column for all rows).${
              skipped.length ? ` Skipped: ${skipped.join("; ")}` : ""
            }`,
          };
        }
        return { ok: true, type: "warning", message: "Files merged but link save failed. Copy link from upload response." };
      }
      const skipped = Array.isArray(res?.skipped) ? res.skipped.filter(Boolean) : [];
      return {
        ok: false,
        type: "danger",
        message: `${res?.error || "Combine failed."}${skipped.length ? ` Skipped: ${skipped.join("; ")}` : ""}`,
      };
    } finally {
      setCombining(false);
    }
  }, [criterionKey]);

  const saveProofLinkManual = useCallback(async () => {
    const link = (proofLink || "").trim();
    if (!link) return { ok: false, type: "warning", message: "Proof link is empty." };
    const res = await saveProofLink(criterionKey, link);
    if (res?.success) return { ok: true, type: "success", message: "Proof link saved." };
    return { ok: false, type: "danger", message: res?.error || "Failed to save proof link." };
  }, [criterionKey, proofLink]);

  const deleteProofLinkManual = useCallback(async () => {
    if (!window.confirm("Remove saved proof link? You can upload a new document after.")) {
      return { ok: false, type: "info", message: "Cancelled." };
    }
    const res = await deleteProofLink(criterionKey);
    if (res?.success) {
      setProofLink("");
      return { ok: true, type: "success", message: "Proof link removed." };
    }
    return { ok: false, type: "danger", message: res?.error || "Failed to delete proof link." };
  }, [criterionKey]);

  return {
    proofLink,
    setProofLink,
    combining,
    combineUploadedFiles,
    saveProofLinkManual,
    deleteProofLinkManual,
  };
}
