import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../interfaces/register.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrlUsuario = `${environment.apiBaseUrl}/Usuarios`;
  private baseUrlCliente = `${environment.apiBaseUrl}/Cliente`;
  
  constructor(private http: HttpClient) {}

  login(credentials: { Login: string; Password: string ; empresa: string}, Cliente: boolean) {
    if(Cliente)
      return this.http.post<LoginResponse>(`${this.baseUrlCliente}/Login`, credentials);
    else
      return this.http.post<LoginResponse>(`${this.baseUrlUsuario}/Login`, credentials);
  }

  register(user: { name: string; email: string; password: string }) {
    return this.http.post(`${this.baseUrlCliente}/register`, user);
  }

  // ping() {
  //   return this.http.get(`${this.baseUrl}/ping`);
  // }
}