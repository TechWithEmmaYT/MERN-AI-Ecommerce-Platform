import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
ADMIN_ORDERS_URL = f"{BASE_URL}/api/admin/orders"
CREATE_SESSION_URL = f"{BASE_URL}/api/payments/stripe/create-session"

EMAIL = "john@gmail.com"
PASSWORD = "password123"
TIMEOUT = 30

def test_postapipaymentsstripecreatesessionwithvalidorder():
    session = requests.Session()
    try:
        # Login to get authenticated session cookie
        login_payload = {"email": EMAIL, "password": PASSWORD}
        login_resp = session.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        # Validate cookie presence
        cookies = session.cookies.get_dict()
        assert "instant_access_token" in cookies, "Authentication cookie 'instant_access_token' not set after login"

        # Get admin orders to find a valid order ID
        params = {"page": 1, "limit": 20}
        orders_resp = session.get(ADMIN_ORDERS_URL, params=params, timeout=TIMEOUT)
        assert orders_resp.status_code == 200, f"Failed to fetch admin orders with status {orders_resp.status_code}"
        orders_data = orders_resp.json()
        assert "orders" in orders_data and isinstance(orders_data["orders"], list), "Orders list missing or invalid"

        # Find an order with paymentStatus "pending" or any order to test with
        order = None
        for o in orders_data["orders"]:
            if o.get("paymentStatus") == "pending":
                order = o
                break
        if not order and orders_data["orders"]:
            order = orders_data["orders"][0]
        assert order is not None, "No valid order found to create Stripe session"

        # Prepare payload with orderId
        payload = {"orderId": order["_id"]}

        create_session_resp = session.post(CREATE_SESSION_URL, json=payload, timeout=TIMEOUT)
        assert create_session_resp.status_code == 200, f"Stripe session creation failed with status {create_session_resp.status_code}"
        session_data = create_session_resp.json()

        # Validate expected keys in the Stripe session response
        assert "id" in session_data, "Stripe session response missing 'id'"
        assert "object" in session_data, "Stripe session response missing 'object'"
        assert session_data["object"] == "checkout.session", "Stripe session response object mismatch"
        assert "url" in session_data and isinstance(session_data["url"], str) and session_data["url"].startswith("https://"), "Stripe session response missing valid 'url'"

    finally:
        # Cleanup if any - none specified for this test case
        pass

test_postapipaymentsstripecreatesessionwithvalidorder()