# Fire Detection System

Sistem deteksi api dan asap secara real-time menggunakan YOLOv8, motion detection, dan notifikasi Telegram.

![Status](https://img.shields.io/badge/status-production-green)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [File yang Tidak Ada di GitHub](#file-yang-tidak-ada-di-github)
- [Paket Google Drive](#paket-google-drive)
- [Troubleshooting](#troubleshooting)
- [Struktur Folder](#struktur-folder)

---

## Fitur Utama

- Deteksi Real-time: YOLOv8 untuk deteksi api dan asap dari webcam
- Motion Detection: Filter objek statis (tembok, furniture) untuk mengurangi false positive
- Dual Processing: Frame asli untuk Fire, CLAHE enhancement untuk Smoke
- Priority Logic: Fire > Smoke (fire selalu prioritas)
- Temporal Stabilization: 4 frame untuk Fire, 9 frame untuk Smoke
- Telegram Alert: Notifikasi otomatis dengan screenshot ke Telegram
- User Authentication: Sistem login dengan PHP session
- Dashboard Interaktif: React-based UI dengan real-time status
- Alarm System: Bunyi alarm setiap 30 detik untuk deteksi high confidence

### Backend:
- Python 3.8+ - Bahasa pemrograman utama
- FastAPI - REST API framework
- YOLOv8 (Ultralytics) - Model deteksi objek
- OpenCV - Computer vision library
- MySQL - Database untuk user management

### Frontend:
- React 18 (via CDN) - UI framework
- Tailwind CSS - Styling
- JavaScript ES6 - Logic

### Lainnya:
- PHP - Authentication & session management
- Telegram Bot API - Notifikasi

---

## Prasyarat

Sebelum memulai, pastikan sudah terinstall:

### 1. Python 3.8 atau lebih tinggi(beberapa versi pyton tidak bisa menjelankan librarynya)
```bash
python --version
```
Download: https://www.python.org/downloads/

### 2. XAMPP / Laragon (untuk PHP & MySQL)
- XAMPP: https://www.apachefriends.org/
- Laragon: https://laragon.org/

### 3. Git (untuk clone repository)
```bash
git --version
```
Download: https://git-scm.com/

### 4. Webcam (untuk deteksi real-time)

### 5. Telegram Bot Token (Ada di file ".env" pada Google Drive)
- Chat dengan [@BotFather](https://t.me/BotFather) di Telegram
- Buat bot baru dengan `/newbot`
- Simpan token yang diberikan

---

## Instalasi

### Step 1: Clone Repository
buat file berama "firedetec"

```bash
# Clone repository
git clone https://github.com/Naufal-Arsyi/Fire-Detection

# Masuk ke folder project
cd firedetec
```

### Step 2: Install Python Dependencies

```bash
# Masuk ke folder backend
cd backend

# Install semua library Python
pip install -r requirements.txt
```

Library yang akan diinstall:
- `fastapi` - REST API framework
- `uvicorn` - ASGI server
- `ultralytics` - YOLOv8 framework
- `opencv-python` - Computer vision
- `numpy` - Array operations
- `mysql-connector-python` - MySQL driver
- `python-dotenv` - Environment variables
- `requests` - HTTP client

> Catatan: Instalasi `ultralytics` akan otomatis download dependencies torch, torchvision, dll (~2-3 GB)

Alternatif paling mudah (Windows): jalankan `setup_backend.bat` untuk membuat `.venv`, install dependencies, dan menyiapkan `backend/.env`.

Alur `setup_backend.bat`:
- Jika `backend/.env` belum ada, script akan membuka link Google Drive, lalu berhenti. Download file `.env`, taruh ke `backend/.env`, lalu jalankan ulang `setup_backend.bat`.
- Jika `backend/.env` sudah ada, script lanjut install dependencies dan setup selesai.
- Setelah setup selesai, nyalakan backend dengan `start_backend.bat` atau masuk ke folder `backend` lalu jalankan `python api.py`.

### Step 3: Setup Database

1. Start MySQL (via XAMPP/Laragon)
- Buka XAMPP/Laragon Control Panel
- Start `Apache` dan `MySQL`

2. Import Database (Otomatis)
- Database akan otomatis dibuat saat pertama kali jalankan `index.html`
- File SQL: `database/fire_detect.sql`

Atau manual via phpMyAdmin:
```sql
-- Buka phpMyAdmin (http://localhost/phpmyadmin)
-- Create database
CREATE DATABASE fire_detect;

-- Import file database/fire_detect.sql
```

### Step 4: Konfigurasi Environment Variables

1. Buat file `.env` di folder `backend/`

```bash
cd backend
```

2. Isi file `.env` (copy template di bawah):

Catatan:
- Jangan upload `backend/.env` ke GitHub.
- Untuk hasil 1:1 seperti laptop ini, ambil file `backend/.env` dari Google Drive lalu taruh di folder `backend/`.

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=fire_detect

# Telegram Configuration (samakan dengan yang ada di ".env")
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
TELEGRAM_COOLDOWN=15
```

Catatan:
- `TELEGRAM_COOLDOWN` adalah jeda minimal antar notifikasi Telegram (dalam detik) untuk mencegah spam.

### Step 5: Verifikasi Model YOLOv8

Model `best.pt` SUDAH TERMASUK di repository GitHub!

Verifikasi:
```bash
# Cek apakah model ada
ls -lh models/best.pt

# Output: -rw-r--r-- 1 user user 22M models/best.pt
```
Jika file tidak ada (kemungkinan besar karena clone tidak lengkap):
```bash
# Pull ulang dari GitHub
git pull origin main

# Atau clone ulang
git clone https://github.com/username/firedetec.git
```

Opsi Manual (jika masih bermasalah):
- atau bisa unduh di link google drive.
- taruh ke "models/"

---

## Konfigurasi

### 1. Database Settings (`db.php`)

```php
$host = "localhost";
$user = "root";
$pass = "";  // Sesuaikan dengan password MySQL Anda
$db   = "fire_detect";
```

### 2. Backend Settings (`backend/.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=fire_detect
```

### 3. Frontend Settings (`dashboard-app.js`)

```javascript
const BACKEND_URL = "http://127.0.0.1:8000";  // URL backend
const ALARM_THRESHOLD = 0.70;                  // Threshold alarm (70%)
const ALARM_INTERVAL = 30000;                  // Interval alarm (30 detik)
```

### 4. Detection Settings (`backend/api.py`)

```python
# Threshold confidence
CONF_FIRE = 0.45
CONF_SMOKE = 0.55

# Threshold notifikasi (alarm dan Telegram)
NOTIFY_FIRE = 0.70
NOTIFY_SMOKE = 0.70

# Minimal area
MIN_AREA_FIRE = 900
MIN_AREA_SMOKE = 1800

# Stabilisasi frame
FIRE_FRAMES = 4
SMOKE_FRAMES = 9

# Motion detection
MOTION_THRESHOLD = 500
```
---
## Menjalankan Aplikasi

### Step 1: Start Backend (Python)

```bash
# Masuk ke folder backend
cd backend

# Jalankan server FastAPI
python api.py
```

atau

```bash
# Dengan uvicorn
uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

Output yang benar:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Catatan:
- Halaman login bisa menyalakan backend otomatis (tombol Login) via `start_backend.php` (Windows/Laragon).
- Tombol Logout di dashboard akan mematikan backend otomatis.

### Step 2: Start Frontend (PHP)

1. Start Apache & MySQL di XAMPP/Laragon

2. Buka browser, akses:
   ```
   http://localhost/firedetec/index.html
   ```

### Step 3: Registrasi & Login

1. Klik "Daftar" di halaman login
2. Isi form registrasi:
- Nama Lengkap
- Username
- Password
- Alamat/Lokasi
3. Login dengan akun yang baru dibuat

Catatan:
- Saat klik "Daftar" (pindah ke halaman registrasi), backend akan dimatikan otomatis (jika sedang menyala).

### Step 4: Mulai Deteksi

1. Klik tombol "Mulai Deteksi"
2. Izinkan akses webcam
3. Sistem akan mulai mendeteksi api/asap secara real-time
4. Jika terdeteksi:
- Jika confidence >= 70%: alarm berbunyi dan notifikasi Telegram terkirim
- Jika confidence < 70%: tetap terdeteksi di dashboard, tapi tanpa alarm dan tanpa Telegram
- Screenshot tersimpan di `backend/screenshots/`

---

## File yang Tidak Ada di GitHub

File-file berikut TIDAK ada di repository karena ukuran besar atau berisi data sensitif:

### 1. Environment Variables (`backend/.env`)
- Status: WAJIB
- Fungsi: Konfigurasi database dan Telegram
- Template: `backend/.env.example`
- Catatan: File ini berisi kredensial/token (sensitif), jangan di-commit ke GitHub
- File `backend/.env` sudah disimpan di Google Drive (privat): https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link

### 2. Dataset (opsional)
- Folder `dataset/` hanya dibutuhkan jika ingin re-train model
- Untuk menjalankan deteksi (inference), dataset tidak diperlukan

### 3. Folder runtime (auto-generated)
- `backend/screenshots/` dan `backend/logs/` akan dibuat otomatis saat backend berjalan
- Isinya boleh kosong dan tidak perlu dibawa saat pindah laptop

### 4. Model YOLOv8 (`models/best.pt`)
- Status: SUDAH TERMASUK di repository
- Wajib ada saat runtime: ya (backend load model ini)

---

## Paket Google Drive

Bagian ini adalah checklist file/folder yang perlu kamu upload ke Google Drive supaya project bisa dijalankan di laptop lain dengan hasil yang sama.

Link Google Drive: https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link

### Yang WAJIB ikut (agar aplikasi jalan)

Upload folder project `firedetec/` beserta isi berikut:

- `backend/` (termasuk `api.py`, `db.py`, `user_service.py`, `telegram_service.py`, `requirements.txt`)
- `backend/.env` (privat) atau minimal `backend/.env.example` lalu dibuat ulang jadi `.env` di laptop tujuan
- `models/best.pt`
- `database/fire_detect.sql`
- File web & auth: `index.html`, `dashboard.html`, `regis.html`, `login.php`, `register.php`, `logout.php`, `check_session.php`, `db.php`
- Jika pakai auto-start backend dari tombol Login: `start_backend.php` dan `start_backend_bg.bat`
- Asset & UI code: `assets/`, `components/`, `function/`, `static/`, `styles/`, `utils/`, serta file JS utama (`app.js`, `dashboard-app.js`, `regis-app.js`)
- `setup_backend.bat` (opsional tapi sangat membantu untuk setup 1 kali di laptop baru)
- `start_backend.bat` (opsional tapi sangat membantu di Windows)

### Yang TIDAK perlu ikut (boleh dihapus sebelum zip/upload)

- `backend/__pycache__/` dan file `*.pyc`
- `backend/logs/` (akan dibuat otomatis)
- `backend/screenshots/` (akan dibuat otomatis)
- `notebook/runs/` (output training, biasanya besar)

### Opsional (ikutkan hanya jika dibutuhkan)

- `dataset/` (hanya untuk training ulang)
- `notebook/training.ipynb` (hanya untuk eksperimen/training)

### Penting: folder virtual environment (`.venv`)

File `start_backend.bat` dan `start_backend_bg.bat` mengharuskan ada virtual environment bernama `.venv` di root project.

Disarankan jangan upload `.venv` ke Google Drive (sering tidak portable). Lebih aman buat ulang di laptop tujuan:

```bat
cd C:\laragon\www\firedetec
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
```

Lalu jalankan backend dengan:

- Double click `start_backend.bat`, atau
- Manual: `cd backend` lalu `python api.py`

---

## Troubleshooting

### Problem 1: Backend tidak bisa start

Error: `ModuleNotFoundError: No module named 'fastapi'`

Solusi:
```bash
pip install -r backend/requirements.txt
```

---

### Problem 2: Model tidak ditemukan

Error: `FileNotFoundError: ../models/best.pt not found`

Solusi:
1. Download file `best.pt`
2. Letakkan di folder `models/best.pt`
3. Pastikan path di `api.py` benar: `model = YOLO("../models/best.pt")`

---

### Problem 3: Database connection error

Error: `mysql.connector.errors.InterfaceError: 2003`

Solusi:
1. Pastikan MySQL sudah running
2. Cek username/password di `db.php` dan `backend/.env`
3. Test koneksi:
   ```bash
   mysql -u root -p
   ```

---

### Problem 4: Webcam tidak terdeteksi

Error: `NotAllowedError: Permission denied`

Solusi:
1. Buka browser settings -> Privacy -> Camera
2. Izinkan akses kamera untuk `localhost`
3. Refresh halaman (Ctrl+Shift+R)

---

### Problem 5: Telegram tidak mengirim notifikasi

Error: Silent (tidak ada error, tapi notifikasi tidak masuk)

Solusi:
1. Cek `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` di `.env`
2. Test bot dengan chat langsung
3. Pastikan bot tidak di-block
4. Cek log di `backend/logs/detection_*.log`
5. Cek status Telegram via: http://127.0.0.1:8000/telegram/status

---

### Problem 6: False positive (tembok terdeteksi sebagai asap)

Solusi:
Tingkatkan threshold di `backend/api.py`:
```python
CONF_SMOKE = 0.80          # Naikkan ke 80%
MIN_AREA_SMOKE = 8000      # Naikkan area minimal
SMOKE_FRAMES = 12          # Naikkan frame threshold
MOTION_THRESHOLD = 800     # Naikkan motion sensitivity
```

---

## Struktur Folder

```
firedetec/
|-- backend/                  # Backend Python (FastAPI)
|   |-- api.py               # Main API
|   |-- db.py                # Database connection (Python)
|   |-- user_service.py      # User management service
|   |-- telegram_service.py  # Telegram notification service
|   |-- requirements.txt     # Python dependencies
|   |-- .env                 # Environment variables (buat manual)
|   |-- screenshots/         # Screenshot hasil deteksi (auto-created)
|   `-- logs/                # Log files (auto-created)
|
|-- models/
|   `-- best.pt              # YOLOv8 model (wajib untuk runtime)
|
|-- database/
|   |-- fire_detect.sql      # Database schema
|   `-- README.md            # Database documentation
|
|-- assets/
|   `-- Alarm1.mp3           # Alarm sound effect
|
|-- components/              # React components
|   |-- LoginForm.js
|   |-- RegisterForm.js
|   `-- Alert.js
|
|-- utils/                   # Utilities
|   |-- auth.js              # Authentication helper
|   `-- API_fire.js          # API client untuk deteksi
|
|-- styles/
|   `-- main.css             # Custom CSS
|
|-- function/
|   `-- ErrorBoundary.js     # Error handling
|
|-- index.html               # Login page
|-- regis.html               # Registration page
|-- dashboard.html           # Dashboard page
|-- app.js                   # Login app
|-- regis-app.js             # Registration app
|-- dashboard-app.js         # Dashboard app
|
|-- login.php                # Login handler
|-- register.php             # Registration handler
|-- logout.php               # Logout handler
|-- check_session.php        # Session validation
|-- db.php                   # Database connection (PHP)
|
|-- .gitignore               # Git ignore rules
|-- README.md                # This file
`-- CHANGELOG_SIMPLIFIED.md  # Changelog dokumentasi
```

---

## Spesifikasi Sistem

### Minimum Requirements:
- CPU: Intel Core i3 atau setara
- RAM: 4 GB
- Storage: 5 GB free space
- Webcam: 720p (1280x720)
- OS: Windows 10, macOS, Linux
- Browser: Chrome 90+, Firefox 88+, Edge 90+

### Recommended:
- CPU: Intel Core i5 atau lebih tinggi
- RAM: 8 GB
- GPU: NVIDIA GPU (untuk inference lebih cepat)
- Webcam: 1080p (1920x1080)

---

## Keamanan

### Important Notes:

1. Jangan commit file `.env` ke GitHub
- Berisi token Telegram dan kredensial database
- Sudah ada di `.gitignore`

2. Ubah password database production
- Default password kosong hanya untuk development
- Di production, gunakan password yang kuat

3. HTTPS untuk production
- Sistem ini menggunakan HTTP untuk development
- Gunakan SSL/TLS certificate untuk production

---

## Changelog

### Version 2.1 (8 Januari 2026)
- Tuning sensitivitas deteksi untuk objek kecil (tanpa mengubah motion detection)
- Notifikasi Telegram dibatasi oleh `TELEGRAM_COOLDOWN` (default 15 detik, bisa diubah lewat `.env`)
- Dashboard: Stop Deteksi sekaligus mematikan kamera
- Dashboard: Logout mematikan backend otomatis
- Login: klik Daftar mematikan backend otomatis
- Tambah endpoint monitoring Telegram: `/telegram/status`
- Alarm audio menggunakan `assets/Alarm1.mp3`

### Version 2.0 (8 Januari 2026)
- Tambah Motion Detection untuk filter objek statis
- Simplifikasi kode 30% (408 -> 270 baris di api.py)
- Peningkatan threshold Smoke (70% -> 75%)
- Area minimal Smoke lebih besar (4500 -> 6500px^2)
- Frame stabilization lebih ketat (6 -> 9 frames)
- UI dashboard lebih informatif

### Version 1.0 (Sebelumnya)
- Deteksi Fire & Smoke dengan YOLOv8
- Dual-frame processing
- Telegram notification
- User authentication

---

## Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## Kontak & Support

Jika ada pertanyaan atau masalah:

- Issue Tracker: [GitHub Issues](https://github.com/username/firedetec/issues)
- Email: your.email@example.com
- Documentation: [Wiki](https://github.com/username/firedetec/wiki)

---

## License

Project ini menggunakan [MIT License](LICENSE).

---

## Credits

- YOLOv8: [Ultralytics](https://github.com/ultralytics/ultralytics)
- FastAPI: [Tiangolo](https://github.com/tiangolo/fastapi)
- React: [Facebook](https://react.dev/)
- Tailwind CSS: [Tailwind Labs](https://tailwindcss.com/)

---

Made with love by Your Team

---

## Quick Start (TL;DR)

```bash
# 1. Clone & Install
git clone https://github.com/username/firedetec.git
cd firedetec/backend
pip install -r requirements.txt

# 2. Model sudah ada di models/best.pt (22 MB)
ls -lh models/best.pt

# 3. Buat backend/.env (copy template dari README)
cp .env.example .env

# 4. Start MySQL & Apache (XAMPP/Laragon)

# 5. Start Backend
cd backend
python api.py

# 6. Buka browser
http://localhost/firedetec/index.html

# 7. Registrasi -> Login -> Mulai Deteksi
```

---

Status: Production Ready
Last Updated: 8 Januari 2026