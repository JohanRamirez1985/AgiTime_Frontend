import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/autenticacion`;
  
  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(user: { name: string; email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  ping() {
    return this.http.get(`${this.baseUrl}/ping`);
  }
}