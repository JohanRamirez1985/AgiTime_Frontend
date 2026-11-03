import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ClienteRegistro,
  ClienteRegistroResponse,
} from '../interfaces/shared.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private baseUrlUsuario = `${environment.apiBaseUrl}/Clientes`;

  constructor(private http: HttpClient) {}

  crearCliente(request: ClienteRegistro) {
    return this.http.post<ClienteRegistroResponse>(
      `${this.baseUrlUsuario}/registrarCliente`,
      request
    );
  }

  obtenerInfoCliente(emp: string) {
    return this.http.get<any>(`${this.baseUrlUsuario}/clientes`, {
      params: { emp: emp.toString() },
    });
  }

  obtenerClienteRecordatorio(emp: string, dias: number, tipo: number) {
    return this.http.get<any>(`${this.baseUrlUsuario}/clientesRecordatorio`, {
      params: { emp: emp.toString(), dias: dias.toString(), tipo: tipo.toString() },
    });
  }

  obtenerClienteFidelidad(emp: string) {
    return this.http.get<any>(`${this.baseUrlUsuario}/clientesFidelidad`, {
      params: { emp: emp.toString() },
    });
  }

  editarFidelidad(request: ClienteRegistro) {
    return this.http.post<ClienteRegistroResponse>(
      `${this.baseUrlUsuario}/editarFidelidad`,
      request
    );
  }
}
