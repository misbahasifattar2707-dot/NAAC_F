// ============================================================
// Sidebar.jsx — Reusable sidebar used on ALL pages
// Pass activePage prop to highlight the current link
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();

  const [c1Open, setC1Open] = useState(["1_1","1_1_3","1_2_1","1_2_2","1_3_2","1_3_3"].includes(activePage));
  const [c2Open, setC2Open] = useState(["2_1","2_1_1","2_2","2_1_2","2_3","2_3_3","2_4_1","2_4_2","2_6_3"].includes(activePage));
  const [c3Open, setC3Open] = useState(["3_1","3_2","3_1_1_2","3_1_3","3_2_1","3_2_2","3_3_2","3_3_3_4","3_4_1","3_4_2"].includes(activePage));
  const [c4Open, setC4Open] = useState(["4_1_3","4_1_4","4_2_2"].includes(activePage));
  const [c5Open, setC5Open] = useState(["5_1_1","5_1_3","5_1_4","5_2_1","5_2_2","5_2_3","5_3_1","5_3_3"].includes(activePage));
  const [c6Open, setC6Open] = useState(["6_2_3","6_3_2","6_3_3","6_3_4","6_4_2","6_5_3"].includes(activePage));

  const handleLogout = () => {
    localStorage.removeItem("mettrack_user");
    navigate("/");
  };

  const criteria1Links = [
    { path: "/criteria1/1-1",   label: "1.1 Courses Offered",            key: "1_1"   },
    { path: "/criteria1/1-2-1", label: "1.2.1 CBCS System",              key: "1_2_1" },
    { path: "/criteria1/1-1-3", label: "1.1.3 Teacher Participation",    key: "1_1_3" },
    { path: "/criteria1/1-2-2", label: "1.2.2 & 1.2.3 Program Details", key: "1_2_2" },
    { path: "/criteria1/1-3-2", label: "1.3.2 Experiential Learning",    key: "1_3_2" },
    { path: "/criteria1/1-3-3", label: "1.3.3 Research Projects",        key: "1_3_3" },
  ];

  const criteria2Links = [
    { path: "/criteria2/2-1",   label: "2.1 Students During Year",       key: "2_1"   },
    { path: "/criteria2/2-1-1", label: "2.1.1 Enrolment Number",         key: "2_1_1" },
    { path: "/criteria2/2-2",   label: "2.2 Reserved Category Seats",    key: "2_2"   },
    { path: "/criteria2/2-1-2", label: "2.1.2 Reserved Seats & Admitted",key: "2_1_2" },
    { path: "/criteria2/2-3",   label: "2.3 Outgoing Students",          key: "2_3"   },
    { path: "/criteria2/2-3-3", label: "2.3.3 Mentor-Mentee Ratio",      key: "2_3_3" },
    { path: "/criteria2/2-4-1", label: "2.4.1 Full-time Teachers",       key: "2_4_1" },
    { path: "/criteria2/2-4-2", label: "2.4.2 Teachers with Ph.D./NET",  key: "2_4_2" },
    { path: "/criteria2/2-6-3", label: "2.6.3 Pass Percentage",          key: "2_6_3" },
  ];

  const criteria3Links = [
    { path: "/criteria3/3-1",     label: "3.1 Full-Time Teachers",        key: "3_1"     },
    { path: "/criteria3/3-2",     label: "3.2 Sanctioned Posts",          key: "3_2"     },
    { path: "/criteria3/3-1-1-2",label: "3.1.1 & 3.1.2 Research Grants", key: "3_1_1_2" },
    { path: "/criteria3/3-1-3",  label: "3.1.3 Seminars/Workshops",      key: "3_1_3"   },
    { path: "/criteria3/3-2-1",  label: "3.2.1 Papers (UGC Journals)",   key: "3_2_1"   },
    { path: "/criteria3/3-2-2",  label: "3.2.2 Books & Chapters",        key: "3_2_2"   },
    { path: "/criteria3/3-3-2",  label: "3.3.2 Extension Awards",        key: "3_3_2"   },
    { path: "/criteria3/3-3-3-4",label: "3.3.3 & 3.3.4 Outreach",       key: "3_3_3_4" },
    { path: "/criteria3/3-4-1",  label: "3.4.1 Collaborations",          key: "3_4_1"   },
    { path: "/criteria3/3-4-2",  label: "3.4.2 MoUs",                    key: "3_4_2"   },
  ];

  const criteria4Links = [
    { path: "/criteria4/4-1-3", label: "4.1.3 ICT Facilities",           key: "4_1_3" },
    { path: "/criteria4/4-1-4", label: "4.1.4 & 4.4.1 Expenditure",     key: "4_1_4" },
    { path: "/criteria4/4-2-2", label: "4.2.2 & 4.2.3 E-Resources",     key: "4_2_2" },
  ];

  const criteria5Links = [
    { path: "/criteria5/5-1-1", label: "5.1.1 Scholarships",             key: "5_1_1" },
    { path: "/criteria5/5-1-3", label: "5.1.3 Skills Enhancement",       key: "5_1_3" },
    { path: "/criteria5/5-1-4", label: "5.1.4 Career Counseling",        key: "5_1_4" },
    { path: "/criteria5/5-2-1", label: "5.2.1 Placements",               key: "5_2_1" },
    { path: "/criteria5/5-2-2", label: "5.2.2 Higher Education",         key: "5_2_2" },
    { path: "/criteria5/5-2-3", label: "5.2.3 Qualifying Exams",         key: "5_2_3" },
    { path: "/criteria5/5-3-1", label: "5.3.1 Awards & Medals",          key: "5_3_1" },
    { path: "/criteria5/5-3-3", label: "5.3.3 Sports & Cultural Events", key: "5_3_3" },
  ];

  const criteria6Links = [
    { path: "/criteria6/6-2-3", label: "6.2.3 e-Governance",             key: "6_2_3" },
    { path: "/criteria6/6-3-2", label: "6.3.2 Financial Support (Conf.)", key: "6_3_2" },
    { path: "/criteria6/6-3-3", label: "6.3.3 Training Programs",         key: "6_3_3" },
    { path: "/criteria6/6-3-4", label: "6.3.4 FDP (Online/F2F)",          key: "6_3_4" },
    { path: "/criteria6/6-4-2", label: "6.4.2 Non-Govt Funds/Grants",     key: "6_4_2" },
    { path: "/criteria6/6-5-3", label: "6.5.3 Quality Assurance",         key: "6_5_3" },
  ];

  const CriteriaGroup = ({ label, links, open, setOpen }) => (
    <>
      <button className="sidebar-criteria-toggle" onClick={() => setOpen(!open)}>
        <span><i className="bi bi-journals me-2"></i>{label}</span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} small`}></i>
      </button>
      {open && (
        <ul className="sidebar-submenu-list open">
          {links.map(link => (
            <li key={link.key}>
              <button
                className={`sidebar-link sidebar-submenu ${activePage === link.key ? "active" : ""}`}
                onClick={() => navigate(link.path)}
              >
                <i className="bi bi-dot"></i> {link.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        MET<span>track</span>
      </div>

      <nav style={{ flex: 1, paddingTop: "0.5rem" }}>
        <button
          className={`sidebar-link ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <i className="bi bi-speedometer2"></i> Dashboard Home
        </button>

        <div className="sidebar-section-label">Main Criteria</div>

        <CriteriaGroup label="Criteria 1" links={criteria1Links} open={c1Open} setOpen={setC1Open} />
        <CriteriaGroup label="Criteria 2" links={criteria2Links} open={c2Open} setOpen={setC2Open} />
        <CriteriaGroup label="Criteria 3" links={criteria3Links} open={c3Open} setOpen={setC3Open} />
        <CriteriaGroup label="Criteria 4" links={criteria4Links} open={c4Open} setOpen={setC4Open} />
        <CriteriaGroup label="Criteria 5" links={criteria5Links} open={c5Open} setOpen={setC5Open} />
        <CriteriaGroup label="Criteria 6" links={criteria6Links} open={c6Open} setOpen={setC6Open} />

        <button className="sidebar-link" style={{ opacity: 0.4, cursor: "default" }}>
          <i className="bi bi-journals me-2"></i> Criteria 7
        </button>
      </nav>

      <div style={{ padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: "#ffc107" }}>
          <i className="bi bi-box-arrow-left"></i> Logout
        </button>
      </div>
    </div>
  );
}
