import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { appsettings } from '../../settings/appsettings';
import { Observable } from 'rxjs';
import { ResponseLogin } from '../../models/responseLogin.model';
import { User } from '../../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private LOGIN_URL: string = appsettings.apiUrl + 'users/login';

  constructor() {}

  login(user: User): Observable<ResponseLogin> {
    return this.http.post<ResponseLogin>(this.LOGIN_URL, user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
