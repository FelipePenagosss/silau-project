/**
 * Order Status Types
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Main Order Entity
 */
export interface Order {
  id?: number;
  customer_id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Order Item Entity
 */
export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  created_at?: string;
}

/**
 * Order with Items (for responses)
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
}

/**
 * DTO for creating an order item
 */
export interface CreateOrderItemDTO {
  product_id: number;
  quantity: number;
}

/**
 * DTO for creating an order
 */
export interface CreateOrderDTO {
  customer_id: number;
  items: CreateOrderItemDTO[];
  notes?: string;
  discount?: number;
  tax?: number;
}

/**
 * DTO for updating an order
 */
export interface UpdateOrderDTO {
  status?: OrderStatus;
  notes?: string;
  discount?: number;
  tax?: number;
}

/**
 * Query parameters for listing orders
 */
export interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

/**
 * Pagination response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}