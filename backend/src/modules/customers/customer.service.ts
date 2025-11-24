import { supabase } from '../../config/supabase';
import { Customer, CustomerCreateDTO, CustomerUpdateDTO, CustomerListQuery } from './customer.model';

export class CustomerService {
  private tableName = 'customers';

  async listCustomers(query: CustomerListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const search = query.search || '';

    let supabaseQuery = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,document_number.ilike.%${search}%`
      );
    }

    const { data, error, count } = await supabaseQuery
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }

    return {
      data: data as Customer[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching customer: ${error.message}`);
    }

    return data as Customer;
  }

  async createCustomer(customerData: CustomerCreateDTO): Promise<Customer> {
    // Validar email único (si se proporciona)
    if (customerData.email) {
      const { data: existingEmail } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('email', customerData.email)
        .is('deleted_at', null)
        .single();

      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Validar documento único (si se proporciona)
    if (customerData.document_number) {
      const { data: existingDoc } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('document_number', customerData.document_number)
        .is('deleted_at', null)
        .single();

      if (existingDoc) {
        throw new Error('Document number already exists');
      }
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([customerData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }

    return data as Customer;
  }

  async updateCustomer(id: number, customerData: CustomerUpdateDTO): Promise<Customer> {
    // Verificar que el cliente existe
    const existingCustomer = await this.getCustomerById(id);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Validar email único (si se proporciona y es diferente)
    if (customerData.email && customerData.email !== existingCustomer.email) {
      const { data: existingEmail } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('email', customerData.email)
        .is('deleted_at', null)
        .neq('id', id)
        .single();

      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Validar documento único (si se proporciona y es diferente)
    if (customerData.document_number && customerData.document_number !== existingCustomer.document_number) {
      const { data: existingDoc } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('document_number', customerData.document_number)
        .is('deleted_at', null)
        .neq('id', id)
        .single();

      if (existingDoc) {
        throw new Error('Document number already exists');
      }
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...customerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }

    return data as Customer;
  }

  async softDeleteCustomer(id: number): Promise<void> {
    const existingCustomer = await this.getCustomerById(id);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    const { error } = await supabase
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error soft deleting customer: ${error.message}`);
    }
  }

  async hardDeleteCustomer(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error hard deleting customer: ${error.message}`);
    }
  }
}
