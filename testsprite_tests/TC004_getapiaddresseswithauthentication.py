import requests

BASE_URL = "http://localhost:8000"
LOGIN_PATH = "/api/auth/login"
ADDRESSES_PATH = "/api/addresses"
LOGIN_EMAIL = "john@gmail.com"
LOGIN_PASSWORD = "password123"
TIMEOUT = 30

def test_getapiaddresseswithauthentication():
    session = requests.Session()
    login_url = BASE_URL + LOGIN_PATH
    login_payload = {
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    }

    try:
        # Login to get auth cookie
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        assert "message" in login_json and login_json["message"].lower().find("logged in") != -1
        assert "user" in login_json
        user = login_json["user"]
        required_user_fields = ["_id", "name", "email", "role", "phone", "createdAt", "updatedAt"]
        for field in required_user_fields:
            assert field in user, f"User profile missing field {field}"
        # Check cookie presence in session.cookies (httpOnly cookie is stored in cookies jar)
        assert session.cookies.get("instant_access_token") is not None, "Authentication cookie 'instant_access_token' not set"

        # Make authenticated request to /api/addresses
        addresses_url = BASE_URL + ADDRESSES_PATH
        resp = session.get(addresses_url, timeout=TIMEOUT)
        assert resp.status_code == 200, f"GET {ADDRESSES_PATH} failed with status {resp.status_code}"

        addresses_json = resp.json()
        # Expect response to be an object containing list of addresses
        assert isinstance(addresses_json, dict), "Expected response to be a dict with addresses list"
        assert "addresses" in addresses_json, "Response missing 'addresses' key"
        addresses_list = addresses_json["addresses"]
        assert isinstance(addresses_list, list), "Expected 'addresses' to be a list"
        # If there are addresses, check fields in each
        if addresses_list:
            required_address_fields = ["recipientName", "phone", "street", "city", "state", "postalCode", "country"]
            for address in addresses_list:
                for field in required_address_fields:
                    assert field in address, f"Address missing field {field}"
    finally:
        session.close()

test_getapiaddresseswithauthentication()
