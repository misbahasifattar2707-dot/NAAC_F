@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "PY=%ROOT%.venv\Scripts\python.exe"

if not exist "%PY%" (
  echo Virtual environment not found. Run setup.bat first.
  pause
  exit /b 1
)

echo Starting METtrack (development mode)...
start "METtrack Backend" powershell -NoExit -Command "Set-Location '%ROOT%backend'; & '%PY%' app.py"
start "METtrack Frontend" powershell -NoExit -Command "Set-Location '%ROOT%frontend'; npm run dev"
timeout /t 7 >nul
start "" "http://localhost:5174"
echo Backend: http://localhost:5000  ^|  Frontend: http://localhost:5174
endlocal
