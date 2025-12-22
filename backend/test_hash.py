from app.services.auth import hash_password, verify_password

try:
    pwd = "Admin@123"
    hashed = hash_password(pwd)
    print(f"Hash success: {hashed}")
    verified = verify_password(pwd, hashed)
    print(f"Verify success: {verified}")
except Exception as e:
    print(f"Error: {e}")
