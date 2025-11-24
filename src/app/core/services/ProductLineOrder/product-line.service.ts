import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductLineService {
  private http = inject(HttpClient);
  private PRODUCT_URL: string = appsettings.apiUrl+'product-line/';

  constructor() { }

  list(): Observable<any>{
    return this.http.get<any>(this.PRODUCT_URL);
  }
}
