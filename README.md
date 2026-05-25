# METtrack — NAAC Accreditation Portal

Full-stack web application for **NAAC Criteria 1–6** data entry, proof upload, and Excel export.

| Layer | Stack |
|-------|--------|
| **Frontend** | React 18, Vite, React Router, Bootstrap 5 |
| **Backend** | Flask, SQLAlchemy, PostgreSQL |
| **Deploy** | React build served from `backend/static/` by Flask |

---

## Project structure (client submission layout)

```text
METtrack-NAAC/
├── backend/                  # Flask API + production build
├── frontend/                 # React source code
├── docs/                     # Client setup, structure, sample inputs
├── scripts/                  # Submission zip builder
├── setup.bat                 # First-time install
├── start-app.bat             # Run app (http://localhost:5000)
├── run-project.bat           # Dev mode (backend + Vite)
├── create-submission-zip.bat # Build client zip → dist/
├── .env.example
└── README.md
```

Full tree: see **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

---

## For the client — quick start

1. Extract **`METtrack-NAAC-Submission.zip`**
2. Double-click **`setup.bat`** (first time only)
3. Double-click **`start-app.bat`**
4. Open **http://localhost:5000**

Detailed guide: **[docs/CLIENT_SETUP.md](docs/CLIENT_SETUP.md)**

---

## For developers — create submission zip

```bat
create-submission-zip.bat
```

Output: **`dist/METtrack-NAAC-Submission.zip`** (ready to send to client)

Checklist: **[docs/SUBMISSION.md](docs/SUBMISSION.md)**

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **PostgreSQL** with database `naac_db` created
- Default DB URL: `postgresql://postgres:root@localhost/naac_db`

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
npm run dev            # optional dev server on :5174
```

---

## Features

- **Criteria 1–6** — 42 metric pages with CRUD APIs
- **Criterion proof** — upload/combine PDFs → Excel proof column on every export
- **Excel export** — NAAC-style sheets with merged Document / Proof Link column
- **Role-based login** — department/program session context

---

## Testing

Sample inputs: **[docs/SAMPLE_INPUTS.md](docs/SAMPLE_INPUTS.md)**

Automated smoke test (43 criteria):

```powershell
cd backend
..\.venv\Scripts\python.exe scripts\test_all_criteria_basic.py
```

---

## Team

Merged project: **Criteria 1 & 2** (original) + **Criteria 3–6** (team integration).

**MET Bhujbal Knowledge City, Nashik** — academic / institutional use.
