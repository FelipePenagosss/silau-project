import { supabase } from '../../config/supabase';
import {
  Product,
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductListQuery,
} from './product.model';

export class ProductService {
  private tableName = 'Product';

  async listProducts(query: ProductListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const search = query.search || '';

    let supabaseQuery = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    // Búsqueda por nombre
    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
    }

    // Filtro por rango de precio
    if (query.minPrice !== undefined) {
      supabaseQuery = supabaseQuery.gte('price', query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      supabaseQuery = supabaseQuery.lte('price', query.maxPrice);
    }

    // Filtro por stock disponible
    if (query.inStock !== undefined && query.inStock) {
      supabaseQuery = supabaseQuery.gt('stock', 0);
    }

    const { data, error, count } = await supabaseQuery
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return {
      data: data as Product[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching product: ${error.message}`);
    }

    return data as Product;
  }

  async createProduct(productData: ProductCreateDTO): Promise<Product> {
    // Validar que el precio sea positivo
    if (productData.price < 0) {
      throw new Error('Price must be a positive number');
    }

    // Validar que el stock sea positivo
    if (productData.stock < 0) {
      throw new Error('Stock must be a positive number');
    }

    // Validar nombre único
    const { data: existingProduct } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('name', productData.name)
      .single();

    if (existingProduct) {
      throw new Error('Product name already exists');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }

    return data as Product;
  }

  async updateProduct(
    id: number,
    productData: ProductUpdateDTO
  ): Promise<Product> {
    // Verificar que el producto existe
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validar precio si se proporciona
    if (productData.price !== undefined && productData.price < 0) {
      throw new Error('Price must be a positive number');
    }

    // Validar stock si se proporciona
    if (productData.stock !== undefined && productData.stock < 0) {
      throw new Error('Stock must be a positive number');
    }

    // Validar nombre único si se proporciona y es diferente
    if (productData.name && productData.name !== existingProduct.name) {
      const { data: nameExists } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('name', productData.name)
        .neq('id', id)
        .single();

      if (nameExists) {
        throw new Error('Product name already exists');
      }
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }

    return data as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return await this.updateProduct(id, { stock: newStock });
  }
}
