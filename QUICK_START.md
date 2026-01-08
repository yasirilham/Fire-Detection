# 🚀 QUICK START GUIDE

Panduan cepat untuk menjalankan Fire Detection System dalam 5 menit!

---

## ✅ Checklist Sebelum Mulai

- [ ] Python 3.8+ terinstall
- [ ] XAMPP/Laragon terinstall
- [ ] Webcam tersedia
- [ ] Koneksi internet (untuk download dependencies)

---

## 📦 Step 1: Clone & Install (3 menit)

```bash
# 1. Clone repository
git clone https://github.com/username/firedetec.git
cd firedetec

# 2. Install Python dependencies
cd backend
pip install -r requirements.txt

# Tunggu hingga selesai (~2-3 menit untuk pertama kali)
```

---

## 🔧 Step 2: Setup Environment (1 menit)

```bash
# 1. Copy template .env
cd backend
cp .env.example .env

# 2. Edit file .env (opsional untuk Telegram)
# Untuk saat ini bisa skip, gunakan default settings
```

**File `.env` minimal:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=fire_detect
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## ✅ Step 3: Verifikasi Model (30 detik)

**✅ GOOD NEWS**: File `best.pt` sudah termasuk di GitHub!

**Verifikasi:**
```bash
# Windows
dir models\best.pt

# Mac/Linux
ls -lh models/best.pt

# Output: 22M best.pt ✅
```

**Jika file tidak ada:**
```bash
# Pull ulang dari GitHub
git pull origin main

# Atau pastikan clone lengkap
git clone https://github.com/username/firedetec.git
```

---

## 🎮 Step 4: Jalankan Aplikasi (30 detik)

### Terminal 1: Backend
```bash
cd firedetec/backend
python api.py
```

**Output yang benar:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Terminal 2: Frontend
1. Start XAMPP/Laragon
2. Start **Apache** dan **MySQL**
3. Buka browser: `http://localhost/firedetec/index.html`

---

## 🔐 Step 5: Registrasi & Login (30 detik)

1. Klik **"Daftar"**
2. Isi form:
   - Nama: `Test User`
   - Username: `admin`
   - Password: `admin123`
   - Alamat: `Test Location`
3. Klik **"Daftar"**
4. Login dengan username & password yang baru dibuat

---

## 🎯 Step 6: Test Deteksi (30 detik)

1. Klik **"▶ Mulai Deteksi"**
2. Izinkan akses webcam
3. Arahkan webcam ke:
   - 🔥 **Korek api/lilin** (untuk test Fire)
   - 💨 **Asap rokok** (untuk test Smoke)

**Hasil yang diharapkan:**
- Status berubah menjadi "🚨 TERDETEKSI"
- Confidence muncul (misalnya 85%)
- Jenis deteksi muncul (Fire/Smoke)
- Alarm berbunyi (jika confidence ≥70%)

---

## ✅ Verifikasi Sistem Berjalan

### Backend Running:
```
✅ Terminal menampilkan: "Uvicorn running on http://127.0.0.1:8000"
✅ Buka http://127.0.0.1:8000/status di browser
✅ Harusnya muncul JSON: {"api":"ready","active":false,...}
```

### Frontend Running:
```
✅ Browser bisa buka http://localhost/firedetec/index.html
✅ Halaman login muncul dengan logo fire
✅ Tidak ada error di browser console (F12)
```

### Database Running:
```
✅ phpMyAdmin bisa dibuka: http://localhost/phpmyadmin
✅ Database "fire_detect" otomatis terbuat
✅ Tabel "users" ada dengan struktur yang benar
```

---

## 🐛 Quick Troubleshooting

### Problem: Backend error "Module not found"
```bash
# Solusi: Install ulang dependencies
pip install -r requirements.txt
```

### Problem: Model tidak ditemukan
```bash
# Solusi: Cek path model
ls models/best.pt

# Jika tidak ada, download dari link yang disediakan
```

### Problem: Database error
```bash
# Solusi: 
# 1. Pastikan MySQL running di XAMPP/Laragon
# 2. Cek username/password di backend/.env
# 3. Test: mysql -u root -p
```

### Problem: Port 8000 sudah digunakan
```bash
# Solusi: Gunakan port lain
uvicorn api:app --reload --host 127.0.0.1 --port 8001

# Jangan lupa update BACKEND_URL di dashboard-app.js
```

---

## 📊 Testing Checklist

- [ ] Model best.pt ada di folder models/ (22 MB)
- [ ] Backend berjalan tanpa error
- [ ] Frontend bisa dibuka di browser
- [ ] Registrasi berhasil
- [ ] Login berhasil
- [ ] Webcam bisa diakses
- [ ] Deteksi api/asap berhasil
- [ ] Alarm berbunyi saat deteksi
- [ ] Screenshot tersimpan di `backend/screenshots/`

---

## 🎉 Selamat!

Sistem Fire Detection Anda sudah berjalan! 

**Next Steps:**
1. Setup Telegram Bot (lihat README.md)
2. Konfigurasi threshold sesuai kebutuhan
3. Deploy ke production server

---

## 📚 Resources

- **Full Documentation**: README.md
- **Changelog**: CHANGELOG_SIMPLIFIED.md
- **Database Schema**: database/README.md
- **Issue Tracker**: GitHub Issues

---

**Need Help?** 
- Baca README.md lengkap
- Check Troubleshooting section
- Create GitHub Issue

---

**Last Updated**: 8 Januari 2026
