# backend/user_service.py
from db import get_db

def get_user_by_id(user_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, location, chat_id FROM users WHERE id = %s LIMIT 1",
        (user_id,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return user
