@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "PY=%ROOT%.venv\Scripts\python.exe"

if not exist "%PY%" (
  echo Virtual environment not found. Run setup.bat first.
  pause
  exit /b 1
)

echo ============================================================
echo   METtrack - Single URL Run
echo   Builds frontend then starts backend on http://localhost:5000
echo ============================================================

echo.
echo [1/3] Building frontend...
pushd "%ROOT%frontend"
call npm run build
if errorlevel 1 (
  echo Frontend build failed.
  popd
  pause
  exit /b 1
)
popd

echo.
echo [2/3] Starting backend...
start "METtrack Backend" powershell -NoExit -Command "Set-Location '%ROOT%backend'; & '%PY%' app.py"

echo.
echo [3/3] Opening browser...
timeout /t 5 >nul
start "" "http://localhost:5000"

echo Done. App running at http://localhost:5000
endlocal
