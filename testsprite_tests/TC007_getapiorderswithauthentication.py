import requests

BASE_URL = "http://localhost:8000"
LOGIN_PATH = "/api/auth/login"
ORDERS_PATH = "/api/orders"
TIMEOUT = 30

def test_get_api_orders_with_authentication():
    session = requests.Session()

    # Login to get the authenticated cookie
    login_url = BASE_URL + LOGIN_PATH
    login_data = {"email": "john@gmail.com", "password": "password123"}

    try:
        login_resp = session.post(login_url, json=login_data, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        # Assert cookie instant_access_token is set and httpOnly is true (httpOnly can't be checked from client side)
        cookies = session.cookies.get_dict()
        assert "instant_access_token" in cookies, "instant_access_token cookie not set after login"

        # Access GET /api/orders with authenticated cookie
        orders_url = BASE_URL + ORDERS_PATH
        orders_resp = session.get(orders_url, timeout=TIMEOUT)
        assert orders_resp.status_code == 200, f"Expected 200 status for GET /api/orders, got {orders_resp.status_code}"
        
        orders_json = orders_resp.json()
        # Validate presence of orders list
        assert isinstance(orders_json, dict), "Response JSON is not a dictionary"
        assert "orders" in orders_json, "'orders' field missing in response"
        assert isinstance(orders_json["orders"], list), "'orders' field is not a list"

        # If orders present, check fields as per PRD user flow
        if orders_json["orders"]:
            order = orders_json["orders"][0]
            # Check some fields presence in an order
            for field in [
                "_id", "orderNo", "userId", "items", "shippingAddress", "paymentMethod", 
                "paymentStatus", "status", "subtotal", "deliveryFee", "tax", "total", 
                "createdAt", "updatedAt"
            ]:
                assert field in order, f"Field '{field}' missing in order"

            # Check userId is a string as PRD does not specify userId subfields in this endpoint
            userId = order["userId"]
            assert isinstance(userId, str), "Field 'userId' is not a string in order"

            # Check items array structure
            assert isinstance(order["items"], list), "'items' is not a list in order"
            if order["items"]:
                item = order["items"][0]
                for field in [
                    "productId", "name", "image", "originalPrice", "salePrice", 
                    "quantity", "isReviewed"
                ]:
                    assert field in item, f"Field '{field}' missing in order item"
            # Check shippingAddress fields
            shipping = order["shippingAddress"]
            for field in [
                "recipientName", "phone", "street", "city", "state", "postalCode", "country"
            ]:
                assert field in shipping, f"Field '{field}' missing in shippingAddress"

    finally:
        session.close()

test_get_api_orders_with_authentication()
