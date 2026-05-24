import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getAcademicYears, getProgrammes } from "../api/apiService";
import { DropdownWithAddMore } from "../components/forms";
import { programmeDisplayLabel, formatProgrammeOptionLabel } from "../utils/programmeDisplay";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [program, setProgram] = useState("MCA");
  const [programCode, setProgramCode] = useState("515124110");
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024-25");

  useEffect(() => {
    Promise.all([getAcademicYears(), getProgrammes()]).then(([years, progs]) => {
      setAcademicYears(years);
      if (years.length > 0) setSelectedYear(years[years.length - 1]);
      const list = progs || [];
      setPrograms(list);
      const mca = list.find((p) => p.code === "515124110" || programmeDisplayLabel(p) === "MCA");
      if (mca) {
        setProgram(programmeDisplayLabel(mca));
        setProgramCode(mca.code);
      } else if (list[0]) {
        setProgram(programmeDisplayLabel(list[0]));
        setProgramCode(list[0].code);
      }
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, academic_year: selectedYear })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = {
          ...data.user,
          program,
          programCode,
          department: data.user?.department || program,
        };
        localStorage.setItem("mettrack_user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setError("Network error. Could not connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const roles = ["Super Admin", "Admin", "Staff"];

  return (
    <div className="auth-shell">
      {/* Left sidebar */}
      <div className="auth-sidebar">
        <div className="auth-brand">
          MET<span style={{ color: "#dc3545" }}>track</span>
        </div>
        <nav style={{ padding: "1rem 0" }}>
          <button className="sidebar-link" onClick={() => navigate("/")}>
            <i className="bi bi-house-door"></i> Home
          </button>
          <button className="sidebar-link" onClick={() => navigate("/register")}>
            <i className="bi bi-person-plus"></i> Register
          </button>
          {roles.map((r) => (
            <button
              key={r}
              className={`sidebar-link ${role === r ? "active" : ""}`}
              onClick={() => { setRole(r); setError(""); }}
            >
              <i className={`bi bi-${r === "Super Admin" ? "shield-lock" : r === "Admin" ? "person-badge" : "people"}`}></i>
              {r}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="auth-main">
        <header className="auth-header">
          <h4 style={{ color: "#dc3545", fontWeight: 700, margin: 0 }}>{role} Portal Access</h4>
        </header>

        <div className="auth-center">
          <div className="card border-0 shadow-lg p-5 fade-in auth-card">
            <div className="text-center mb-4">
              <div className="auth-icon-badge">
                <i className="bi bi-lock-fill" style={{ fontSize: "1.8rem", color: "#fff" }}></i>
              </div>
              <h3 className="fw-bold">{role} Login</h3>
              <p className="text-muted small">Enter your credentials to access the portal</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <DropdownWithAddMore
                  label="Program"
                  className=""
                  selectClassName="form-select form-control-lg"
                  value={programCode}
                  onChange={(code) => {
                    setProgramCode(code);
                    const p = programs.find((x) => x.code === code);
                    setProgram(p ? programmeDisplayLabel(p) : "");
                  }}
                  options={programs}
                  optionValue={(p) => p.code}
                  optionLabel={(p) => formatProgrammeOptionLabel(p)}
                  placeholder="Select programme"
                  required
                  addMoreMode="programme"
                  programmeCollectDepartment
                  programmeValueField="code"
                  onAfterAdd={() =>
                    getProgrammes().then((list) => {
                      setPrograms(list || []);
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <DropdownWithAddMore
                  label="Academic Year"
                  selectClassName="form-select form-control-lg"
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={academicYears.map((y) => ({ value: y, label: y }))}
                  optionValue={(o) => o.value}
                  optionLabel={(o) => o.label}
                  placeholder="Select Year"
                  required
                  addMoreMode="lookup"
                  lookupKey="academic-years"
                  onAfterAdd={() =>
                    getAcademicYears().then((years) => {
                      setAcademicYears(years);
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label-custom">Username</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter username" value={username}
                  onChange={(e) => setUsername(e.target.value)} required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Password</label>
                <input
                  type="password" className="form-control form-control-lg"
                  placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" className="btn btn-danger w-100 py-3 fw-bold text-uppercase" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Logging in…</>
                ) : "Login to Portal"}
              </button>
              
              <div className="text-center mt-4">
                <span className="text-muted">Don't have an account? </span>
                <a href="/register" className="text-danger fw-bold text-decoration-none">Register here</a>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
