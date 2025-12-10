import requests

BASE_URL = "http://localhost:8000"
EMAIL = "admin@dixai.net"

def check_user():
    # We can't check user existence directly without auth usually, 
    # but we can try to register it and see if it says "already exists"
    # or try to login with a wrong password and see the error.
    
    print(f"Checking if user {EMAIL} exists...")
    
    # Try login
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": EMAIL,
        "password": "wrongpassword"
    })
    
    print(f"Login response: {response.status_code} - {response.text}")
    
    if response.status_code == 401:
        print("User likely exists (401 Unauthorized)")
    elif response.status_code == 400:
        print("User might not exist (400 Bad Request)")

def test_flow():
    # 1. Forgot Password
    print("\n1. Requesting password reset...")
    resp = requests.post(f"{BASE_URL}/auth/forgot-password", json={"email": EMAIL})
    print(f"Forgot Password: {resp.status_code} - {resp.text}")
    
    # We can't easily get the code without DB access, but we can check logs if we were running the server.
    # Since we are not running the server in this script, we can't see the code.
    # However, the user said they got the code "460426".
    
    # If I can't see the code, I can't test reset_password fully unless I mock the DB or have access to it.
    # But I can try to hit reset_password with a dummy code and see if I get "Invalid code" or "User not found".
    
    print("\n2. Testing reset with dummy code...")
    resp = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "email": EMAIL,
        "code": "000000",
        "new_password": "NewPassword123!"
    })
    print(f"Reset Password: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    check_user()
    test_flow()
