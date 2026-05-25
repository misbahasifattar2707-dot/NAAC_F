# Project Structure — METtrack NAAC Portal

This is the **official layout** for client delivery. Only the folders below belong in the submission zip.

```text
METtrack-NAAC/
│
├── backend/                         # Flask API + production build
│   ├── app.py                       # Application entry point
│   ├── extensions.py                # Database + bcrypt
│   ├── config.py
│   ├── requirements.txt
│   │
│   ├── models/
│   │   └── models.py                # All database tables (Criteria 1–6)
│   │
│   ├── routes/
│   │   ├── api_routes.py            # REST API, Excel export, proof links
│   │   ├── criteria346_merge.py     # Criteria 3–6 helpers
│   │   └── routes.py                # Legacy HTML routes
│   │
│   ├── scripts/
│   │   ├── setup_merged_project.py  # First-time DB setup + seeds
│   │   ├── init_db.py
│   │   ├── seeds.py
│   │   └── test_all_criteria_basic.py
│   │
│   ├── static/                      # React production build + uploads
│   │   ├── index.html
│   │   ├── assets/
│   │   └── uploads/                 # Proof PDFs (runtime)
│   │
│   ├── templates/                   # Fallback HTML (optional)
│   └── docs/                        # Backend technical notes
│
├── frontend/                        # React source (edit UI here)
│   ├── src/
│   │   ├── api/                     # apiService.js — all API calls
│   │   ├── components/              # Sidebar, forms, proof widgets
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── criteria1/           # 6 pages
│   │   │   ├── criteria2/           # 9 pages
│   │   │   ├── criteria3/           # 10 pages
│   │   │   ├── criteria4/           # 3 pages
│   │   │   ├── criteria5/           # 8 pages
│   │   │   └── criteria6/           # 6 pages
│   │   ├── utils/
│   │   ├── App.jsx                  # Routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js               # Builds → ../backend/static
│
├── docs/                            # Client & evaluator documentation
│   ├── SUBMISSION.md
│   ├── PROJECT_STRUCTURE.md         # (this file)
│   ├── CLIENT_SETUP.md
│   └── SAMPLE_INPUTS.md
│
├── scripts/
│   └── create_submission_zip.py     # Builds client zip package
│
├── setup.bat                        # First-time install (Windows)
├── start-app.bat                    # Run app — http://localhost:5000
├── run-project.bat                  # Dev mode (backend + Vite)
├── create-submission-zip.bat        # Create METtrack-NAAC-Submission.zip
├── .env.example
├── .gitignore
└── README.md
```

## What is NOT part of the submission

| Item | Reason |
|------|--------|
| `.venv/` | Created locally by `setup.bat` |
| `frontend/node_modules/` | Created by `npm install` |
| `__pycache__/`, `*.pyc` | Python cache |
| `.vscode/`, `.git/` | Developer-only |
| `naac-accrediation-system-main/` | Old team reference copy |
| `debug.log` | Local log file |

## How the app runs

```text
Browser  →  Flask (backend/app.py :5000)
              ├── /api/*        JSON REST API
              ├── /assets/*     React JS/CSS (from backend/static)
              └── /uploads/*    Proof documents
```

Frontend is built with Vite and copied into `backend/static/` so the client runs **one URL** only.
