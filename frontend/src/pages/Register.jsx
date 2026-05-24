import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          user_identifier: userId, 
          department, 
          year, 
          password, 
          role 
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Account created successfully! Please login.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Failed to create account.");
      }
    } catch (err) {
      setError("Network error. Could not connect to API.");
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
          <button className="sidebar-link" onClick={() => navigate("/login")}>
            <i className="bi bi-box-arrow-in-right"></i> Login
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="auth-main">
        <header className="auth-header">
          <h4 style={{ color: "#dc3545", fontWeight: 700, margin: 0 }}>Create a new account</h4>
        </header>

        <div className="auth-center">
          <div className="card border-0 shadow-lg p-5 fade-in auth-card">
            <div className="text-center mb-4">
              <div className="auth-icon-badge">
                <i className="bi bi-person-plus-fill" style={{ fontSize: "1.8rem", color: "#fff" }}></i>
              </div>
              <h3 className="fw-bold">Register</h3>
              <p className="text-muted small">Access the portal by registering an account.</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {success && <div className="alert alert-success py-2 small">{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label-custom">Role</label>
                <select className="form-select form-control-lg" value={role} onChange={e => setRole(e.target.value)}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Username</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter username" value={username}
                  onChange={(e) => setUsername(e.target.value)} required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">User ID</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter your ID (e.g., PRN, Employee ID)" value={userId}
                  onChange={(e) => setUserId(e.target.value)} required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Department</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter department" value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Year</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter year" value={year}
                  onChange={(e) => setYear(e.target.value)}
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

              <button type="submit" className="btn btn-danger w-100 py-3 fw-bold text-uppercase">
                Register Account
              </button>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
