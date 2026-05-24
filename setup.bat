@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "VENV=%ROOT%.venv"
set "PY=%VENV%\Scripts\python.exe"
set "PIP=%VENV%\Scripts\pip.exe"

echo ============================================================
echo   METtrack NAAC - First-time setup
echo ============================================================
echo.

if not exist "%PY%" (
  echo [1/5] Creating Python virtual environment...
  python -m venv "%VENV%"
  if errorlevel 1 (
    echo Failed to create venv. Install Python 3.11+ and retry.
    exit /b 1
  )
) else (
  echo [1/5] Virtual environment already exists.
)

echo [2/5] Installing Python dependencies...
"%PIP%" install -r "%ROOT%backend\requirements.txt"
if errorlevel 1 exit /b 1

echo [3/5] Installing frontend dependencies...
pushd "%ROOT%frontend"
call npm install
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo [4/5] Initializing database and seed data...
"%PY%" "%ROOT%backend\scripts\setup_merged_project.py"
if errorlevel 1 (
  echo.
  echo Database setup failed. Ensure PostgreSQL is running and naac_db exists.
  exit /b 1
)

echo [5/5] Building frontend to backend/static...
pushd "%ROOT%frontend"
call npm run build
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo.
echo Setup complete.
echo   Run start-app.bat  - single URL at http://localhost:5000
echo   Run run-project.bat - dev mode (backend + Vite)
echo.
endlocal
