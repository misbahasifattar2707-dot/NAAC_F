# METtrack — Backend (Flask)

REST API and production static server for the NAAC portal.

## Structure

```text
backend/
├── app.py                  # Application factory + SPA static serving
├── extensions.py           # SQLAlchemy (db), bcrypt
├── config.py               # Optional config class
├── models/
│   └── models.py           # All ORM models (Criteria 1–6)
├── routes/
│   ├── api_routes.py       # Main API: /api/*
│   ├── criteria346_merge.py
│   └── routes.py           # Legacy server-rendered routes
├── scripts/
│   ├── setup_merged_project.py
│   ├── init_db.py
│   └── seeds.py
├── static/                 # React build + /uploads proofs
└── requirements.txt
```

## Run

```powershell
cd backend
..\.venv\Scripts\python app.py
```

Server: **http://127.0.0.1:5000**

## Database

1. Create PostgreSQL database: `naac_db`
2. Run setup:

```powershell
..\.venv\Scripts\python scripts\setup_merged_project.py
```

Override connection string:

```powershell
$env:SQLALCHEMY_DATABASE_URI = "postgresql://user:pass@localhost/naac_db"
```

## Key API groups

| Prefix | Purpose |
|--------|---------|
| `/api/login`, `/api/register` | Auth |
| `/api/records/<criterion>` | CRUD for all 43 criteria keys |
| `/api/export-excel/<criterion>` | NAAC Excel download |
| `/api/proof-link/<criterion>` | Combined proof link for export |
| `/api/upload-evidence` | Merge proof PDFs/images |

## Rebuild frontend into static

From project root:

```powershell
cd ..\frontend
npm run build
```

Output goes to `backend/static/` (configured in `frontend/vite.config.js`).
