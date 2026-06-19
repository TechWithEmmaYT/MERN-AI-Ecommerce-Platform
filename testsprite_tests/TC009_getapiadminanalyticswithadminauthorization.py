import requests

BASE_URL = "http://localhost:8000"
LOGIN_PATH = "/api/auth/login"
ANALYTICS_PATH = "/api/admin/analytics"
LOGIN_EMAIL = "john@gmail.com"
LOGIN_PASSWORD = "password123"
TIMEOUT_SECONDS = 30

def test_getapiadminanalyticswithadminauthorization():
    session = requests.Session()
    # Login to get authenticated session with httpOnly cookie instant_access_token
    login_url = BASE_URL + LOGIN_PATH
    login_payload = {"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT_SECONDS)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        assert "message" in login_json and isinstance(login_json["message"], str)
        assert login_json["message"].lower().find("success") != -1
        assert "user" in login_json and isinstance(login_json["user"], dict)
        user = login_json["user"]
        assert all(k in user for k in ["_id", "name", "email", "role", "phone", "createdAt", "updatedAt"])
        assert user["email"] == LOGIN_EMAIL
        assert user["role"] == "admin"
        # The cookie instant_access_token must have been set in session cookies
        cookies = session.cookies.get_dict()
        assert "instant_access_token" in cookies, "instant_access_token cookie not set in login response"

        # Access the admin analytics endpoint with authenticated session
        analytics_url = BASE_URL + ANALYTICS_PATH
        analytics_resp = session.get(analytics_url, timeout=TIMEOUT_SECONDS)
        assert analytics_resp.status_code == 200, f"Analytics request failed with status {analytics_resp.status_code}"
        analytics_json = analytics_resp.json()
        # Validate presence and types of expected fields
        assert "message" in analytics_json and isinstance(analytics_json["message"], str)
        assert analytics_json["message"].lower().find("success") != -1
        expected_number_fields = ["totalSales", "totalOrders", "totalUsers", "totalProducts", "totalOutOfStock"]
        for field in expected_number_fields:
            assert field in analytics_json, f"Missing field {field} in analytics response"
            # The values should be int or float
            val = analytics_json[field]
            assert isinstance(val, (int, float)), f"Field {field} should be numeric, got {type(val)}"

    finally:
        session.close()

test_getapiadminanalyticswithadminauthorization()