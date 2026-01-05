# backend/telegram_service.py
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
COOLDOWN = 30  # Pengiriman Telegram setiap 30 detik sekali
print("[DEBUG] BOT_TOKEN =", BOT_TOKEN)
print("[DEBUG] CHAT_ID =", CHAT_ID)

_last_sent = 0

def can_send():
    global _last_sent
    now = time.time()
    if now - _last_sent >= COOLDOWN:
        _last_sent = now
        return True
    return False

def send_message(text: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text
    }

    res = requests.post(url, data=payload, timeout=10)

    print("[TELEGRAM] send_message status:", res.status_code)
    print("[TELEGRAM] response:", res.text)


def send_photo(image_path: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"

    with open(image_path, "rb") as f:
        files = {"photo": f}
        data = {"chat_id": CHAT_ID}

        res = requests.post(url, files=files, data=data, timeout=10)

        print("[TELEGRAM] send_photo status:", res.status_code)
        print("[TELEGRAM] response:", res.text)
