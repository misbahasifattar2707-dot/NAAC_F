import { uploadEvidence } from "../api/apiService";

export async function attachProofToPayload(criterion, file, payload = {}) {
  if (!file) return payload;
  const up = await uploadEvidence(criterion, [file]);
  if (!up?.success || !up?.link) {
    throw new Error(up?.error || "Could not upload proof file.");
  }
  const link = up.link;
  return {
    ...payload,
    documentPath: link,
    docLink: link,
    proof_links: link,
    proof_document: link,
  };
}
