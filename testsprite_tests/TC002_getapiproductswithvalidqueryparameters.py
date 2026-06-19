import requests

BASE_URL = "http://localhost:8000"

def test_get_api_products_with_valid_query_parameters():
    session = requests.Session()
    login_url = f"{BASE_URL}/api/auth/login"
    admin_products_url = f"{BASE_URL}/api/admin/products"

    # Credentials for admin login
    login_payload = {
        "email": "john@gmail.com",
        "password": "password123"
    }
    
    # Login as admin and establish session with httpOnly cookie
    login_response = session.post(login_url, json=login_payload, timeout=30)
    assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
    assert session.cookies.get("instant_access_token") is not None, "Auth cookie instant_access_token not set"
    login_data = login_response.json()
    assert "user" in login_data and login_data["user"].get("role") == "admin", "Logged in user is not admin"
    
    # Prepare valid query parameters for products listing according to PRD admin endpoint
    params = {
        "page": 1,
        "limit": 20
    }
    
    # Send GET request to admin products with query parameters and authenticated session
    response = session.get(admin_products_url, params=params, timeout=30)
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    
    resp_json = response.json()
    assert "products" in resp_json, "Response missing products field"
    assert isinstance(resp_json["products"], list), "Products field is not a list"
    assert "pagination" in resp_json, "Response missing pagination metadata"
    pagination = resp_json["pagination"]
    # Validate pagination fields and types
    expected_pagination_fields = ["page", "limit", "total", "totalPages", "hasNextPage", "hasPrevPage"]
    for f in expected_pagination_fields:
        assert f in pagination, f"Pagination missing field {f}"
    assert pagination["page"] == params["page"], "Pagination page mismatch"
    assert pagination["limit"] == params["limit"], "Pagination limit mismatch"
    
    for product in resp_json["products"]:
        assert "categoryId" in product and isinstance(product["categoryId"], str)
        assert "name" in product and isinstance(product["name"], str)
        assert "originalPrice" in product and isinstance(product["originalPrice"], (int,float))
        assert "salePrice" in product and isinstance(product["salePrice"], (int,float))
        assert "stockCount" in product and isinstance(product["stockCount"], int)
        assert "isActive" in product and isinstance(product["isActive"], bool)

test_get_api_products_with_valid_query_parameters()
