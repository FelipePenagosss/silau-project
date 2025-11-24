export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export interface ProductCreateDTO {
  name: string;
  price: number;
  stock: number;
}

export interface ProductUpdateDTO {
  name?: string;
  price?: number;
  stock?: number;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
