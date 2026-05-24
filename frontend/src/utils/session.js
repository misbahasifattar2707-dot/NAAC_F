function getUser() {
  try {
    return JSON.parse(localStorage.getItem("mettrack_user") || "{}");
  } catch {
    return {};
  }
}

export function getSessionYear() {
  const u = getUser();
  return (u.academic_year || u.year || "").toString().trim();
}

export function getSessionProgramCode() {
  const u = getUser();
  return (u.programCode || u.program_code || "").toString().trim();
}

export function getSessionDept() {
  const u = getUser();
  return (u.department || u.program || "").toString().trim();
}
