# ============================================================
# api.py
# FIRE & SMOKE REAL-TIME DETECTION SYSTEM
# YOLOv8 + Stabilization + Telegram Alert
# ============================================================
# OPTIMIZED VERSION:
# - Fire priority override (Fire > Smoke)
# - Dual-frame processing (Original for Fire, CLAHE for Smoke)
# - Enhanced noise filtering & temporal stabilization
# - Smart logging system
# ============================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

from user_service import get_user_by_id          # ambil data user dari DB
from telegram_service import send_message, send_photo, can_send

import cv2
import numpy as np
import time
import os
import logging
from datetime import datetime

# ============================================================
# A. KONFIGURASI GLOBAL
# ============================================================

# Folder untuk menyimpan screenshot dan log
SCREENSHOT_DIR = "screenshots"
LOG_DIR = "logs"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# Setup Smart Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/detection_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("FireDetection")

# ============================================================
# A1. THRESHOLD CONFIDENCE (TUNED)
# ============================================================
# 🔥 Fire: threshold lebih tinggi untuk mengurangi false positive
# 💨 Smoke: threshold lebih tinggi untuk mengurangi false positive
CONF_FIRE  = 0.65   # 🔥 api butuh keyakinan lebih tinggi
CONF_SMOKE = 0.70   # 💨 asap butuh keyakinan lebih tinggi

# ============================================================
# A1.1 THRESHOLD UNTUK ALARM & NOTIFIKASI TELEGRAM
# ============================================================
# Hanya kirim notifikasi jika confidence >= threshold ini
NOTIFY_THRESHOLD_FIRE  = 0.70   # Fire >= 70% untuk notifikasi
NOTIFY_THRESHOLD_SMOKE = 0.60   # Smoke >= 60% untuk notifikasi

# ============================================================
# A2. MINIMAL BOUNDING BOX AREA (ANTI NOISE)
# ============================================================
MIN_BOX_AREA_FIRE  = 3000   # Fire minimal area lebih besar
MIN_BOX_AREA_SMOKE = 4500   # Smoke harus lebih besar (anti noise)

# ============================================================
# A3. STABILISASI TEMPORAL (FRAME STABILIZER)
# ============================================================
FIRE_FRAME_THRESHOLD  = 4   # Fire: butuh 4 frame konsekutif
SMOKE_FRAME_THRESHOLD = 6   # Smoke: butuh 6 frame konsekutif

# Frame counters terpisah per kelas
_fire_frame_count = 0
_smoke_frame_count = 0

# ============================================================
# A4. DETECTION HISTORY (untuk logging)
# ============================================================
_detection_history = []
MAX_HISTORY = 100

# ============================================================
# B. INISIALISASI FASTAPI
# ============================================================

app = FastAPI()

# Izinkan akses dari frontend (JS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# C. LOAD MODEL YOLO
# ============================================================

"""
data.yaml:
0 -> Fire
1 -> Smoke
"""

model = YOLO("../models/best.pt")

# ============================================================
# D. STATE GLOBAL SISTEM
# ============================================================

is_active = False          # status deteksi ON / OFF
active_user = None         # user yang sedang login
total_detect = 0           # total kejadian kebakaran

# ============================================================
# E. ENDPOINT: STATUS SISTEM
# ============================================================

@app.get("/status")
def status():
    """
    Digunakan frontend untuk cek kondisi backend
    """
    return {
        "api": "ready",
        "active": is_active,
        "total_detect": total_detect,
        "active_user": active_user
    }

# ============================================================
# F. ENDPOINT: CONTROL (START / STOP)
# ============================================================

@app.post("/control")
def control(payload: dict):
    """
    Mengaktifkan / menonaktifkan sistem deteksi
    Dipanggil dari dashboard
    """
    global is_active, active_user, total_detect

    cmd = payload.get("action")
    user_id = payload.get("user_id")

    if cmd == "start":
        is_active = True

        # Set user aktif (PENTING untuk Telegram)
        if user_id:
            user = get_user_by_id(user_id)
            if user:
                active_user = user
                print(f"[USER] Active user = {user['name']}")

    elif cmd == "stop":
        is_active = False
        active_user = None

    elif cmd == "reset":
        total_detect = 0

    print(f"[CONTROL] {cmd} | active={is_active}")

    return {
        "active": is_active,
        "total_detect": total_detect,
        "active_user": active_user
    }

