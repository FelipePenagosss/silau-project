import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';

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

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'products';

  constructor() { }

  list(query?: ProductListQuery): Observable<ProductResponse> {
    let params = new HttpParams();

    if (query?.page) params = params.set('page', query.page.toString());
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.search) params = params.set('search', query.search);
    if (query?.minPrice !== undefined) params = params.set('minPrice', query.minPrice.toString());
    if (query?.maxPrice !== undefined) params = params.set('maxPrice', query.maxPrice.toString());
    if (query?.inStock !== undefined) params = params.set('inStock', query.inStock.toString());

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  create(product: Partial<Product>): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<ProductResponse> {
    return this.http.delete<ProductResponse>(`${this.apiUrl}/${id}`);
  }
  updateStock(id: number, quantityChange: number): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.apiUrl}/${id}/stock`, { 
      quantityChange 
    });
  }

}