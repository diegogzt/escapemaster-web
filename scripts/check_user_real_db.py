import sys
import os
from dotenv import load_dotenv

# Add escapemaster-api to python path
api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../escapemaster-api'))
sys.path.append(api_path)

# Load .env from escapemaster-api
env_path = os.path.join(api_path, '.env')
print(f"Loading .env from {env_path}")
load_dotenv(env_path)

from sqlalchemy import text
from app.database import SessionLocal
from app.models.user import User
from app.models.password_reset import PasswordReset

def check_user():
    db = SessionLocal()
    try:
        print("Checking for user admin@dixai.net...")
        user = db.query(User).filter(User.email == "admin@dixai.net").first()
        if user:
            print(f"✅ User found: '{user.email}' (ID: {user.id})")
            print(f"   Active: {user.is_active}")
        else:
            print("❌ User admin@dixai.net NOT found in the database.")
            
        print("\nChecking password resets for admin@dixai.net...")
        resets = db.query(PasswordReset).filter(PasswordReset.email == "admin@dixai.net").all()
        for r in resets:
            print(f"   Code: {r.code}, Used: {r.is_used}, Expires: {r.expires_at}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
