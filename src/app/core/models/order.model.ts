export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
}

export interface Order {
  id?: number;
  customer_id: number;
  order_number?: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  customer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateOrderItemDTO {
  product_id: number;
  quantity: number;
}

export interface CreateOrderDTO {
  customer_id: number;
  items: CreateOrderItemDTO[];
  notes?: string;
  discount?: number;
  tax?: number;
}

export interface UpdateOrderDTO {
  status?: string;
  notes?: string;
  discount?: number;
  tax?: number;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order | Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  errors?: any[];
}
