import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {
  EmpresasResponse,
  GeneroResponse,
  TipoDocumentoResponse,
  UserResponse,
} from '../interfaces/shared.interface';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private baseUrlUsuario = `${environment.apiBaseUrl}/Parametros`;

  constructor(private http: HttpClient) {}

  obtenerTiposDocumentos(emp: string) {
    return this.http.get<TipoDocumentoResponse>(
      `${this.baseUrlUsuario}/tipodocumento`,
      {
        params: { emp: emp.toString() },
      }
    );
  }

  obtenerGenerosUsuarios(emp: string) {
    return this.http.get<GeneroResponse>(`${this.baseUrlUsuario}/genero`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerEmpresasApp() {
    return this.http.get<EmpresasResponse>(`${this.baseUrlUsuario}/empresas`);
  }

  obtenerUsuarios(emp: number) {
    return this.http.get<UserResponse>(`${this.baseUrlUsuario}/usuarios`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerRolesUsuarios(emp: string) {
    return this.http.get<GeneroResponse>(`${this.baseUrlUsuario}/rol`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerSedesUsuarios(emp: string) {
    return this.http.get<GeneroResponse>(`${this.baseUrlUsuario}/sede`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerRecursosAgenda(emp: number) {
    return this.http.get<any>(`${this.baseUrlUsuario}/recursosAgenda`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerServicios(emp: number) {
    return this.http.get<any>(`${this.baseUrlUsuario}/servicios`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerAgenda(emp: number) {
    return this.http.get<any>(`${this.baseUrlUsuario}/agenda`, {
      params: { emp: emp.toString() },
    });
  }

  parametros(emp: string) {
    return this.http.get<any>(`${this.baseUrlUsuario}/parametros`, {
      params: { emp: emp.toString() },
    });
  }

  parametrosGenerales() {
    return this.http.get<EmpresasResponse>(`${this.baseUrlUsuario}/parametrosGenerales`);
  }
}
