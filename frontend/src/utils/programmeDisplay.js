/**
 * Degree/programme label for UI (e.g. MCA), not semester-style rows like FYMCA-SEM-I.
 * Mirrors backend `_program_display_name`. Objects from GET /api/programmes use { code, name, department?, display_name? }.
 */
export function programmeDisplayLabel(p) {
  if (!p) return "";
  const dn = String(p.display_name ?? "").trim();
  if (dn) return dn;
  const dep = String(p.department ?? "").trim();
  if (dep) return dep;
  const code = String(p.code ?? "").trim().toUpperCase();
  const rawName = String(p.name ?? "").trim();
  const compact = rawName.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  if (code === "515124110" || code === "MCA") return "MCA";
  if (compact.includes("FYMCA") || (compact.includes("MCA") && !compact.includes("MBA"))) return "MCA";
  return rawName;
}

export function formatProgrammeOptionLabel(p) {
  if (!p) return "";
  const code = p.code != null ? String(p.code) : "";
  return `${programmeDisplayLabel(p)} (${code})`;
}
