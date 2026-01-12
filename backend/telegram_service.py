# backend/telegram_service.py
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
try:
    COOLDOWN = int(os.getenv("TELEGRAM_COOLDOWN", "30"))
except ValueError:
    COOLDOWN = 30

if os.getenv("TELEGRAM_DEBUG") == "1":
    print("[TELEGRAM_DEBUG] COOLDOWN:", COOLDOWN)

_last_sent = 0


def is_enabled(bot_token: str | None = None) -> bool:
    token = (bot_token or "").strip() if bot_token is not None else ""
    return bool(token)


def get_status() -> dict:
    now = time.time()
    seconds_since_last = None
    if _last_sent:
        seconds_since_last = max(0, int(now - _last_sent))
    return {
        "cooldown": int(COOLDOWN),
        "seconds_since_last": seconds_since_last,
    }

def can_send():
    global _last_sent
    now = time.time()
    if now - _last_sent >= COOLDOWN:
        _last_sent = now
        return True
    return False

def _resolve_chat_id(chat_id: str | None) -> str | None:
    cid = (chat_id or "").strip() if chat_id is not None else ""
    return cid if cid else None


def send_message(text: str, chat_id: str | None = None, bot_token: str | None = None):
    token = (bot_token or "").strip() if bot_token is not None else ""
    if not token:
        print("[TELEGRAM] send_message skipped (no bot_token)")
        return False

    resolved = _resolve_chat_id(chat_id)
    if not resolved:
        print("[TELEGRAM] send_message skipped (no chat_id)")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": resolved,
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


def send_photo(image_path: str, chat_id: str | None = None, bot_token: str | None = None):
    token = (bot_token or "").strip() if bot_token is not None else ""
    if not token:
        print("[TELEGRAM] send_photo skipped (no bot_token)")
        return False

    resolved = _resolve_chat_id(chat_id)
    if not resolved:
        print("[TELEGRAM] send_photo skipped (no chat_id)")
        return False
    url = f"https://api.telegram.org/bot{token}/sendPhoto"

    try:
        with open(image_path, "rb") as f:
            files = {"photo": f}
            data = {"chat_id": resolved}

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
