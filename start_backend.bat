@echo off
title Fire Detection Backend
echo =====================================
echo  FIRE DETECTION BACKEND STARTING
echo =====================================

REM Pindah ke folder dimana file bat ini berada
cd /d "%~dp0"

REM Cek apakah virtual environment ada
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment tidak ditemukan!
    echo Pastikan folder .venv ada di: %~dp0
    pause
    exit /b 1
)

REM Aktifkan virtual environment
echo [INFO] Mengaktifkan virtual environment...
call .venv\Scripts\activate.bat

REM Cek apakah folder backend ada
if not exist "backend" (
    echo [ERROR] Folder backend tidak ditemukan!
    pause
    exit /b 1
)

REM Masuk ke backend
cd backend

REM Jalankan FastAPI
echo [INFO] Menjalankan FastAPI server...
echo [INFO] Server akan berjalan di: http://127.0.0.1:8000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo =====================================
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload

pause
