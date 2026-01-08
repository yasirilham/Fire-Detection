@echo off
setlocal
title Fire Detection - Backend Setup
echo =====================================
echo  FIRE DETECTION BACKEND SETUP
echo =====================================

REM Pindah ke folder root project
cd /d "%~dp0"

REM Jika .env belum ada, arahkan user ambil dari Google Drive lalu hentikan setup
if not exist "backend\.env" (
  echo =====================================
  echo [ACTION REQUIRED] File backend\.env belum ada.
  echo Setup dihentikan agar bisa dijalankan ulang dari awal.
  echo.
  echo 1. Download file .env dari Google Drive berikut:
  echo    https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link
  echo 2. Taruh file itu di: %~dp0backend\.env
  echo 3. Tutup window ini, lalu jalankan ulang: setup_backend.bat
  echo =====================================
  echo.
  start "" "https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link"
  pause
  exit /b 2
)

REM Pastikan Python tersedia
python --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python tidak ditemukan di PATH.
  echo Install Python 3.8+ lalu coba lagi.
  pause
  exit /b 1
)

REM Buat virtual environment jika belum ada
if not exist ".venv\Scripts\python.exe" (
  echo [INFO] Membuat virtual environment .venv ...
  python -m venv .venv
  if errorlevel 1 (
    echo [ERROR] Gagal membuat virtual environment.
    pause
    exit /b 1
  )
)

REM Aktifkan virtual environment
call .venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Install dependencies backend ...
pip install -r backend\requirements.txt
if errorlevel 1 (
  echo [ERROR] Gagal install dependencies.
  pause
  exit /b 1
)

echo [INFO] Setup selesai.
echo [INFO] Jalankan backend:
echo - start_backend.bat
echo atau
echo - cd backend lalu: python api.py
pause
