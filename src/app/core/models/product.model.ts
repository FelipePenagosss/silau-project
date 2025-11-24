export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export interface ProductResponse {
  success: boolean;
  data?: Product | Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
