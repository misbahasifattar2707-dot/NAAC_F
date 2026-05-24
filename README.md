# METtrack — NAAC Accreditation Portal

Full-stack web application for **NAAC Criteria 1–6** data entry, proof upload, and Excel export.

| Layer | Stack |
|-------|--------|
| **Frontend** | React 18, Vite, React Router, Bootstrap 5 |
| **Backend** | Flask, SQLAlchemy, PostgreSQL |
| **Deploy** | React build served from `backend/static/` by Flask |

---

## Project structure (submission layout)

```text
METtrack-NAAC/
├── frontend/                 # React source (edit UI here)
│   ├── src/
│   │   ├── api/              # API client (apiService.js)
│   │   ├── components/       # Sidebar, Footer, proof widgets
│   │   ├── hooks/            # useCriterionProof
│   │   ├── pages/            # Criteria 1–6 screens
│   │   │   ├── criteria1/    # 6 pages
│   │   │   ├── criteria2/    # 9 pages
│   │   │   ├── criteria3/    # 10 pages
│   │   │   ├── criteria4/    # 3 pages
│   │   │   ├── criteria5/    # 8 pages
│   │   │   └── criteria6/    # 6 pages
│   │   ├── utils/
│   │   ├── App.jsx           # Routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js        # Builds → ../backend/static
│
├── backend/                  # Flask API + serves built React app
│   ├── app.py                # Entry point
│   ├── extensions.py         # db, bcrypt
│   ├── models/models.py      # All DB tables (C1–C6)
│   ├── routes/
│   │   ├── api_routes.py     # REST API + Excel export
│   │   ├── criteria346_merge.py  # Criteria 3–6 helpers
│   │   └── routes.py         # Legacy HTML routes (optional)
│   ├── scripts/
│   │   ├── setup_merged_project.py  # First-time DB + seeds
│   │   ├── init_db.py
│   │   └── seeds.py
│   ├── static/               # Production frontend build + uploads
│   └── requirements.txt
│
├── setup.bat                 # First-time install (Windows)
├── start-app.bat             # Build + run single URL (port 5000)
├── run-project.bat           # Dev: backend + Vite (ports 5000 + 5174)
├── .env.example
└── README.md
```

> **Note:** `naac-accrediation-system-main/` is the original team reference folder used during merge. The runnable project is **`frontend/` + `backend/`** only.

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **PostgreSQL** with database `naac_db` created
- Default DB URL: `postgresql://postgres:root@localhost/naac_db`

---

## Quick start (Windows)

### 1. First-time setup

```bat
setup.bat
```

This creates a virtual environment, installs Python/npm dependencies, initializes the database, and builds the frontend.

### 2. Run the application

**Option A — Single URL (recommended for demo/submission):**

```bat
start-app.bat
```

Opens **http://localhost:5000** (Flask serves API + React).

**Option B — Development (hot reload on frontend):**

```bat
run-project.bat
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:5174 (proxies `/api` to backend)

---

## Manual setup

### Backend

```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\pip install -r requirements.txt
..\.venv\Scripts\python scripts\setup_merged_project.py
..\.venv\Scripts\python app.py
```

### Frontend

```powershell
cd frontend
npm install
npm run build          # output → backend/static/
npm run dev            # optional dev server
```

---

## Features

- **Criteria 1–6** — 42 metric pages with CRUD APIs
- **Criterion proof** — upload/combine PDFs → Excel proof column on every export
- **Excel export** — NAAC-style sheets with merged Document / Proof Link column
- **Role-based login** — department/program session context

---

## Default login

Use credentials configured in your database (`user_lookup` table). Register via `/register` if seeds include an admin user.

---

## Team

Merged project: **Criteria 1 & 2** (original) + **Criteria 3–6** (team integration).

---

## License

Academic / institutional use — MET Bhujbal Knowledge City, Nashik.
