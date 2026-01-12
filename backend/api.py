# ============================================================
# api.py - FIRE & SMOKE DETECTION SYSTEM
# YOLOv8 + Motion Detection + Telegram Alert
# ============================================================

import sys
from pathlib import Path

# Some Python installs enable a "safe path" mode (e.g. PYTHONSAFEPATH / -P)
# that removes the current directory from sys.path. Ensure local modules in
# this folder (user_service.py, telegram_service.py, db.py) are importable.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from user_service import get_user_by_id
from telegram_service import send_message, send_photo, can_send, is_enabled as telegram_enabled, get_status as telegram_status
import cv2
import numpy as np
import time
import os
import logging
from datetime import datetime
import threading

# ============================================================
# KONFIGURASI
# ============================================================

SCREENSHOT_DIR = "screenshots"
LOG_DIR = "logs"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

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
# YOLO CLASS MAPPING
# - Keep mapping explicit for future-proofing.
# - Background is listed for reference but intentionally ignored by detection logic.
# ============================================================

CLASS_FIRE = 0
CLASS_SMOKE = 1
CLASS_BACKGROUND = 2

CLASS_NAMES = {
    CLASS_FIRE: "Fire",
    CLASS_SMOKE: "Smoke",
    CLASS_BACKGROUND: "Background",
}

# Threshold
# Lebih sensitif untuk objek kecil, tapi notif tetap dikunci oleh NOTIFY_*
CONF_FIRE = 0.45
CONF_SMOKE = 0.10
NOTIFY_FIRE = 0.70
NOTIFY_SMOKE = 0.15

# Area minimal (anti-noise)
MIN_AREA_FIRE = 900
MIN_AREA_SMOKE = 1800

# Stabilisasi frame
FIRE_FRAMES = 4
SMOKE_FRAMES = 9

# Motion detection (anti objek statis seperti tembok)
MOTION_THRESHOLD = 500  # Minimal pixel berubah untuk dianggap bergerak

# ============================================================
# STATE GLOBAL
# ============================================================

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = YOLO("../models/best.pt")

is_active = False
active_user = None
total_detect = 0

_fire_count = 0
_smoke_count = 0
_prev_frame = None  # Untuk motion detection
_detection_history = []

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def has_motion(frame, prev_frame):
    """Deteksi gerakan untuk filter objek statis (tembok)"""
    if prev_frame is None:
        return True
    
    gray1 = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gray1, gray2)
    motion_pixels = np.sum(diff > 30)
    
    return motion_pixels > MOTION_THRESHOLD

def preprocess_frame(frame, for_smoke=False):
    """Preprocessing frame"""
    if not for_smoke:
        return frame.copy()
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

def extract_candidates(results, target_class, conf_threshold, area_threshold):
    """Extract valid candidates dari YOLO results"""
    candidates = []
    
    if not results or results[0].boxes is None:
        return candidates
    
    for box in results[0].boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        x1, y1, x2, y2 = box.xyxy[0]
        area = float((x2 - x1) * (y2 - y1))
        
        if cls == target_class and conf >= conf_threshold and area >= area_threshold:
            label = CLASS_NAMES.get(cls, f"Unknown({cls})")
            candidates.append({
                "class": label,
                "confidence": conf,
                "area": area,
                "box": (x1, y1, x2, y2)
            })
    
    return candidates

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/status")
def status():
    return {
        "api": "ready",
        "active": is_active,
        "total_detect": total_detect,
        "active_user": active_user
    }


@app.get("/telegram/status")
def telegram_status_endpoint():
    return telegram_status()

@app.post("/control")
def control(payload: dict):
    global is_active, active_user, total_detect
    
    cmd = payload.get("action")
    user_id = payload.get("user_id")
    
    if cmd == "start":
        is_active = True
        if user_id:
            active_user = get_user_by_id(user_id)
    elif cmd == "stop":
        is_active = False
        active_user = None
    elif cmd == "reset":
        total_detect = 0
    
    logger.info(f"[CONTROL] {cmd} | active={is_active}")
    return {"active": is_active, "total_detect": total_detect, "active_user": active_user}


