import sys
import os
import time
import requests
from dotenv import load_dotenv

# Add flowy-api to python path
api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../flowy-api'))
sys.path.append(api_path)

# Load .env from flowy-api
env_path = os.path.join(api_path, '.env')
load_dotenv(env_path)

from app.database import SessionLocal
from app.models.password_reset import PasswordReset

BASE_URL = "http://localhost:8000"
EMAIL = "admin@dixai.net"

def get_latest_code(email):
    db = SessionLocal()
    try:
        # Get the most recent code
        reset = db.query(PasswordReset).filter(
            PasswordReset.email == email,
            PasswordReset.is_used == False
        ).order_by(PasswordReset.created_at.desc()).first()
        
        if reset:
            return reset.code
        return None
    finally:
        db.close()

def run_test():
    print(f"Testing reset flow for {EMAIL}")
    
    # 1. Request Reset
    print("1. Requesting password reset...")
    resp = requests.post(f"{BASE_URL}/auth/forgot-password", json={"email": EMAIL})
    print(f"   Response: {resp.status_code} - {resp.text}")
    
    if resp.status_code != 200:
        print("❌ Failed to request reset")
        return

    # 2. Get Code from DB
    print("2. Fetching code from DB...")
    time.sleep(2) # Wait for DB write
    code = get_latest_code(EMAIL)
    
    if not code:
        print("❌ No valid code found in DB!")
        return
        
    print(f"   Found code: {code}")
    
    # 3. Reset Password
    print("3. Resetting password...")
    new_password = "NewPassword123!"
    resp = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "email": EMAIL,
        "code": code,
        "new_password": new_password
    })
    print(f"   Response: {resp.status_code} - {resp.text}")
    
    if resp.status_code == 200:
        print("✅ Password reset SUCCESS!")
    else:
        print("❌ Password reset FAILED")

if __name__ == "__main__":
    run_test()
