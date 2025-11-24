import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { Observable } from 'rxjs';
import {
  Customer,
  CustomerResponse,
  CustomerListQuery,
  CustomerCreateDTO,
  CustomerUpdateDTO,
} from '../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private API_URL: string = appsettings.apiUrl + 'customers';

  constructor() {}

  list(query?: CustomerListQuery): Observable<CustomerResponse> {
    let params = new HttpParams();

    if (query?.page) params = params.set('page', query.page.toString());
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.search) params = params.set('search', query.search);

    return this.http.get<CustomerResponse>(this.API_URL, { params });
  }

  getById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.API_URL}/${id}`);
  }

  create(customer: CustomerCreateDTO): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.API_URL, customer);
  }

  update(
    id: number,
    customer: CustomerUpdateDTO
  ): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.API_URL}/${id}`, customer);
  }

  delete(id: number): Observable<CustomerResponse> {
    return this.http.delete<CustomerResponse>(`${this.API_URL}/${id}`);
  }
}