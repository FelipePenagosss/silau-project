import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';
import {
  Order,
  OrderResponse,
  OrderListQuery,
  CreateOrderDTO,
  UpdateOrderDTO
} from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'orders';

  constructor() { }

  list(query?: OrderListQuery): Observable<OrderResponse> {
    let params = new HttpParams();

    if (query?.page) params = params.set('page', query.page.toString());
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.search) params = params.set('search', query.search);
    if (query?.status) params = params.set('status', query.status);
    if (query?.customer_id) params = params.set('customer_id', query.customer_id.toString());
    if (query?.date_from) params = params.set('date_from', query.date_from);
    if (query?.date_to) params = params.set('date_to', query.date_to);

    return this.http.get<OrderResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  create(order: CreateOrderDTO): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, order);
  }

  update(id: number, order: UpdateOrderDTO): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}`, order);
  }

  updateStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<OrderResponse> {
    return this.http.delete<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  getStats(customer_id?: number): Observable<OrderResponse> {
    let params = new HttpParams();
    if (customer_id) params = params.set('customer_id', customer_id.toString());
    return this.http.get<OrderResponse>(`${this.apiUrl}/stats`, { params });
  }
}