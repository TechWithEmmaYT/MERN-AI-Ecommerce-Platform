import requests
import uuid

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = "/api/auth/login"
CHECKOUT_ENDPOINT = "/api/orders/checkout"
ADDRESSES_ENDPOINT = "/api/addresses"
CART_ITEMS_ENDPOINT = "/api/cart/items"

ADMIN_PREFIX = "/api/admin"

LOGIN_EMAIL = "john@gmail.com"
LOGIN_PASSWORD = "password123"
TIMEOUT = 30


def test_postapiorderscheckoutwithvaliddata():
    session = requests.Session()

    # Authenticate and establish admin session (httpOnly cookie stored in session)
    login_resp = session.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    assert "instant_access_token" in session.cookies, "Auth cookie not set after login"
    login_json = login_resp.json()
    assert "user" in login_json and login_json["user"]["email"] == LOGIN_EMAIL

    # Step 1: Get or create at least one product (via admin products endpoint) to add to cart
    # The PRD shows admin products at /api/admin/products with GET pagination.
    product_id = None
    try:
        # Get product list
        params = {"page": 1, "limit": 10}
        admin_products_resp = session.get(
            BASE_URL + ADMIN_PREFIX + "/products", params=params, timeout=TIMEOUT
        )
        assert admin_products_resp.status_code == 200, f"Fetch products failed: {admin_products_resp.text}"
        products_data = admin_products_resp.json()
        assert "products" in products_data and isinstance(products_data["products"], list)
        # Pick first active product with stock > 0 if exists
        product = next(
            (p for p in products_data["products"] if p["stockCount"] > 0 and p["isActive"]), None
        )
        if product is None:
            # Create a product to use
            create_product_payload = {
                "categoryId": str(uuid.uuid4()),
                "name": "Test Product for Checkout",
                "images": [],
                "originalPrice": 10.0,
                "discountPercent": 0,
                "unit": "pcs",
                "stockCount": 10,
                "isActive": True,
            }
            create_product_resp = session.post(
                BASE_URL + ADMIN_PREFIX + "/products",
                json=create_product_payload,
                timeout=TIMEOUT,
            )
            assert create_product_resp.status_code == 201, f"Create product failed: {create_product_resp.text}"
            product = create_product_resp.json().get("product")
            assert product and " _id" not in product
        product_id = product["_id"]

        # Step 2: Add product to cart
        add_cart_payload = {"productId": product_id, "quantity": 1}
        add_cart_resp = session.post(
            BASE_URL + CART_ITEMS_ENDPOINT, json=add_cart_payload, timeout=TIMEOUT
        )
        assert add_cart_resp.status_code == 200, f"Add to cart failed: {add_cart_resp.text}"
        add_cart_json = add_cart_resp.json()

        # Step 3: Get addresses - create one if none exists
        addresses_resp = session.get(BASE_URL + ADDRESSES_ENDPOINT, timeout=TIMEOUT)
        assert addresses_resp.status_code == 200, f"Fetch addresses failed: {addresses_resp.text}"
        addresses_json = addresses_resp.json()
        addresses_list = addresses_json if isinstance(addresses_json, list) else addresses_json.get("addresses", [])
        if not addresses_list:
            # Create a new address
            new_address_payload = {
                "recipientName": "John Test",
                "phone": "1234567890",
                "street": "123 Test St",
                "city": "Testville",
                "state": "TS",
                "postalCode": "12345",
                "country": "Testland"
            }
            create_address_resp = session.post(
                BASE_URL + ADDRESSES_ENDPOINT,
                json=new_address_payload,
                timeout=TIMEOUT,
            )
            assert create_address_resp.status_code == 201, f"Create address failed: {create_address_resp.text}"
            address = create_address_resp.json()
        else:
            address = addresses_list[0]

        # Step 4: Prepare checkout payload with cart, address, payment method 'card'
        checkout_payload = {
            "addressId": address.get("_id") or address.get("id"),  # Accepting _id or id key for address id
            "paymentMethod": "card"
        }

        # Since we need valid cart: cart is presumed updated after add to cart above

        checkout_resp = session.post(
            BASE_URL + CHECKOUT_ENDPOINT, json=checkout_payload, timeout=TIMEOUT
        )
        assert checkout_resp.status_code in (200, 201), f"Checkout failed: {checkout_resp.text}"
        checkout_json = checkout_resp.json()

        # Validate response contains order summary and server calculated totals
        keys = ["subtotal", "tax", "deliveryFee", "total"]
        for key in keys:
            assert key in checkout_json, f"Checkout response missing {key}"
            assert isinstance(checkout_json[key], (int, float)), f"{key} should be numeric"

        # Validate totals: subtotal + tax + deliveryFee == total (small float tolerance)
        calculated_total = checkout_json["subtotal"] + checkout_json["tax"] + checkout_json["deliveryFee"]
        assert abs(calculated_total - checkout_json["total"]) < 0.01, "Order total mismatch"

    finally:
        # Cleanup: remove cart items if needed (no direct endpoint documented, so ignoring)
        pass


test_postapiorderscheckoutwithvaliddata()