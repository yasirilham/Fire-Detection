# backend/telegram_service.py
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
try:
    COOLDOWN = int(os.getenv("TELEGRAM_COOLDOWN", "30"))
except ValueError:
    COOLDOWN = 30

_configured = bool(BOT_TOKEN) and bool(CHAT_ID)

if os.getenv("TELEGRAM_DEBUG") == "1":
    print("[TELEGRAM_DEBUG] BOT_TOKEN configured:", bool(BOT_TOKEN))
    print("[TELEGRAM_DEBUG] CHAT_ID configured:", bool(CHAT_ID))
    print("[TELEGRAM_DEBUG] COOLDOWN:", COOLDOWN)

if not _configured:
    # Jangan bocorkan token/chat id; cukup beri tahu status.
    print("[TELEGRAM] disabled (token/chat_id not configured)")

_last_sent = 0


def is_enabled() -> bool:
    return _configured


def get_status() -> dict:
    now = time.time()
    seconds_since_last = None
    if _last_sent:
        seconds_since_last = max(0, int(now - _last_sent))
    return {
        "enabled": bool(_configured),
        "cooldown": int(COOLDOWN),
        "seconds_since_last": seconds_since_last,
    }

def can_send():
    global _last_sent
    if not _configured:
        return False
    now = time.time()
    if now - _last_sent >= COOLDOWN:
        _last_sent = now
        return True
    return False

def send_message(text: str):
    if not _configured:
        print("[TELEGRAM] send_message skipped (disabled)")
        return False
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text
    }

    try:
        res = requests.post(url, data=payload, timeout=10)
        print("[TELEGRAM] send_message status:", res.status_code)
        print("[TELEGRAM] response:", res.text)
        if res.status_code != 200:
            return False
        try:
            body = res.json()
            return bool(body.get("ok"))
        except Exception:
            return True
    except Exception as e:
        print("[TELEGRAM] send_message error:", repr(e))
        return False


def send_photo(image_path: str):
    if not _configured:
        print("[TELEGRAM] send_photo skipped (disabled)")
        return False
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"

    try:
        with open(image_path, "rb") as f:
            files = {"photo": f}
            data = {"chat_id": CHAT_ID}

            res = requests.post(url, files=files, data=data, timeout=10)

            print("[TELEGRAM] send_photo status:", res.status_code)
            print("[TELEGRAM] response:", res.text)
            if res.status_code != 200:
                return False
            try:
                body = res.json()
                return bool(body.get("ok"))
            except Exception:
                return True
    except Exception as e:
        print("[TELEGRAM] send_photo error:", repr(e))
        return False
