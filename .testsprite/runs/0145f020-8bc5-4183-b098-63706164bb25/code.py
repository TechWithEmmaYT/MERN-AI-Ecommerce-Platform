# Auto-injected credentials — do not modify
__AUTH_CREDENTIAL__ = ""
__AUTH_TYPE__ = "public"
__AUTH_HEADERS__ = {}
import json
import requests
import urllib3

BASE = "https://instant-cart.onrender.com/api"

session = requests.Session()


def request(method, path, body=None, cookie=None):
    headers = {}
    headers.update(__AUTH_HEADERS__)
    if cookie:
        headers["Cookie"] = cookie
    if body is not None:
        headers["Content-Type"] = "application/json"

    resp = session.request(
        method=method,
        url=f"{BASE}{path}",
        headers=headers,
        data=json.dumps(body) if body is not None else None,
        timeout=30,
        allow_redirects=False,
    )
    set_cookie = resp.headers.get("set-cookie", "")
    try:
        payload = resp.json()
    except Exception:
        payload = None
    return resp.status_code, payload, set_cookie


guest_cookie = ""
product_id = ""


def fetch_first_product_id():
    resp = session.get(f"{BASE}/products?limit=1", timeout=30, allow_redirects=False)
    assert resp.status_code == 200, f"expected 200 from products list, got {resp.status_code}"
    data = resp.json()
    products = data.get("products") if isinstance(data, dict) else None
    assert isinstance(products, list) and len(products) > 0, "no products in DB"
    first = products[0]
    assert isinstance(first, dict) and first.get("_id"), "missing product id"
    return first["_id"]


def test_add_to_cart_as_guest():
    global guest_cookie, product_id
    product_id = fetch_first_product_id()
    status, body, set_cookie = request("POST", "/cart", body={"items": [{"productId": product_id, "quantity": 2}]})

    assert status == 200, f"expected 200, got {status}"
    assert isinstance(body, dict), f"expected JSON body, got {body}"
    assert body.get("message") == "Cart updated successfully", f"wrong message: {body.get('message')}"

    guest_cookie = set_cookie.split(";")[0]
    assert guest_cookie.startswith("instant_guest_cart_id="), "missing guest cart cookie"

    cart = body.get("cart")
    assert isinstance(cart, dict), "missing cart"
    items = cart.get("items")
    assert isinstance(items, list) and len(items) > 0, "cart items is empty"
    first = items[0]
    assert isinstance(first, dict), "first cart item is not an object"
    assert first.get("quantity") == 2, f"expected qty 2, got {first.get('quantity')}"
    assert isinstance(body.get("subtotal"), (int, float)), "missing subtotal"
    assert isinstance(body.get("orderTotal"), (int, float)), "missing orderTotal"


def test_get_cart_returns_items():
    assert guest_cookie, "no guest cookie from previous test"
    status, body, _ = request("GET", "/cart", cookie=guest_cookie)

    assert status == 200, f"expected 200, got {status}"
    assert isinstance(body, dict), f"expected JSON body, got {body}"
    assert body.get("message") == "Cart retrieved successfully", f"wrong message: {body.get('message')}"
    cart = body.get("cart")
    assert isinstance(cart, dict), "missing cart"
    items = cart.get("items")
    assert isinstance(items, list) and len(items) > 0, "cart items is empty"


def test_update_cart_quantity():
    assert guest_cookie and product_id, "missing test state"
    status, body, _ = request("POST", "/cart", cookie=guest_cookie, body={"items": [{"productId": product_id, "quantity": 5}]})

    assert status == 200, f"expected 200, got {status}"
    assert isinstance(body, dict), f"expected JSON body, got {body}"
    items = body.get("cart", {}).get("items", [])
    assert isinstance(items, list) and len(items) > 0, "missing cart items"
    assert items[0].get("quantity") == 5, f"expected qty 5, got {items[0].get('quantity')}"


def test_add_multiple_items():
    assert guest_cookie, "missing test state"
    resp = session.get(f"{BASE}/products?limit=2", timeout=30, allow_redirects=False)
    assert resp.status_code == 200, f"expected 200 from products list, got {resp.status_code}"
    data = resp.json()
    products = data.get("products") if isinstance(data, dict) else None
    if not isinstance(products, list) or len(products) < 2:
        return

    second_id = products[1].get("_id")
    assert second_id, "missing second product id"
    status, body, _ = request("POST", "/cart", cookie=guest_cookie, body={"items": [{"productId": second_id, "quantity": 1}]})

    assert status == 200, f"expected 200, got {status}"
    assert isinstance(body, dict), f"expected JSON body, got {body}"
    cart = body.get("cart")
    assert isinstance(cart, dict), "missing cart"
    items = cart.get("items", [])
    assert isinstance(items, list) and len(items) > 0, "expected cart items after update"
    assert body.get("message") == "Cart updated successfully", f"wrong message: {body.get('message')}"


def test_clear_cart():
    assert guest_cookie, "missing test state"
    status, body, _ = request("POST", "/cart", cookie=guest_cookie, body={"items": []})

    assert status == 200, f"expected 200, got {status}"
    assert isinstance(body, dict), f"expected JSON body, got {body}"
    items = body.get("cart", {}).get("items", [])
    assert isinstance(items, list), "missing cart items"
    assert len(items) == 0, "expected empty cart after clearing"
    assert body.get("subtotal") == 0, "expected subtotal 0"
    assert body.get("orderTotal") == 0, "expected orderTotal 0"


def main():
    tests = [
        test_add_to_cart_as_guest,
        test_get_cart_returns_items,
        test_update_cart_quantity,
        test_add_multiple_items,
        test_clear_cart,
    ]
    failures = 0
    for test in tests:
        try:
            test()
        except AssertionError as err:
            failures += 1
            print(f"{test.__name__}: {err}")
    raise SystemExit(1 if failures else 0)


main()