@app.post("/shutdown")
def shutdown(request: Request):
    client_host = request.client.host if request.client else ""
    if client_host not in ("127.0.0.1", "::1"):
        raise HTTPException(status_code=403, detail="forbidden")

    logger.warning("[CONTROL] shutdown requested")

    # Give the HTTP response time to flush, then terminate the process.
    threading.Timer(0.5, lambda: os._exit(0)).start()
    return {"status": "shutting_down"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    global total_detect, _fire_count, _smoke_count, _prev_frame, _detection_history
    
    # Guard: sistem tidak aktif
    if not is_active or not active_user:
        return {"fire": False, "confidence": 0.0, "time": time.strftime("%H:%M:%S")}
    
    # Decode frame
    image_bytes = await file.read()
    frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"fire": False, "confidence": 0.0, "time": time.strftime("%H:%M:%S")}
    
    # MOTION DETECTION (filter objek statis seperti tembok)
    if not has_motion(frame, _prev_frame):
        logger.debug("[MOTION] No movement detected - skipping frame")
        _prev_frame = frame
        return {"fire": False, "confidence": 0.0, "detected_class": None, "time": time.strftime("%H:%M:%S")}
    
    _prev_frame = frame
    
    # Preprocessing
    frame_fire = preprocess_frame(frame, for_smoke=False)
    frame_smoke = preprocess_frame(frame, for_smoke=True)
    
    # YOLO Inference
    results_fire = model(frame_fire, conf=0.10, imgsz=640, verbose=False)
    results_smoke = model(frame_smoke, conf=0.10, imgsz=640, verbose=False)
    
    # Extract candidates
    # Note: Background (CLASS_BACKGROUND) di abaikan karena bukan termasuk kedalam system.
    fire_cands = extract_candidates(results_fire, CLASS_FIRE, CONF_FIRE, MIN_AREA_FIRE)
    smoke_cands = extract_candidates(results_smoke, CLASS_SMOKE, CONF_SMOKE, MIN_AREA_SMOKE)
    
    # Priority logic: Fire > Smoke
    detected_class = None
    max_conf = 0.0
    
    if fire_cands:
        best = max(fire_cands, key=lambda x: x["confidence"])
        detected_class = "Fire"
        max_conf = best["confidence"]
    elif smoke_cands:
        best = max(smoke_cands, key=lambda x: x["confidence"])
        detected_class = "Smoke"
        max_conf = best["confidence"]
    
    # Stabilization
    fire_detected = False
    
    if detected_class == "Fire":
        _fire_count += 1
        _smoke_count = 0
        if _fire_count >= FIRE_FRAMES:
            fire_detected = True
            _fire_count = 0
    elif detected_class == "Smoke":
        _smoke_count += 1
        _fire_count = 0
        if _smoke_count >= SMOKE_FRAMES:
            fire_detected = True
            _smoke_count = 0
    else:
        _fire_count = max(0, _fire_count - 1)
        _smoke_count = max(0, _smoke_count - 1)
    
    # Action: notifikasi jika terdeteksi dan confidence tinggi
    should_notify = False
    telegram = {"status": "none"}
    
    if fire_detected:
        total_detect += 1
        
        # Log history
        _detection_history.append({
            "timestamp": datetime.now().isoformat(),
            "class": detected_class,
            "confidence": max_conf,
            "user": active_user['name']
        })
        if len(_detection_history) > 100:
            _detection_history.pop(0)
        
        # Cek threshold untuk notifikasi
        if (detected_class == "Fire" and max_conf >= NOTIFY_FIRE) or \
           (detected_class == "Smoke" and max_conf >= NOTIFY_SMOKE):
            should_notify = True
            logger.warning(f"🚨 KEBAKARAN | {detected_class} | {active_user['name']} | {max_conf:.2f}")
            
            # Telegram alert
            if not telegram_enabled():
                logger.info("[TELEGRAM] Skip (disabled / env not configured)")
                telegram = {"status": "disabled"}
            else:
                chat_id = None
                if isinstance(active_user, dict):
                    chat_id = active_user.get("chat_id")

                if not (chat_id or "").strip():
                    logger.info("[TELEGRAM] Skip (no chat_id for user)")
                    telegram = {"status": "no_chat_id"}
                    return {
                        "fire": fire_detected,
                        "confidence": max_conf,
                        "detected_class": detected_class,
                        "should_notify": should_notify,
                        "telegram": telegram,
                        "time": time.strftime("%H:%M:%S"),
                        "user": active_user
                    }

                if not can_send():
                    logger.info("[TELEGRAM] Skip (cooldown)")
                    telegram = {"status": "cooldown"}
                    return {
                        "fire": fire_detected,
                        "confidence": max_conf,
                        "detected_class": detected_class,
                        "should_notify": should_notify,
                        "telegram": telegram,
                        "time": time.strftime("%H:%M:%S"),
                        "user": active_user
                    }

                filename = f"{SCREENSHOT_DIR}/fire_{int(time.time())}.jpg"
                cv2.imwrite(filename, frame)
                
                message = (
                    f"🔥 *PERINGATAN KEBAKARAN* 🔥\n\n"
                    f"👤 Pemilik: {active_user['name']}\n"
                    f"📍 Alamat:\n{active_user['location']}\n\n"
                    f"🚨 Jenis: {detected_class}\n"
                    f"🎯 Confidence: {max_conf:.2f}\n"
                    f"⏰ Waktu: {time.strftime('%H:%M:%S')}\n\n"
                    f"⚠️ Segera lakukan penanganan!"
                )
                
                try:
                    msg_ok = send_message(message, chat_id=chat_id)
                    photo_ok = send_photo(filename, chat_id=chat_id)
                    telegram = {
                        "status": "sent" if (msg_ok and photo_ok) else ("partial" if (msg_ok or photo_ok) else "error"),
                        "message": bool(msg_ok),
                        "photo": bool(photo_ok),
                    }
                except Exception as e:
                    telegram = {"status": "error", "error": repr(e)}
        else:
            logger.info(f"⚠️ Deteksi rendah | {detected_class} | {max_conf:.2f}")
    
    return {
        "fire": fire_detected,
        "confidence": max_conf,
        "detected_class": detected_class,
        "should_notify": should_notify,
        "telegram": telegram,
        "time": time.strftime("%H:%M:%S"),
        "user": active_user
    }


if __name__ == "__main__":
    import uvicorn

    # Run directly from the app object so this works even when Python is in
    # safe-path mode (current directory not on sys.path).
    uvicorn.run(app, host="127.0.0.1", port=8000)
