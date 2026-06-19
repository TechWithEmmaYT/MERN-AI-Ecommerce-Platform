import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = "/api/auth/login"
ADMIN_ORDERS_ENDPOINT = "/api/admin/orders"
ADMIN_ORDER_STATUS_ENDPOINT = "/api/admin/orders/{order_id}/status"
LOGIN_EMAIL = "john@gmail.com"
LOGIN_PASSWORD = "password123"
TIMEOUT = 30


def test_putapiadminordersidstatuswithvalidstatus():
    session = requests.Session()
    # Login to get the instant_access_token cookie
    login_payload = {
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    }
    login_response = session.post(
        BASE_URL + LOGIN_ENDPOINT,
        json=login_payload,
        timeout=TIMEOUT
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    assert "instant_access_token" in session.cookies, "Auth cookie not set after login"

    # Get admin orders list to find a valid order id and current status
    orders_response = session.get(
        BASE_URL + ADMIN_ORDERS_ENDPOINT,
        params={"page": 1, "limit": 20},
        timeout=TIMEOUT
    )
    assert orders_response.status_code == 200, f"Failed to get orders list: {orders_response.text}"
    orders_data = orders_response.json()
    assert orders_data.get("orders") and isinstance(orders_data["orders"], list), "Orders list missing or invalid"

    order = None
    # Find an order with a status that can be moved forward (permitted next statuses)
    # According to PRD allowable statuses in PUT: confirmed, assigned, packed, out_for_delivery, delivered, cancelled
    # We'll attempt to advance the status in a logical manner
    status_flow = ["placed", "confirmed", "assigned", "packed", "out_for_delivery", "delivered"]
    for o in orders_data["orders"]:
        current_status = o.get("status")
        if current_status in status_flow:
            idx = status_flow.index(current_status)
            if idx + 1 < len(status_flow):
                next_status = status_flow[idx + 1]
                order = o
                break
    if order is None:
        raise AssertionError("No suitable order found to update status")

    order_id = order["_id"]

    update_payload = {"status": next_status, "note": "Status updated by automated test"}

    # Update order status
    put_response = session.put(
        BASE_URL + ADMIN_ORDER_STATUS_ENDPOINT.format(order_id=order_id),
        json=update_payload,
        timeout=TIMEOUT
    )

    assert put_response.status_code == 200, f"Failed to update order status: {put_response.text}"
    put_response_json = put_response.json()

    assert put_response_json.get("message") == "Order status updated successfully"
    updated_order = put_response_json.get("order")
    assert updated_order and isinstance(updated_order, dict), "Updated order data missing or invalid"
    assert updated_order.get("_id") == order_id, "Updated order ID mismatch"
    assert updated_order.get("status") == next_status, "Order status did not update correctly"
    assert isinstance(updated_order.get("statusHistory"), list) and len(updated_order["statusHistory"]) > 0, \
        "Status history missing or empty"

    # Verify the last statusHistory entry matches the update
    last_status_history = updated_order["statusHistory"][-1]
    assert last_status_history.get("status") == next_status, "Status history last entry status incorrect"
    assert last_status_history.get("note") == update_payload["note"], "Status history note incorrect"
    assert "date" in last_status_history, "Status history date missing"


test_putapiadminordersidstatuswithvalidstatus()