# 📚 Python Libraries Installation Guide

Panduan lengkap instalasi library Python untuk Fire Detection System.

---

## 📦 Requirements Summary

Total libraries yang akan diinstall: **7 utama + ~15 dependencies**

**Ukuran download**: ~2-3 GB (termasuk PyTorch)

**Waktu instalasi**: 5-10 menit (tergantung koneksi internet)

---

## 🎯 Main Libraries

### 1. **FastAPI** - REST API Framework
```bash
pip install fastapi
```
- **Version**: 0.104.0+
- **Size**: ~2 MB
- **Fungsi**: Backend REST API framework
- **Dependencies**: pydantic, starlette

### 2. **Uvicorn** - ASGI Server
```bash
pip install uvicorn
```
- **Version**: 0.24.0+
- **Size**: ~1 MB
- **Fungsi**: Run FastAPI server
- **Dependencies**: click, h11

### 3. **Ultralytics** - YOLOv8 Framework
```bash
pip install ultralytics
```
- **Version**: 8.0.0+
- **Size**: ~500 MB (includes PyTorch)
- **Fungsi**: YOLOv8 model loading & inference
- **Dependencies**: torch, torchvision, opencv-python, numpy, pillow, pyyaml, tqdm

**⚠️ NOTE**: Ini adalah library terbesar (~2 GB dengan dependencies)

### 4. **OpenCV-Python** - Computer Vision
```bash
pip install opencv-python
```
- **Version**: 4.8.0+
- **Size**: ~50 MB
- **Fungsi**: Image processing, video capture, preprocessing
- **Dependencies**: numpy

### 5. **NumPy** - Array Operations
```bash
pip install numpy
```
- **Version**: 1.24.0+
- **Size**: ~20 MB
- **Fungsi**: Array & matrix operations
- **Dependencies**: None

### 6. **MySQL Connector** - Database Driver
```bash
pip install mysql-connector-python
```
- **Version**: 8.0.0+
- **Size**: ~5 MB
- **Fungsi**: Connect to MySQL database
- **Dependencies**: protobuf

### 7. **Python-Dotenv** - Environment Variables
```bash
pip install python-dotenv
```
- **Version**: 1.0.0+
- **Size**: <1 MB
- **Fungsi**: Load .env file
- **Dependencies**: None

### 8. **Requests** - HTTP Client
```bash
pip install requests
```
- **Version**: 2.31.0+
- **Size**: ~1 MB
- **Fungsi**: Send HTTP requests (Telegram API)
- **Dependencies**: urllib3, charset-normalizer

---

## 🚀 Quick Install (Recommended)

### Method 1: Using requirements.txt
```bash
cd backend
pip install -r requirements.txt
```

**Output:**
```
Collecting fastapi
  Downloading fastapi-0.104.1-py3-none-any.whl (92 kB)
Collecting uvicorn
  Downloading uvicorn-0.24.0-py3-none-any.whl (59 kB)
...
Installing collected packages: ...
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 ...
```

### Method 2: One-line install
```bash
pip install fastapi uvicorn ultralytics opencv-python numpy mysql-connector-python python-dotenv requests
```

---

## 🔍 Verification

Setelah instalasi, verifikasi dengan:

```bash
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"
python -c "import uvicorn; print('Uvicorn:', uvicorn.__version__)"
python -c "import ultralytics; print('Ultralytics:', ultralytics.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import numpy; print('NumPy:', numpy.__version__)"
python -c "import mysql.connector; print('MySQL Connector: OK')"
python -c "import dotenv; print('Python-Dotenv: OK')"
python -c "import requests; print('Requests:', requests.__version__)"
```

**Expected Output:**
```
FastAPI: 0.104.1
Uvicorn: 0.24.0
Ultralytics: 8.0.228
OpenCV: 4.8.1
NumPy: 1.24.3
MySQL Connector: OK
Python-Dotenv: OK
Requests: 2.31.0
```

---

## 🐛 Troubleshooting

### Problem 1: PyTorch Installation Fails

**Error:**
```
ERROR: Could not find a version that satisfies the requirement torch
```

**Solution:**
```bash
# Install PyTorch manually (CPU version)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Then install ultralytics
pip install ultralytics
```

**For GPU (NVIDIA CUDA):**
```bash
# Check CUDA version first
nvidia-smi

# Install with CUDA 11.8 support
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install ultralytics
```

---

### Problem 2: OpenCV Import Error

**Error:**
```
ImportError: libGL.so.1: cannot open shared object file
```

**Solution (Linux):**
```bash
sudo apt-get install libgl1-mesa-glx
```

**Solution (Mac):**
```bash
brew install opencv
```

