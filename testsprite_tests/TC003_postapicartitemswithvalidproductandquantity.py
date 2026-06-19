import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CART_ITEMS_URL = f"{BASE_URL}/api/cart/items"
ADMIN_PRODUCTS_URL = f"{BASE_URL}/api/admin/products"

ADMIN_EMAIL = "john@gmail.com"
ADMIN_PASSWORD = "password123"

def test_post_api_cart_items_with_valid_product_and_quantity():
    session = requests.Session()
    login_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    login_resp = session.post(LOGIN_URL, json=login_payload, timeout=30)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    assert "instant_access_token" in login_resp.cookies or session.cookies.get("instant_access_token") is not None

    # Get a productId with sufficient stock from admin products list to test adding to cart
    params = {"page": 1, "limit": 10}
    products_resp = session.get(ADMIN_PRODUCTS_URL, params=params, timeout=30)
    assert products_resp.status_code == 200, f"Failed to get admin products: {products_resp.text}"

    products_data = products_resp.json()
    products = products_data.get("products", [])
    assert len(products) > 0, "No products available for adding to cart"

    product = None
    for p in products:
        if p.get("stockCount", 0) > 0 and p.get("isActive", False):
            product = p
            break
    assert product is not None, "No active product with stock available for test"

    product_id = product["_id"]
    quantity = 1

    cart_items_payload = {
        "productId": product_id,
        "quantity": quantity
    }

    post_cart_resp = session.post(CART_ITEMS_URL, json=cart_items_payload, timeout=30)
    assert post_cart_resp.status_code == 200, f"Failed to add item to cart: {post_cart_resp.text}"
    resp_json = post_cart_resp.json()

    # Validate response contains updated cart totals (common fields: subtotal, tax, deliveryFee, total)
    for key in ["subtotal", "tax", "deliveryFee", "total"]:
        assert key in resp_json, f"Response missing expected key '{key}'"
        assert isinstance(resp_json[key], (int, float)), f"Expected '{key}' to be a number"

    # Optionally, validate that quantity for the product in cart matches requested quantity
    # Assuming response contains 'items' with cart details
    assert "items" in resp_json and isinstance(resp_json["items"], list)
    found_item = next((item for item in resp_json["items"] if item.get("productId") == product_id), None)
    assert found_item is not None, "Added product not found in cart items"
    assert found_item.get("quantity") == quantity, "Cart item quantity does not match requested quantity"

test_post_api_cart_items_with_valid_product_and_quantity()