# ============================================================
# G. ENDPOINT: DETECTION
# ============================================================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    """
    Endpoint utama:
    - Terima frame dari webcam
    - Deteksi api / asap dengan prioritas FIRE > SMOKE
    - Dual processing: Original frame untuk Fire, CLAHE untuk Smoke
    - Kirim Telegram jika valid
    """
    global total_detect, _fire_frame_count, _smoke_frame_count, _detection_history

    # --------------------------------------------------------
    # 1. GUARD CONDITION
    # --------------------------------------------------------
    if not is_active or not active_user:
        return {
            "fire": False,
            "confidence": 0.0,
            "time": time.strftime("%H:%M:%S")
        }

    # --------------------------------------------------------
    # 2. DECODE IMAGE
    # --------------------------------------------------------
    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame_original = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if frame_original is None:
        logger.error("Frame decode failed")
        return {
            "fire": False,
            "confidence": 0.0,
            "time": time.strftime("%H:%M:%S")
        }

    # --------------------------------------------------------
    # 3. DUAL FRAME PREPROCESSING
    # --------------------------------------------------------
    # Frame asli untuk deteksi FIRE (warna penting)
    frame_for_fire = frame_original.copy()

    # Frame CLAHE untuk deteksi SMOKE (kontras penting)
    gray = cv2.cvtColor(frame_original, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    frame_for_smoke = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

    # --------------------------------------------------------
    # 4. YOLO INFERENCE - DUAL PASS
    # --------------------------------------------------------
    # Pass 1: Deteksi FIRE pada frame asli
    results_fire = model(
        frame_for_fire,
        conf=0.10,
        imgsz=640,
        verbose=False
    )

    # Pass 2: Deteksi SMOKE pada frame CLAHE
    results_smoke = model(
        frame_for_smoke,
        conf=0.10,
        imgsz=640,
        verbose=False
    )

    # --------------------------------------------------------
    # 5. COLLECT CANDIDATES dengan PRIORITY LOGIC
    # --------------------------------------------------------
    fire_candidates = []
    smoke_candidates = []

    # Proses hasil deteksi FIRE (dari frame asli)
    if results_fire and results_fire[0].boxes is not None:
        for box in results_fire[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0]
            area = float((x2 - x1) * (y2 - y1))

            # Hanya ambil kelas Fire (cls=0) dari frame asli
            if cls == 0 and conf >= CONF_FIRE and area >= MIN_BOX_AREA_FIRE:
                fire_candidates.append({
                    "class": "Fire",
                    "confidence": conf,
                    "area": area,
                    "box": (x1, y1, x2, y2)
                })
                logger.debug(f"[FIRE CANDIDATE] conf={conf:.2f} area={int(area)}")

    # Proses hasil deteksi SMOKE (dari frame CLAHE)
    if results_smoke and results_smoke[0].boxes is not None:
        for box in results_smoke[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0]
            area = float((x2 - x1) * (y2 - y1))

            # Hanya ambil kelas Smoke (cls=1) dari frame CLAHE
            if cls == 1 and conf >= CONF_SMOKE and area >= MIN_BOX_AREA_SMOKE:
                smoke_candidates.append({
                    "class": "Smoke",
                    "confidence": conf,
                    "area": area,
                    "box": (x1, y1, x2, y2)
                })
                logger.debug(f"[SMOKE CANDIDATE] conf={conf:.2f} area={int(area)}")

    # --------------------------------------------------------
    # 6. PRIORITY OVERRIDE: FIRE > SMOKE
    # --------------------------------------------------------
    # Fire SELALU prioritas meskipun confidence lebih rendah
    detected_class = None
    max_conf = 0.0
    best_candidate = None

    if fire_candidates:
        # FIRE detected → prioritas absolut
        best_candidate = max(fire_candidates, key=lambda x: x["confidence"])
        detected_class = "Fire"
        max_conf = best_candidate["confidence"]
        logger.info(f"🔥 FIRE PRIORITY | conf={max_conf:.2f} area={int(best_candidate['area'])}")
    elif smoke_candidates:
        # Smoke hanya diproses jika TIDAK ada Fire
        best_candidate = max(smoke_candidates, key=lambda x: x["confidence"])
        detected_class = "Smoke"
        max_conf = best_candidate["confidence"]
        logger.info(f"💨 SMOKE DETECTED | conf={max_conf:.2f} area={int(best_candidate['area'])}")

    # --------------------------------------------------------
    # 7. STABILIZATION TEMPORAL (per-class counters)
    # --------------------------------------------------------
    fire_detected = False

    if detected_class == "Fire":
        _fire_frame_count += 1
        _smoke_frame_count = 0  # Reset smoke counter
        if _fire_frame_count >= FIRE_FRAME_THRESHOLD:
            fire_detected = True
            _fire_frame_count = 0

    elif detected_class == "Smoke":
        _smoke_frame_count += 1
        _fire_frame_count = 0  # Reset fire counter
        if _smoke_frame_count >= SMOKE_FRAME_THRESHOLD:
            fire_detected = True
            _smoke_frame_count = 0

    else:
        # Reset semua counter jika tidak ada deteksi
        _fire_frame_count = max(0, _fire_frame_count - 1)
        _smoke_frame_count = max(0, _smoke_frame_count - 1)

    # --------------------------------------------------------
    # 8. CONFIRMED DETECTION → ACTION
    # --------------------------------------------------------
    # Flag untuk menentukan apakah perlu kirim notifikasi
    should_notify = False
    
    if fire_detected:
        total_detect += 1

        # Log ke history
        detection_record = {
            "timestamp": datetime.now().isoformat(),
            "class": detected_class,
            "confidence": max_conf,
            "user": active_user['name']
        }
        _detection_history.append(detection_record)
        if len(_detection_history) > MAX_HISTORY:
            _detection_history.pop(0)

        # Cek apakah confidence cukup untuk notifikasi
        if detected_class == "Fire" and max_conf >= NOTIFY_THRESHOLD_FIRE:
            should_notify = True
            logger.warning(
                f"🚨 KEBAKARAN CONFIRMED (HIGH) | Jenis={detected_class} | "
                f"User={active_user['name']} | Conf={max_conf:.2f} | NOTIFIKASI AKTIF"
            )
        elif detected_class == "Smoke" and max_conf >= NOTIFY_THRESHOLD_SMOKE:
            should_notify = True
            logger.warning(
                f"🚨 KEBAKARAN CONFIRMED (HIGH) | Jenis={detected_class} | "
                f"User={active_user['name']} | Conf={max_conf:.2f} | NOTIFIKASI AKTIF"
            )
        else:
            # Deteksi tapi confidence rendah - tidak kirim notifikasi
            logger.info(
                f"⚠️ DETEKSI (LOW CONFIDENCE) | Jenis={detected_class} | "
                f"User={active_user['name']} | Conf={max_conf:.2f} | TANPA NOTIFIKASI"
            )

        # ----------------------------------------------------
        # 9. TELEGRAM ALERT (HANYA JIKA HIGH CONFIDENCE)
        # ----------------------------------------------------
        if should_notify and can_send():
            timestamp = int(time.time())
            filename = f"{SCREENSHOT_DIR}/fire_{timestamp}.jpg"
            cv2.imwrite(filename, frame_original)

            # Pesan seragam "KEBAKARAN" tapi tetap informatif detail
            message = (
                "🔥 *PERINGATAN KEBAKARAN* 🔥\n\n"
                f"👤 Pemilik: {active_user['name']}\n"
                f"📍 Alamat:\n{active_user['location']}\n\n"
                f"🚨 Jenis Deteksi: {detected_class}\n"
                f"🎯 Confidence: {max_conf:.2f}\n"
                f"⏰ Waktu: {time.strftime('%H:%M:%S')}\n\n"
                "⚠️ Segera lakukan penanganan darurat!"
            )

            send_message(message)
            send_photo(filename)
            logger.info(f"📤 Telegram alert sent | {filename}")

    # --------------------------------------------------------
    # 10. RESPONSE KE FRONTEND
    # --------------------------------------------------------
    return {
        "fire": fire_detected,
        "confidence": max_conf,
        "detected_class": detected_class,
        "should_notify": should_notify,  # Info ke frontend apakah high confidence
        "time": time.strftime("%H:%M:%S"),
        "user": active_user
    }
