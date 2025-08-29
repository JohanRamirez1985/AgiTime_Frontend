import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  UsuarioRegistro,
  UsuarioRegistroResponse,
} from '../interfaces/shared.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrlUsuario = `${environment.apiBaseUrl}/Usuarios`;

  constructor(private http: HttpClient) {}

  crearUsuario(request: UsuarioRegistro) {
    return this.http.post<UsuarioRegistroResponse>(
      `${this.baseUrlUsuario}/registrarUsuario`,
      request
    );
  }

  editarPorcentaje(request: any) {
    return this.http.post(`${this.baseUrlUsuario}/editarPorcentaje`, request);
  }

  obtenerServicios(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrlUsuario}/getServicios`, {
      params,
    });
  }

  editarServicios(request: any) {
    return this.http.post(`${this.baseUrlUsuario}/editarServicio`, request);
  }
}
