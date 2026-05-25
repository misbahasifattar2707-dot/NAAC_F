# Client Setup Guide — METtrack NAAC Portal

Follow these steps on a **Windows** machine with internet access.

---

## Step 1 — Install prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Python | 3.11 or newer | https://www.python.org/downloads/ |
| Node.js | 18 LTS or newer | https://nodejs.org/ |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |

During Python install, check **“Add Python to PATH”**.

---

## Step 2 — Create the database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE naac_db;
```

Default connection used by the app:

```text
postgresql://postgres:root@localhost/naac_db
```

Change password in `.env` if your PostgreSQL password is different (copy `.env.example` → `.env`).

---

## Step 3 — Extract and setup

1. Extract `METtrack-NAAC-Submission.zip` to a folder, e.g. `C:\METtrack-NAAC\`
2. Double-click **`setup.bat`**

Setup will:

- Create Python virtual environment (`.venv/`)
- Install Python + npm packages
- Create database tables and seed data
- Build the React frontend into `backend/static/`

---

## Step 4 — Run the application

Double-click **`start-app.bat`**

- App URL: **http://localhost:5000**
- Login page opens automatically

For development (live frontend reload):

- Run **`run-project.bat`**
- Backend: http://localhost:5000
- Frontend: http://localhost:5174

---

## Step 5 — Register / login

1. Open http://localhost:5000/register to create an admin user, **or**
2. Use credentials already seeded in your database

Select academic year **2024-25** and program **MCA** at login.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `setup.bat` fails on database | Ensure PostgreSQL is running and `naac_db` exists |
| Port 5000 in use | Stop other apps on port 5000 or change port in `backend/app.py` |
| Blank page | Run `setup.bat` again or `cd frontend && npm run build` |
| Excel export empty | Add at least one record on that criterion page first |

---

## Re-create submission zip (for developers)

From project root:

```bat
create-submission-zip.bat
```

Output: `dist/METtrack-NAAC-Submission.zip`
