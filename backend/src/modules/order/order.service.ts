// backend/src/modules/order/order.service.ts

import { supabase } from '../../config/supabase';
import {
  Order,
  OrderItem,
  OrderWithItems,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderListQuery,
  PaginationMeta,
} from './order.model';

export class OrderService {
  private ordersTable = 'orders';
  private orderItemsTable = 'order_items';
  private productsTable = 'Product';
  private customersTable = 'customers';

  /**
   * Generate a unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { count, error } = await supabase
      .from(this.ordersTable)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`);

    if (error) {
      throw new Error(`Error generating order number: ${error.message}`);
    }

    const orderCount = (count || 0) + 1;
    return `ORD-${year}-${String(orderCount).padStart(6, '0')}`;
  }

  /**
   * List orders with pagination and filters
   */
  async listOrders(query: OrderListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const search = query.search || '';

    let supabaseQuery = supabase
      .from(this.ordersTable)
      .select(`
        *,
        customer:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `, { count: 'exact' })
      .is('deleted_at', null);

    // Search filter
    if (search) {
      supabaseQuery = supabaseQuery.or(
        `order_number.ilike.%${search}%,notes.ilike.%${search}%`
      );
    }

    // Status filter
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    // Customer filter
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }

    // Date range filters
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }
    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.date_to);
    }

    const { data, error, count } = await supabaseQuery
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    return {
      data: data as any[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a single order by ID with items
   */
  async getOrderById(id: number): Promise<OrderWithItems | null> {
    // Get order with customer info
    const { data: orderData, error: orderError } = await supabase
      .from(this.ordersTable)
      .select(`
        *,
        customer:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching order: ${orderError.message}`);
    }

    // Get order items
    const { data: itemsData, error: itemsError } = await supabase
      .from(this.orderItemsTable)
      .select('*')
      .eq('order_id', id)
      .order('id', { ascending: true });

    if (itemsError) {
      throw new Error(`Error fetching order items: ${itemsError.message}`);
    }

    return {
      ...orderData,
      items: itemsData as OrderItem[],
    } as OrderWithItems;
  }

  /**
   * Create a new order with automatic stock update
   * ✅ MEJORADO: Con rollback completo si falla
   */
  async createOrder(orderData: CreateOrderDTO): Promise<OrderWithItems> {
    console.log('🛒 Creating order...');

    // 1. Validate customer exists
    const { data: customer, error: customerError } = await supabase
      .from(this.customersTable)
      .select('id')
      .eq('id', orderData.customer_id)
      .is('deleted_at', null)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // 2. Validate products and check stock
    const productIds = orderData.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from(this.productsTable)
      .select('*')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }

    if (!products || products.length !== productIds.length) {
      throw new Error('One or more products not found');
    }

    // 3. Check stock availability and calculate totals
    let subtotal = 0;
    const itemsToInsert: any[] = [];
    const stockUpdates: any[] = [];

    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.product_id);

      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      // ✅ Validación mejorada de stock
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.name}. ` +
          `Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      itemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: itemSubtotal,
        product_name: product.name,
      });

      stockUpdates.push({
        id: product.id,
        name: product.name,
        oldStock: product.stock,
        newStock: product.stock - item.quantity,
        quantity: item.quantity,
      });
    }

    // 4. Calculate total with tax and discount
    const discount = orderData.discount || 0;
    const tax = orderData.tax || 0;
    const total = subtotal - discount + tax;

    // 5. Generate order number
    const orderNumber = await this.generateOrderNumber();

    // 6. Create order
    const { data: newOrder, error: orderInsertError } = await supabase
      .from(this.ordersTable)
      .insert([{
        customer_id: orderData.customer_id,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax,
        discount,
        total,
        notes: orderData.notes || null,
      }])
      .select()
      .single();

    if (orderInsertError) {
      throw new Error(`Error creating order: ${orderInsertError.message}`);
    }

    console.log(`📝 Order ${orderNumber} created with ID: ${newOrder.id}`);

    // 7. Create order items
    const itemsWithOrderId = itemsToInsert.map(item => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { data: createdItems, error: itemsInsertError } = await supabase
      .from(this.orderItemsTable)
      .insert(itemsWithOrderId)
      .select();

    if (itemsInsertError) {
      // Rollback: delete the order
      console.error('❌ Failed to create order items, rolling back order');
      await supabase.from(this.ordersTable).delete().eq('id', newOrder.id);
      throw new Error(`Error creating order items: ${itemsInsertError.message}`);
    }

    console.log(`📦 ${createdItems?.length} items added to order`);

    // 8. ✅ MEJORADO: Update product stock with proper error handling
    let stockUpdateFailed = false;
    let failedProductId: number | null = null;

    for (const update of stockUpdates) {
      const { error: stockError } = await supabase
        .from(this.productsTable)
        .update({ stock: update.newStock })
        .eq('id', update.id);

      if (stockError) {
        console.error(`❌ Failed to update stock for product ${update.id}:`, stockError);
        stockUpdateFailed = true;
        failedProductId = update.id;
        break; // Stop at first failure
      } else {
        console.log(
          `✅ Stock updated for ${update.name}: ${update.oldStock} → ${update.newStock} (-${update.quantity})`
        );
      }
    }

    // ✅ NUEVO: Rollback complete if stock update failed
    if (stockUpdateFailed) {
      console.error('❌ Stock update failed, rolling back entire order');
      
      // Delete order items
      await supabase.from(this.orderItemsTable).delete().eq('order_id', newOrder.id);
      
      // Delete order
      await supabase.from(this.ordersTable).delete().eq('id', newOrder.id);
      
      throw new Error(
        `Failed to update stock for product ID ${failedProductId}. Order has been cancelled.`
      );
    }

    console.log('✅ Order created successfully with stock updated');

    // 9. Return complete order with items
    return {
      ...newOrder,
      items: createdItems as OrderItem[],
    } as OrderWithItems;
  }

  /**
   * ✅ NUEVO: Cancel order and restore stock
   */
  async cancelOrderAndRestoreStock(id: number): Promise<OrderWithItems> {
    console.log(`🔄 Cancelling order ${id} and restoring stock...`);

    // Get order with items
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'delivered') {
      throw new Error('Cannot cancel a delivered order');
    }

    // Restore stock for each item
    for (const item of order.items) {
      // Get current stock
      const { data: product, error: productError } = await supabase
        .from(this.productsTable)
        .select('stock, name')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        console.error(`⚠️  Product ${item.product_id} not found for stock restoration`);
        continue; // Skip this product but continue with others
      }

      const newStock = product.stock + item.quantity;

      // Update stock
      const { error: stockError } = await supabase
        .from(this.productsTable)
        .update({ stock: newStock })
        .eq('id', item.product_id);

      if (stockError) {
        console.error(`❌ Failed to restore stock for product ${item.product_id}:`, stockError);
        throw new Error(`Failed to restore stock for product: ${product.name}`);
      }

      console.log(
        `✅ Stock restored for ${product.name}: ${product.stock} → ${newStock} (+${item.quantity})`
      );
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from(this.ordersTable)
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Error updating order status: ${updateError.message}`);
    }

    console.log('✅ Order cancelled and stock restored successfully');

    // Return updated order
    const updatedOrder = await this.getOrderById(id);
    return updatedOrder as OrderWithItems;
  }

  /**
   * Update an order
   */
  async updateOrder(id: number, orderData: UpdateOrderDTO): Promise<OrderWithItems | null> {
    // Verify order exists
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      return null;
    }

    // Recalculate total if discount or tax changed
    let updatePayload: any = { ...orderData };

    if (orderData.discount !== undefined || orderData.tax !== undefined) {
      const discount = orderData.discount !== undefined ? orderData.discount : existingOrder.discount;
      const tax = orderData.tax !== undefined ? orderData.tax : existingOrder.tax;
      const total = existingOrder.subtotal - discount + tax;
      updatePayload.total = total;
    }

    // Update order
    const { data, error } = await supabase
      .from(this.ordersTable)
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }

    // Return updated order with items
    return this.getOrderById(id);
  }

  /**
   * ✅ MEJORADO: Update order status with stock handling
   */
  async updateOrderStatus(id: number, status: string): Promise<OrderWithItems | null> {
    console.log(`📝 Updating order ${id} status to: ${status}`);

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    const oldStatus = order.status;

    // ✅ NUEVO: If changing from cancelled to another status, re-deduct stock
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      console.log('🔄 Reactivating cancelled order, validating stock...');

      // Validate stock is available again
      for (const item of order.items) {
        const { data: product } = await supabase
          .from(this.productsTable)
          .select('stock, name')
          .eq('id', item.product_id)
          .single();

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock to reactivate order. Product: ${product?.name || item.product_id}, ` +
            `Available: ${product?.stock || 0}, Required: ${item.quantity}`
          );
        }
      }

      // Deduct stock again
      for (const item of order.items) {
        const { data: product } = await supabase
          .from(this.productsTable)
          .select('stock, name')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = product.stock - item.quantity;
          await supabase
            .from(this.productsTable)
            .update({ stock: newStock })
            .eq('id', item.product_id);

          console.log(
            `✅ Stock re-deducted for ${product.name}: ${product.stock} → ${newStock} (-${item.quantity})`
          );
        }
      }
    }

    // ✅ NUEVO: If changing to cancelled, restore stock
    if (oldStatus !== 'cancelled' && status === 'cancelled') {
      console.log('🔄 Cancelling order, restoring stock...');
      return await this.cancelOrderAndRestoreStock(id);
    }

    // Update status
    const { error } = await supabase
      .from(this.ordersTable)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }

    console.log(`✅ Order ${id} status updated: ${oldStatus} → ${status}`);

    return this.getOrderById(id);
  }

  /**
   * Soft delete an order
   */
  async softDeleteOrder(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.ordersTable)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error soft deleting order: ${error.message}`);
    }
  }

  /**
   * Hard delete an order (use with caution)
   */
  async hardDeleteOrder(id: number): Promise<void> {
    // First delete order items (cascade should handle this, but being explicit)
    const { error: itemsError } = await supabase
      .from(this.orderItemsTable)
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      throw new Error(`Error deleting order items: ${itemsError.message}`);
    }

    // Then delete order
    const { error } = await supabase
      .from(this.ordersTable)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error hard deleting order: ${error.message}`);
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(customer_id?: number) {
    let query = supabase
      .from(this.ordersTable)
      .select('status, total')
      .is('deleted_at', null);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching order statistics: ${error.message}`);
    }

    const stats = {
      total_orders: data.length,
      total_revenue: data.reduce((sum, order) => sum + Number(order.total), 0),
      by_status: {
        pending: data.filter(o => o.status === 'pending').length,
        processing: data.filter(o => o.status === 'processing').length,
        shipped: data.filter(o => o.status === 'shipped').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
      },
    };

    return stats;
  }
}