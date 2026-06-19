import requests

BASE_URL = "http://localhost:8000"
LOGIN_PATH = "/api/auth/login"
TIMEOUT = 30

def test_postapiauthloginwithvalidcredentials():
    login_url = BASE_URL + LOGIN_PATH
    login_payload = {
        "email": "john@gmail.com",
        "password": "password123"
    }
    try:
        response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Check cookie instant_access_token is set and httpOnly
    cookies = response.cookies
    assert "instant_access_token" in cookies, "instant_access_token cookie not set"
    
    # The 'httpOnly' attribute is not directly accessible via requests library.
    # A workaround: Check 'Set-Cookie' header to confirm httpOnly attribute
    set_cookie_header = response.headers.get("Set-Cookie", "")
    assert "instant_access_token" in set_cookie_header, "instant_access_token cookie not in Set-Cookie header"
    assert "HttpOnly" in set_cookie_header, "instant_access_token cookie is not HttpOnly"

    # Validate response JSON structure and fields for user profile
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    # Validate message
    assert "message" in resp_json, "'message' field missing in response"
    assert resp_json["message"] == "User logged in successfully", f"Unexpected message: {resp_json.get('message')}"
    
    # Validate user profile fields
    assert "user" in resp_json, "'user' field missing in response"
    user = resp_json["user"]
    expected_fields = ["_id", "name", "email", "role", "phone", "createdAt", "updatedAt"]
    for field in expected_fields:
        assert field in user, f"Field '{field}' missing in user profile"
    # Validate email and role values
    assert user["email"] == "john@gmail.com", f"User email mismatch: expected 'john@gmail.com', got '{user['email']}'"
    assert user["role"] == "admin" or user["role"] == "user", f"Unexpected user role: {user['role']}"

test_postapiauthloginwithvalidcredentials()