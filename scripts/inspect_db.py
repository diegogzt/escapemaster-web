import sqlite3
import os

DB_PATH = "../escapemaster-api/test.db"

def inspect_db():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Users ---")
    try:
        cursor.execute("SELECT id, email, is_active FROM users")
        users = cursor.fetchall()
        for u in users:
            print(u)
            if u[1] == "admin@dixai.net":
                print(f"  -> Found exact match for admin@dixai.net")
            elif u[1].lower() == "admin@dixai.net":
                print(f"  -> Found case-insensitive match: {u[1]}")
    except Exception as e:
        print(f"Error reading users: {e}")

    print("\n--- Password Resets ---")
    try:
        cursor.execute("SELECT email, code, is_used, expires_at FROM password_resets")
        resets = cursor.fetchall()
        for r in resets:
            print(r)
    except Exception as e:
        print(f"Error reading password_resets: {e}")

    conn.close()

if __name__ == "__main__":
    inspect_db()
