@echo off
REM Start backend without PAUSE (for being launched by PHP)
cd /d "%~dp0"

if not exist ".venv\Scripts\activate.bat" (
  echo [ERROR] .venv tidak ditemukan. Jalankan setup_backend.bat dulu.
  exit /b 1
)

call .venv\Scripts\activate.bat

if not exist "backend\api.py" (
  echo [ERROR] backend\api.py tidak ditemukan.
  exit /b 1
)

cd backend
python api.py
