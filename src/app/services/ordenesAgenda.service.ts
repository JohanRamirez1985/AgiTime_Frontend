import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })

export class OrdenAgendamientoService {
  private baseUrl = `${environment.apiBaseUrl}/Parametros`;
  private baseUrlAge = `${environment.apiBaseUrl}/Agendamiento`;

  constructor(private http: HttpClient) { }

  consultarClientes(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/Clientes`, {
      params,
    });
  }

  consultarDetalleAgenda(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrlAge}/consultarOrdenes`, {
      params,
    });
  }
}
