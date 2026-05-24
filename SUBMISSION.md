# Submission Guide — METtrack NAAC Portal

## What to submit

Submit these folders/files as your **final merged project**:

| Include | Description |
|---------|-------------|
| `frontend/` | React source code |
| `backend/` | Flask API + built static app |
| `README.md` | Main documentation |
| `setup.bat`, `start-app.bat`, `run-project.bat` | Windows run scripts |
| `.env.example` | Database config template |
| `.gitignore` | Ignore rules |

**Optional:** `naac-accrediation-system-main/` — team reference only; not required to run the app.

**Do not submit:** `.venv/`, `frontend/node_modules/`, `__pycache__/`, `debug.log`

---

## Before submission checklist

- [ ] PostgreSQL database `naac_db` created and seeded (`setup.bat` or `setup_merged_project.py`)
- [ ] `npm run build` completed — `backend/static/index.html` exists
- [ ] App opens at http://localhost:5000
- [ ] Dashboard shows Criteria 1–6
- [ ] Sample Excel export works (e.g. Criteria 1.1)
- [ ] Proof upload + combine works on at least one page

---

## Evaluator quick run

1. Install Python 3.11+, Node 18+, PostgreSQL  
2. Create database: `CREATE DATABASE naac_db;`  
3. Double-click **`setup.bat`** (or follow README manual steps)  
4. Double-click **`start-app.bat`**  
5. Open http://localhost:5000  

---

## Architecture summary

```text
Browser  →  Flask (backend/app.py)
              ├── /api/*     REST JSON API
              ├── /static/*  React build (frontend)
              └── /uploads/* Proof PDFs
```

Frontend dev build target: `backend/static/` via Vite (`frontend/vite.config.js`).

---

## Criteria coverage

| Criteria | Pages | Backend module |
|----------|-------|----------------|
| 1 | 6 | `api_routes.py` |
| 2 | 9 | `api_routes.py` |
| 3 | 10 | `criteria346_merge.py` |
| 4 | 3 | `criteria346_merge.py` |
| 5 | 8 | `criteria346_merge.py` |
| 6 | 6 | `criteria346_merge.py` |

**Total:** 42 UI pages, 43 API criterion keys.