---

### Problem 3: MySQL Connector Error

**Error:**
```
ImportError: No module named 'mysql'
```

**Solution:**
```bash
# Uninstall mysql-python (jika ada)
pip uninstall mysql-python

# Install mysql-connector-python
pip install mysql-connector-python
```

---

### Problem 4: Permission Denied

**Error:**
```
ERROR: Could not install packages due to an OSError: [Errno 13] Permission denied
```

**Solution:**
```bash
# Install untuk user saja (tanpa sudo)
pip install --user -r requirements.txt
```

---

### Problem 5: Slow Download

**Solution: Use mirror server**
```bash
# Use PyPI mirror (China)
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# Or Aliyun mirror
pip install -i https://mirrors.aliyun.com/pypi/simple -r requirements.txt
```

---

## 💾 Disk Space Requirements

| Library | Size | Description |
|---------|------|-------------|
| PyTorch | ~1.5 GB | Deep learning framework |
| Ultralytics | ~200 MB | YOLOv8 framework |
| OpenCV | ~50 MB | Computer vision |
| NumPy | ~20 MB | Array operations |
| FastAPI + deps | ~10 MB | REST API framework |
| MySQL Connector | ~5 MB | Database driver |
| Others | ~50 MB | Misc dependencies |
| **TOTAL** | **~2-3 GB** | |

**Recommendation**: Pastikan minimal **5 GB free space**

---

## 🌐 Offline Installation

Jika tidak ada koneksi internet:

### 1. Download semua wheel files
```bash
# Di komputer yang ada internet
pip download -r requirements.txt -d packages/
```

### 2. Copy folder `packages/` ke komputer offline

### 3. Install offline
```bash
pip install --no-index --find-links=packages/ -r requirements.txt
```

---

## 🔄 Update Libraries

```bash
# Update semua libraries ke versi terbaru
pip install --upgrade -r requirements.txt

# Update library spesifik
pip install --upgrade ultralytics
```

---

## 🗑️ Uninstall

```bash
# Uninstall semua
pip uninstall -r requirements.txt -y

# Uninstall spesifik
pip uninstall ultralytics
```

---

## 🐍 Virtual Environment (Recommended)

### Create Virtual Environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install in Virtual Environment:
```bash
(venv) pip install -r requirements.txt
```

### Deactivate:
```bash
deactivate
```

**Keuntungan Virtual Environment:**
- ✅ Isolasi dependencies
- ✅ Tidak conflict dengan project lain
- ✅ Mudah di-reset jika ada masalah
- ✅ Reproducible environment

---

## 📋 Dependency Tree

```
Fire Detection System
├── FastAPI (REST API)
│   ├── Pydantic (validation)
│   └── Starlette (ASGI framework)
│
├── Uvicorn (Server)
│   ├── Click (CLI)
│   └── H11 (HTTP protocol)
│
├── Ultralytics (YOLOv8)
│   ├── PyTorch (deep learning)
│   ├── Torchvision (vision utils)
│   ├── OpenCV (image processing)
│   ├── NumPy (arrays)
│   ├── Pillow (image library)
│   ├── PyYAML (config)
│   └── TQDM (progress bar)
│
├── OpenCV-Python (computer vision)
│   └── NumPy
│
├── NumPy (arrays)
│
├── MySQL Connector (database)
│   └── Protobuf
│
├── Python-Dotenv (env vars)
│
└── Requests (HTTP)
    ├── urllib3
    └── charset-normalizer
```

---

## ✅ Installation Checklist

- [ ] Python 3.8+ terinstall
- [ ] pip terinstall dan updated (`pip install --upgrade pip`)
- [ ] Virtual environment dibuat (recommended)
- [ ] requirements.txt ada di folder backend
- [ ] Koneksi internet stabil
- [ ] Minimal 5 GB free space
- [ ] (Opsional) CUDA terinstall untuk GPU support

---

## 🎯 Post-Installation Test

Setelah instalasi selesai, test dengan:

```bash
cd backend
python api.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Browser Test:**
```
http://127.0.0.1:8000/status
```

**Expected JSON:**
```json
{
  "api": "ready",
  "active": false,
  "total_detect": 0,
  "active_user": null
}
```

✅ **Jika output seperti di atas, instalasi berhasil!**

---

## 📞 Support

Jika mengalami masalah instalasi:

1. Cek [Troubleshooting](#-troubleshooting) section
2. Google error message spesifik
3. Create GitHub Issue dengan:
   - Python version (`python --version`)
   - OS (Windows/Mac/Linux)
   - Error message lengkap
   - Output `pip list`

---

**Last Updated**: 8 Januari 2026
