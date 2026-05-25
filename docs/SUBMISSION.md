# Submission Checklist — METtrack NAAC Portal

Use this before sending the zip to the client or evaluator.

---

## Create the zip file

Double-click:

```bat
create-submission-zip.bat
```

This creates **`dist/METtrack-NAAC-Submission.zip`** containing only the files the client needs.

---

## What is inside the zip

| Included | Purpose |
|----------|---------|
| `backend/` | Flask API, models, scripts, built React app |
| `frontend/` | React source code |
| `docs/` | Setup guide, structure, sample inputs |
| `setup.bat`, `start-app.bat`, `run-project.bat` | Easy Windows run |
| `.env.example` | Database configuration template |
| `README.md` | Project overview |

---

## What is excluded (automatically)

- `.venv/` — virtual environment (recreated by setup)
- `frontend/node_modules/` — npm packages (reinstalled by setup)
- `__pycache__/`, `*.pyc` — Python cache
- `.git/`, `.vscode/` — developer tools
- `naac-accrediation-system-main/` — old reference copy
- `debug.log`, OneNote files

---

## Pre-submission checklist

- [ ] Run `create-submission-zip.bat` successfully
- [ ] Extract zip to a **new folder** and run `setup.bat` — no errors
- [ ] Run `start-app.bat` — app opens at http://localhost:5000
- [ ] Dashboard shows **Criteria 1 through 6**
- [ ] Login and add a sample record on one page
- [ ] Excel export downloads for at least one criterion
- [ ] Proof upload works on at least one page

---

## Evaluator quick start (inside the zip)

1. Install Python 3.11+, Node 18+, PostgreSQL  
2. `CREATE DATABASE naac_db;`  
3. Extract zip → double-click **`setup.bat`**  
4. Double-click **`start-app.bat`**  
5. Open **http://localhost:5000**

Full details: see **`docs/CLIENT_SETUP.md`**

---

## Criteria coverage

| Criteria | UI pages | Backend |
|----------|----------|---------|
| 1 | 6 | `backend/routes/api_routes.py` |
| 2 | 9 | `backend/routes/api_routes.py` |
| 3 | 10 | `backend/routes/criteria346_merge.py` |
| 4 | 3 | `backend/routes/criteria346_merge.py` |
| 5 | 8 | `backend/routes/criteria346_merge.py` |
| 6 | 6 | `backend/routes/criteria346_merge.py` |

**Total:** 42 pages, 43 API criterion keys.

---

## Team / institution

MET Bhujbal Knowledge City, Nashik — NAAC accreditation data portal (Criteria 1–6).
