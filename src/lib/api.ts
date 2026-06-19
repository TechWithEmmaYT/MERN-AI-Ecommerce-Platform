import type { AuthResponse, LoginType, RegisterType, CreateAddressInput, AddressResponse, GetAddressesResponse } from "@/types/auth.type";
import type { CreateOrderInput, CreateOrderResponse, GetOrdersResponse, GetOrderByIdResponse } from "@/types/order.type";
import API from "./axios-client";
import type { CategoryResponseType } from "@/types/categories.type";
import type { DealsResponseType, ProductParams, ProductResponseType, ProductDetailResponseType, ReviewsResponseType } from "@/types/products.type";
import type { CartResponseType } from "@/types/cart.type";


export const loginMutationFn = async (data:LoginType):Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/login", data);
    return response.data
}

export const registerMutationFn = async (data: RegisterType): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/register", data);
    return response.data;
}

export const logoutMutationFn = async (): Promise<{ message: string }> => {
    const response = await API.post<{ message: string }>("/auth/logout");
    return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
    const response = await API.get<AuthResponse>("/auth/me");
    return response.data;
}

export const getAllCategoriesQueryFn = async (): Promise<CategoryResponseType> => {
    const response = await API.get<CategoryResponseType>("/categories");
    return response.data;
};

export const getProductDealsQueryFn = async (limit: number = 6): Promise<DealsResponseType> => {
    const response = await API.get<DealsResponseType>("/products/deals", {
        params: { limit },
    });
    return response.data;
};

export const getProductsQueryFn = async (params?: ProductParams): Promise<ProductResponseType> => {
    const queryParams: Record<string, any> = {};
    if (params) {
        if (params.categoryId !== undefined) queryParams.categoryId = params.categoryId;
        if (params.hasDiscount !== undefined) queryParams.hasDiscount = params.hasDiscount;
        if (params.inStock !== undefined) queryParams.inStock = params.inStock;
        if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
        if (params.sort !== undefined) queryParams.sort = params.sort;
        if (params.keyword !== undefined) queryParams.keyword = params.keyword;
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        if (params.skip !== undefined) queryParams.skip = params.skip;
    }
    const response = await API.get<ProductResponseType>("/products", {
        params: queryParams,
    });
    return response.data;
};

export const getProductBySlugQueryFn = async (slug: string): Promise<ProductDetailResponseType> => {
    const response = await API.get<ProductDetailResponseType>(`/products/${slug}`);
    return response.data;
};

export const getProductReviewsQueryFn = async (
    slug: string,
    params?: { page?: number; limit?: number }
): Promise<ReviewsResponseType> => {
    const response = await API.get<ReviewsResponseType>(`/products/${slug}/reviews`, {
        params,
    });
    return response.data;
};

export const getCartQueryFn = async (): Promise<CartResponseType> => {
    const response = await API.get<CartResponseType>("/cart/all");
    return response.data;
};

export const updateCartMutationFn = async (items: { productId: string; quantity: number }[]): Promise<CartResponseType> => {
    const response = await API.post<CartResponseType>("/cart", { items });
    return response.data;
};


export const getAddressesQueryFn = async (): Promise<GetAddressesResponse> => {
    const response = await API.get<GetAddressesResponse>("/address");
    return response.data;
};

export const createAddressMutationFn = async (data: CreateAddressInput): Promise<AddressResponse> => {
    const response = await API.post<AddressResponse>("/address", data);
    return response.data;
};

export const createOrderMutationFn = async (data: CreateOrderInput): Promise<CreateOrderResponse> => {
    const response = await API.post<CreateOrderResponse>("/orders", data);
    return response.data;
};

export const getOrdersQueryFn = async (): Promise<GetOrdersResponse> => {
    const response = await API.get<GetOrdersResponse>("/orders");
    return response.data;
};

export const getOrderByIdQueryFn = async (orderId: string): Promise<GetOrderByIdResponse> => {
    const response = await API.get<GetOrderByIdResponse>(`/orders/${orderId}`);
    return response.data;
};

export const getReviewableOrderItemsQueryFn = async (): Promise<any> => {
    const response = await API.get("/reviews/reviewable-items");
    return response.data;
};

export const getUserReviewsQueryFn = async (): Promise<any> => {
    const response = await API.get("/reviews");
    return response.data;
};

export const createReviewMutationFn = async (data: {
    orderId: string;
    orderItemId: string;
    rating: number;
    comment: string;
}): Promise<any> => {
    const response = await API.post("/reviews", data);
    return response.data;
};


export const getAdminAnalyticsQueryFn = async (): Promise<any> => {
    const response = await API.get("/admin/analytics");
    return response.data;
};

export const getAdminOrdersQueryFn = async (limit?: number): Promise<any> => {
    const response = await API.get("/admin/orders", {
        params: limit !== undefined ? { limit } : {},
    });
    return response.data;
};

export const updateOrderStatusMutationFn = async ({
    orderId,
    status,
    note,
}: {
    orderId: string;
    status: string;
    note?: string;
}): Promise<any> => {
    const response = await API.put(`/admin/orders/${orderId}/status`, { status, note });
    return response.data;
};

export const getAdminProductsQueryFn = async (): Promise<any> => {
    const response = await API.get("/admin/products");
    return response.data;
};


export const createProductMutationFn = async (data: {
    categoryId: string;
    name: string;
    description?: string;
    imageUrls: string[];
    originalPrice: number;
    discountPercent?: number;
    discountLabel?: string | null;
    unit: string;
    stockCount?: number;
    isActive?: boolean;
}): Promise<any> => {
    const response = await API.post("/admin/products", data);
    return response.data;
};

export const uploadProductImagesMutationFn = async (files: File[]): Promise<{ imageUrls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await API.post("/admin/products/upload", formData, {
        headers: { 
            "Content-Type": "multipart/form-data" 
        },
    });
    return response.data;
};

export const generateProductAiMutationFn = async (data: {
    action: "rephrase-title" | "generate-desc";
    title: string;
    unit?: string;
    description?: string;
}): Promise<{ result: string }> => {
    const response = await API.post("/admin/ai/generate", data);
    return response.data;
};





