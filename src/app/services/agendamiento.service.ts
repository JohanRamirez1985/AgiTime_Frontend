import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AgendamientoService {
  private baseUrl = `${environment.apiBaseUrl}/Agendamiento`;

  constructor(private http: HttpClient) { }

  consultarAgendamientos(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarAgendaRecurso`, {
      params,
    });
  }

  consultarAgendamientosEmpleado(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarMiAgenda`, {
      params,
    });
  }

  registrarCita(request: any) {
    return this.http.post<any>(`${this.baseUrl}/registrarCita`, request);
  }

  modificarCita(request: any) {
    return this.http.put<any>(`${this.baseUrl}/editarCita`, request);
  }

  guardarCita(request: any) {
    return this.http.post<any>(`${this.baseUrl}/guardarCita`, request);
  }

  consultarCitasRecurso(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarCitasRecurso`, {
      params,
    });
  }

  cancelarCita(request: any) {
    return this.http.post<any>(`${this.baseUrl}/cancelarCita`, request);
  }

  ConfirmarAsitenciaCita(request: any) {
    return this.http.post<any>(`${this.baseUrl}/asistioCita`, request);
  }

  registrarBloqueoDias(request: any) {
    return this.http.post<any>(`${this.baseUrl}/registrarBloqueo`, request);
  }

  consultarBloqueos(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarBloqueos`, { params });
  }

  inactivarBloqueo(request: any) {
    return this.http.post<any>(`${this.baseUrl}/cambiarEstadoBloqueo`, request);
  }

  consultarCitasCliente(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarCitasCliente`, {
      params,
    });
  }

  consultarEstadoUsuario(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarEstadoActivarme`, {
      params,
    });
  }

  activarUsuarioBtn(request: any) {
    return this.http.post<any>(
      `${this.baseUrl}/cambiarEstadoActivarme`,
      request
    );
  }

  consultarAgendaDiaria(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarAgendaDiaria`, {
      params,
    });
  }

  consultarAgendaCitas(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/consultarAgendaCitas`, {
      params,
    });
  }
}
