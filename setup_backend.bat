@echo off
setlocal
title Fire Detection - Backend Setup
echo =====================================
echo  FIRE DETECTION BACKEND SETUP
echo =====================================

REM Pindah ke folder root project
cd /d "%~dp0"

REM Jika backend/.env belum ada, buat otomatis.
REM Token Telegram bisa ditaruh di file token_telegram.txt (di root project) agar tidak ikut GitHub.
if not exist "backend\.env" (
  echo =====================================
  echo [INFO] File backend\.env belum ada, membuat konfigurasi default...
  echo =====================================
  call :ensure_env
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

exit /b 0

:ensure_env
setlocal
set "ENV_FILE=%~dp0backend\.env"
set "TOKEN_FILE=%~dp0token_telegram.txt"

set "BOT_TOKEN="
if exist "%TOKEN_FILE%" (
  set /p BOT_TOKEN=<"%TOKEN_FILE%"
)

(
  echo DB_HOST=localhost
  echo DB_USER=root
  echo DB_PASS=
  echo DB_NAME=fire_detect
  echo TELEGRAM_BOT_TOKEN=%BOT_TOKEN%
  echo TELEGRAM_COOLDOWN=30
) > "%ENV_FILE%"

echo [INFO] backend\.env dibuat.
if "%BOT_TOKEN%"=="" (
  echo [INFO] TELEGRAM_BOT_TOKEN kosong ^(Telegram nonaktif sampai token diisi^).
  echo [INFO] Isi token di file: %TOKEN_FILE%
  echo [INFO] Link Google Drive (file token):
  echo https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link
)

endlocal & exit /b 0
