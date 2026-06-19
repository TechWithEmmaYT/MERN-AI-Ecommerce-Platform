import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
REVIEWS_URL = f"{BASE_URL}/api/reviews"
USER_ORDERS_URL = f"{BASE_URL}/api/orders"

EMAIL = "john@gmail.com"
PASSWORD = "password123"
TIMEOUT = 30

def login_user():
    session = requests.Session()
    resp = session.post(
        LOGIN_URL,
        json={"email": EMAIL, "password": PASSWORD},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200, f"Login failed with status {resp.status_code}"
    assert "instant_access_token" in resp.cookies, "Auth cookie not set"
    data = resp.json()
    assert "user" in data and data["user"] and data["user"].get("role") == "user"
    return session

def test_post_api_reviews_with_delivered_order_item():
    session = login_user()
    try:
        # Get user orders to find a delivered order with a non-reviewed item
        resp_orders = session.get(USER_ORDERS_URL, timeout=TIMEOUT)
        assert resp_orders.status_code == 200, f"Get user orders failed with {resp_orders.status_code}"
        data_orders = resp_orders.json()
        orders = data_orders.get("orders", []) if isinstance(data_orders, dict) else []
        delivered_order = None
        delivered_order_item = None

        for order in orders:
            if order.get("status") == "delivered":
                for item in order.get("items", []):
                    if not item.get("isReviewed", True):
                        delivered_order = order
                        delivered_order_item = item
                        break
            if delivered_order and delivered_order_item:
                break

        assert delivered_order is not None, "No delivered order found with unreviewed item"
        assert delivered_order_item is not None, "No unreviewed item found in delivered order"

        # Prepare review data
        review_payload = {
            "orderId": delivered_order["_id"],
            "productId": delivered_order_item["productId"],
            "rating": 5,
            "comment": "Excellent product, highly recommended!"
        }

        resp_review = session.post(REVIEWS_URL, json=review_payload, timeout=TIMEOUT)
        assert resp_review.status_code == 201, f"Review creation failed with status {resp_review.status_code}"

        review_response = resp_review.json()
        # Basic checks on response
        assert "message" in review_response and isinstance(review_response["message"], str)
    finally:
        pass

test_post_api_reviews_with_delivered_order_item()
