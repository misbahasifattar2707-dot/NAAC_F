import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer  from "../components/Footer";

const CRITERIA_GROUPS = [
  {
    key: "1", label: "Criteria 1", subtitle: "Curricular Aspects",
    color: "#dc3545",
    cards: [
      { label: "1.1",   path: "/criteria1/1-1",   color: "#dc3545", icon: "bi-book",         desc: "Courses Offered"        },
      { label: "1.2.1", path: "/criteria1/1-2-1", color: "#ffc107", icon: "bi-check-circle", desc: "CBCS Programs"          },
      { label: "1.1.3", path: "/criteria1/1-1-3", color: "#0d6efd", icon: "bi-person",       desc: "Teacher Participation"  },
      { label: "1.2.2", path: "/criteria1/1-2-2", color: "#fd7e14", icon: "bi-card-list",    desc: "Programs Recorded"      },
      { label: "1.3.2", path: "/criteria1/1-3-2", color: "#20c997", icon: "bi-diagram-3",    desc: "Experiential Learning"  },
      { label: "1.3.3", path: "/criteria1/1-3-3", color: "#6f42c1", icon: "bi-briefcase",    desc: "Project / Internship"   },
    ],
  },
  {
    key: "2", label: "Criteria 2", subtitle: "Teaching-Learning and Evaluation",
    color: "#b31d1d",
    cards: [
      { label: "2.1",   path: "/criteria2/2-1",   color: "#b31d1d", icon: "bi-people-fill",    desc: "Students During Year"     },
      { label: "2.1.1", path: "/criteria2/2-1-1", color: "#e11d48", icon: "bi-journal-text",   desc: "Enrolment Number"         },
      { label: "2.2",   path: "/criteria2/2-2",   color: "#0369a1", icon: "bi-shield-check",   desc: "Reserved Category Seats"  },
      { label: "2.1.2", path: "/criteria2/2-1-2", color: "#059669", icon: "bi-bar-chart-fill", desc: "Seats vs Admitted"        },
      { label: "2.3",   path: "/criteria2/2-3",   color: "#7c3aed", icon: "bi-box-arrow-right", desc: "Outgoing Students"       },
      { label: "2.3.3", path: "/criteria2/2-3-3", color: "#be123c", icon: "bi-person-lines-fill", desc: "Mentor-Mentee Ratio"    },
      { label: "2.4.1", path: "/criteria2/2-4-1", color: "#0891b2", icon: "bi-person-badge",   desc: "Full-time Teachers"       },
      { label: "2.4.2", path: "/criteria2/2-4-2", color: "#0d9488", icon: "bi-award-fill",     desc: "Teachers with Ph.D./NET"  },
      { label: "2.6.3", path: "/criteria2/2-6-3", color: "#d97706", icon: "bi-graph-up-arrow", desc: "Pass Percentage"          },
    ],
  },
  {
    key: "3", label: "Criteria 3", subtitle: "Research, Innovations and Extension",
    color: "#166534",
    cards: [
      { label: "3.1",       path: "/criteria3/3-1",     color: "#166534", icon: "bi-person-workspace",  desc: "Full-Time Teachers"          },
      { label: "3.2",       path: "/criteria3/3-2",     color: "#15803d", icon: "bi-postcard",          desc: "Sanctioned Posts"             },
      { label: "3.1.1&3.1.2", path: "/criteria3/3-1-1-2", color: "#16a34a", icon: "bi-bank",           desc: "Research Grants"              },
      { label: "3.1.3",    path: "/criteria3/3-1-3",   color: "#22c55e", icon: "bi-easel2",             desc: "Seminars & Workshops"         },
      { label: "3.2.1",    path: "/criteria3/3-2-1",   color: "#4ade80", icon: "bi-journal-richtext",   desc: "Papers in UGC Journals"       },
      { label: "3.2.2",    path: "/criteria3/3-2-2",   color: "#166534", icon: "bi-book-half",          desc: "Books & Chapters"             },
      { label: "3.3.2",    path: "/criteria3/3-3-2",   color: "#15803d", icon: "bi-trophy",             desc: "Extension Awards"             },
      { label: "3.3.3&3.3.4", path: "/criteria3/3-3-3-4", color: "#16a34a", icon: "bi-people",         desc: "Outreach & Participation"     },
      { label: "3.4.1",    path: "/criteria3/3-4-1",   color: "#22c55e", icon: "bi-diagram-3",          desc: "Collaborations / Linkages"    },
      { label: "3.4.2",    path: "/criteria3/3-4-2",   color: "#4ade80", icon: "bi-file-earmark-text",  desc: "Functional MoUs"              },
    ],
  },
  {
    key: "4", label: "Criteria 4", subtitle: "Infrastructure and Learning Resources",
    color: "#0369a1",
    cards: [
      { label: "4.1.3",       path: "/criteria4/4-1-3", color: "#0369a1", icon: "bi-display",          desc: "ICT Facilities"              },
      { label: "4.1.4 & 4.4.1", path: "/criteria4/4-1-4", color: "#0891b2", icon: "bi-currency-rupee",  desc: "Infrastructure Expenditure"  },
      { label: "4.2.2 & 4.2.3", path: "/criteria4/4-2-2", color: "#0e7490", icon: "bi-book-half",       desc: "Library Resources"           },
    ],
  },
  {
    key: "5", label: "Criteria 5", subtitle: "Student Support and Progression",
    color: "#7c3aed",
    cards: [
      { label: "5.1.1", path: "/criteria5/5-1-1", color: "#7c3aed", icon: "bi-award",              desc: "Scholarships & Freeships"     },
      { label: "5.1.3", path: "/criteria5/5-1-3", color: "#6d28d9", icon: "bi-tools",              desc: "Skills Enhancement"           },
      { label: "5.1.4", path: "/criteria5/5-1-4", color: "#8b5cf6", icon: "bi-briefcase",          desc: "Career Counseling"            },
      { label: "5.2.1", path: "/criteria5/5-2-1", color: "#7c3aed", icon: "bi-building",           desc: "Placements"                   },
      { label: "5.2.2", path: "/criteria5/5-2-2", color: "#9333ea", icon: "bi-mortarboard",        desc: "Higher Education"             },
      { label: "5.2.3", path: "/criteria5/5-2-3", color: "#a855f7", icon: "bi-patch-check",        desc: "Qualifying Exams"             },
      { label: "5.3.1", path: "/criteria5/5-3-1", color: "#7c3aed", icon: "bi-trophy",             desc: "Awards & Medals"              },
      { label: "5.3.3", path: "/criteria5/5-3-3", color: "#6d28d9", icon: "bi-balloon-heart",      desc: "Sports & Cultural Events"     },
    ],
  },
  {
    key: "6", label: "Criteria 6", subtitle: "Governance, Leadership and Management",
    color: "#0f766e",
    cards: [
      { label: "6.2.3", path: "/criteria6/6-2-3", color: "#0f766e", icon: "bi-laptop",          desc: "e-Governance Implementation" },
      { label: "6.3.2", path: "/criteria6/6-3-2", color: "#0d9488", icon: "bi-person-check",    desc: "Financial Support-Conferences" },
      { label: "6.3.3", path: "/criteria6/6-3-3", color: "#0891b2", icon: "bi-mortarboard",     desc: "Professional Dev. Programs"  },
      { label: "6.3.4", path: "/criteria6/6-3-4", color: "#0369a1", icon: "bi-journal-bookmark", desc: "FDP - Faculty Development"     },
      { label: "6.4.2", path: "/criteria6/6-4-2", color: "#1d4ed8", icon: "bi-currency-rupee",  desc: "Non-Govt Funds / Grants"      },
      { label: "6.5.3", path: "/criteria6/6-5-3", color: "#7c3aed", icon: "bi-patch-check-fill", desc: "Quality Assurance Initiatives" },
    ],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("mettrack_user") || '{"username":"User","role":"Admin"}');

  const StatCard = ({ card }) => (
    <div className="col-md-4 col-lg-3">
      <div
        className="card border-0 shadow-sm h-100 fade-in dashboard-card"
        style={{ borderBottom: `4px solid ${card.color}` }}
        onClick={() => navigate(card.path)}
      >
        <div className="card-body text-center p-4">
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
            <i className={`bi ${card.icon}`} style={{ fontSize: "1.4rem", color: card.color }}></i>
          </div>
          <p className="text-muted text-uppercase mb-1" style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1 }}>Criteria {card.label}</p>
          <p className="mb-0 text-muted small">{card.desc}</p>
          <button className="btn btn-sm btn-link text-decoration-none mt-2 p-0 small fw-semibold" style={{ color: card.color }}>View Details →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar activePage="dashboard" />
      <div className="main-content">

        {/* Header */}
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>System Overview</p>
            <h4 style={{ margin: 0, color: "#1a1a2e", fontWeight: 700 }}>Academic Year {user.academic_year || '2024-25'}</h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>{user.username}</p>
              <small className="text-danger fw-semibold me-2">{user.role}</small>
              <small className="text-muted border-start ps-2">{user.department || 'General Dept'}</small>
              <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: 2 }}>
                Program: {user.program || 'MCA'} ({user.programCode || '515124110'})
              </div>
            </div>
            <div style={{ background: "#f4f6f9", borderRadius: "50%", padding: "0.5rem", border: "1px solid #dee2e6" }}>
              <i className="bi bi-person-circle" style={{ fontSize: "1.8rem", color: "#6c757d" }}></i>
            </div>
          </div>
        </header>

        <div className="container-fluid p-4">

          {/* Render each criteria group */}
          {CRITERIA_GROUPS.map(group => (
            <div key={group.key} className="mb-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ background: group.color, color: "white", borderRadius: 8, padding: "2px 12px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                  {group.label}
                </span>
                <span className="text-muted small">{group.subtitle}</span>
              </div>
              <div className="row g-4">
                {group.cards.map(card => <StatCard key={card.label} card={card} />)}
              </div>
            </div>
          ))}

          {/* Welcome Banner */}
          <div className="card border-0 shadow-sm p-5 fade-in" style={{ borderRadius: 20 }}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2rem", color: "#1a1a2e", marginBottom: "1rem" }}>
                  Institutional Intelligence
                </h2>
                <p className="text-muted" style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  Welcome to the central node for NAAC Documentation at MET Bhujbal Knowledge City.
                  Use the sidebar to navigate through specific criteria metrics and data management modules.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn btn-danger px-4 py-2 fw-bold rounded-pill" onClick={() => navigate("/criteria1/1-1")}>
                    Start with Criteria 1
                  </button>
                  <button className="btn btn-outline-secondary px-4 py-2 rounded-pill" onClick={() => navigate("/criteria2/2-1")}>
                    Go to Criteria 2
                  </button>
                  <button className="btn btn-outline-success px-4 py-2 rounded-pill" onClick={() => navigate("/criteria3/3-1")}>
                    Go to Criteria 3
                  </button>
                  <button className="btn btn-outline-primary px-4 py-2 rounded-pill" onClick={() => navigate("/criteria4/4-1-3")}>
                    Go to Criteria 4
                  </button>
                  <button className="btn btn-outline-secondary px-4 py-2 rounded-pill" onClick={() => navigate("/criteria5/5-1-1")}>
                    Go to Criteria 5
                  </button>
                  <button className="btn btn-outline-success px-4 py-2 rounded-pill" onClick={() => navigate("/criteria6/6-2-3")}>
                    Go to Criteria 6
                  </button>
                </div>
              </div>
              <div className="col-md-4 text-center d-none d-md-block">
                <i className="bi bi-shield-check" style={{ fontSize: "9rem", color: "#dc3545", opacity: 0.1 }}></i>
              </div>
            </div>
            <div className="pt-4 mt-4 border-top">
              <p className="small text-uppercase fw-bold text-muted mb-0" style={{ letterSpacing: 2, fontSize: "0.72rem" }}>
                MET Bhujbal Knowledge City, Nashik
              </p>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  );
}
