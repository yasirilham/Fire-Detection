# 📥 Files Not Included in GitHub

File-file berikut **TIDAK** disertakan di repository GitHub dan perlu didownload/dibuat secara terpisah.

---

## ✅ File yang SUDAH TERMASUK

### 1. **YOLOv8 Model** (`models/best.pt`)

**Status**: ✅ **SUDAH TERMASUK** di GitHub repository!

**Deskripsi**:
- Model YOLOv8 yang sudah di-training untuk deteksi Fire & Smoke
- Ukuran: **22 MB** (di bawah limit GitHub 100 MB)
- Format: PyTorch model (.pt)
- Classes: 0=Fire, 1=Smoke

**Kenapa sekarang di GitHub?**
- ✅ Ukuran hanya 22 MB (jauh di bawah limit 100 MB)
- ✅ Memudahkan setup (tidak perlu download terpisah)
- ✅ Version control untuk model updates

**Verifikasi setelah clone:**
```bash
# Cek apakah model ada
ls -lh models/best.pt

# Output yang benar:
# -rw-r--r-- 1 user user 22M models/best.pt ✅
```

**Jika file tidak ada:**
```bash
# Kemungkinan clone tidak lengkap, pull ulang:
git pull origin main

# Atau clone ulang:
git clone https://github.com/username/firedetec.git
```

**Struktur akhir:**
```
firedetec/
└── models/
    └── best.pt  ✅ (otomatis ada setelah clone)
```

---

## 🎯 File yang WAJIB Dibuat Manual

### 1. **Environment Variables** (`backend/.env`)

**Status**: ⚠️ **WAJIB** - Sistem tidak bisa connect ke database tanpa file ini

**Deskripsi**:
- File konfigurasi untuk database dan Telegram
- Berisi kredensial sensitif (tidak boleh di-commit ke GitHub)

**Kenapa tidak di GitHub?**
- Berisi informasi sensitif (password, token)
- Setiap user memiliki konfigurasi berbeda
- Security best practice: jangan commit credentials

**Cara Membuat:**
```bash
# 1. Copy template
cd backend
cp .env.example .env

# 2. Edit file .env
nano .env
# atau
notepad .env
```

**Template `.env`:**
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=fire_detect

# Telegram (opsional)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
TELEGRAM_COOLDOWN=30
```

**Struktur akhir:**
```
firedetec/
└── backend/
    ├── .env          ✅ (file ini)
    └── .env.example  (template)
```

---

## 📦 File yang OPSIONAL

### 2. **Dataset** (`dataset/`)

**Status**: ⚙️ **OPSIONAL** - Hanya perlu jika ingin re-train model

**Deskripsi**:
- Dataset gambar Fire & Smoke untuk training
- Format: YOLO (images + labels)
- Ukuran: ~500 MB

**Kenapa tidak di GitHub?**
- Ukuran sangat besar (ratusan MB)
- Hanya dibutuhkan untuk training, bukan inference
- Dataset bisa berbeda untuk tiap user

**Download dari:**
- 🔗 **Roboflow**: [Link Roboflow Project]
- 🔗 **Google Drive**: [Link dataset]

**Struktur dataset:**
```
dataset/
├── data.yaml
├── train/
│   ├── images/
│   └── labels/
├── valid/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

---

### 3. **Training Notebook** (`notebook/training.ipynb`)

**Status**: ⚙️ **OPSIONAL** - Untuk advanced users

**Deskripsi**:
- Jupyter notebook untuk training YOLOv8
- Termasuk kode preprocessing dan evaluation

**Kenapa tidak di GitHub?**
- File notebook besar (~2 MB)
- Output cells berisi gambar/grafik
- Hanya untuk developer/researcher

---

### 4. **Trained Model History** (`notebook/runs/`)

**Status**: ⚙️ **OPSIONAL**

**Deskripsi**:
- Folder hasil training (checkpoints, metrics, graphs)
- Ukuran: bisa mencapai GB

**Kenapa tidak di GitHub?**
- Ukuran sangat besar
- File sementara training
- Bisa di-generate ulang

---

## 📁 Folder yang Auto-Generated

Folder berikut **TIDAK** perlu didownload karena akan dibuat otomatis saat sistem berjalan:

### 1. **Screenshots** (`backend/screenshots/`)
```
✅ Auto-created saat pertama kali deteksi
📸 Berisi foto hasil deteksi kebakaran
```

### 2. **Logs** (`backend/logs/`)
```
✅ Auto-created saat backend start
📝 Berisi log aktivitas sistem
```

### 3. **Python Cache** (`backend/__pycache__/`)
```
✅ Auto-created oleh Python
🗑️ Bisa dihapus kapan saja (sudah di .gitignore)
```

---

## 🔐 Files in .gitignore

File-file berikut di-ignore oleh Git (tidak di-commit):

```gitignore
# Python cache
__pycache__/
*.pyc

# Virtual environment
venv/
.venv/

# Environment variables
.env

# User-specific
backend/logs/
backend/screenshots/

# Optional (jika tidak ingin upload model)
# models/best.pt

# Dataset (opsional)
dataset/

# Training results
notebook/runs/
```

---

## � Checklist Pre-Installation

Sebelum clone repository, pastikan Anda punya akses ke:

- [x] File `best.pt` (model YOLOv8) - **✅ SUDAH TERMASUK DI GITHUB**
- [ ] Kredensial database MySQL
- [ ] (Opsional) Telegram Bot Token & Chat ID
- [ ] (Opsional) Dataset untuk training

---

## 🚀 Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/username/firedetec.git
cd firedetec

# 2. Verifikasi model sudah ada
ls -lh models/best.pt
# Output: 22M best.pt ✅

# 3. Buat .env
cd backend
cp .env.example .env
nano .env  # Edit sesuai konfigurasi Anda

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run!
python api.py
```

---

## 🆘 Need the Files?

Jika Anda kesulitan mendapatkan file yang diperlukan:

1. **Contact maintainer**: your.email@example.com
2. **Create GitHub Issue**: Request access to model/dataset
3. **Documentation**: Check README.md untuk alternatif

---

## 📝 Notes

### Model Versioning:
```
best.pt v1.0 (Current) - Trained on 1000 images
best.pt v2.0 (Future)  - Improved accuracy
```

### Environment Template:
Selalu update `.env.example` jika ada konfigurasi baru!

### Security:
⚠️ **NEVER** commit `.env` to GitHub!
⚠️ **NEVER** share your Telegram Bot Token publicly!

---

**Last Updated**: 8 Januari 2026  
**Maintainer**: Your Team
