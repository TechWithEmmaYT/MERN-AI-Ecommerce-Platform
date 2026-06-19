import AccountAddressesPage from "@/pages/account/addresses";
import AccountReviewsPage from "@/pages/account/reviews";
import CheckoutPage from "@/pages/checkout";
import HomePage from "@/pages/home";
import OrderTrackingPage from "@/pages/orders/order-tracking";
import OrdersPage from "@/pages/orders/orders";
import ProductDetailPage from "@/pages/product-detail";
import ProductsPage from "@/pages/products";
import SearchResultPage from "@/pages/search-results";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminProductsPage from "@/pages/admin/products";
import AdminNewProductPage from "@/pages/admin/new-product";


// export const AUTH_ROUTES = {
//   SIGN_IN: '/',
//   SIGN_UP: '/',
// };


export const PUBLIC_ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  SEARCH_RESULTS: '/search-results',
};


export const PROTECTED_ROUTES = {
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_TRACKING: '/orders/:orderId',
  ACCOUNT_REVIEWS: '/account/reviews',
  ACCOUNT_ADDRESSES: '/account/addresses',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_NEW: '/admin/products/new',
};


// export const authRouthsPaths: Array<{ path: string; element: React.ComponentType }> = [];

export const publicRoutesPaths = [
  {
    path: PUBLIC_ROUTES.HOME,
    element: HomePage,
  },
  {
    path: PUBLIC_ROUTES.PRODUCTS,
    element: ProductsPage,
  },
  {
    path: PUBLIC_ROUTES.PRODUCT_DETAIL,
    element: ProductDetailPage,
  },
  {
    path: PUBLIC_ROUTES.SEARCH_RESULTS,
    element: SearchResultPage,
  },
];

export const protectedRoutesPaths = [
  {
    path: PROTECTED_ROUTES.CHECKOUT,
    element: CheckoutPage,
  },
  {
    path: PROTECTED_ROUTES.ORDERS,
    element: OrdersPage,
    account: true,
  },
  {
    path: PROTECTED_ROUTES.ORDER_TRACKING,
    element: OrderTrackingPage,
    account: true,
  },
  {
    path: PROTECTED_ROUTES.ACCOUNT_REVIEWS,
    element: AccountReviewsPage,
    account: true,
  },
  {
    path: PROTECTED_ROUTES.ACCOUNT_ADDRESSES,
    element: AccountAddressesPage,
    account: true,
  }
];


export const adminRoutesPaths = [
  {
    path: PROTECTED_ROUTES.ADMIN_DASHBOARD,
    element: AdminDashboardPage,
  },
  {
    path: PROTECTED_ROUTES.ADMIN_ORDERS,
    element: AdminOrdersPage,
  },
  {
    path: PROTECTED_ROUTES.ADMIN_PRODUCTS,
    element: AdminProductsPage,
  },
  {
    path: PROTECTED_ROUTES.ADMIN_PRODUCTS_NEW,
    element: AdminNewProductPage,
  },
];

