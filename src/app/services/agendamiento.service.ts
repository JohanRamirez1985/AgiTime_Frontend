import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { HttpParams } from '@angular/common/http';


@Injectable({ providedIn: 'root' })

export class AgendamientoService {
    
  private baseUrl = `${environment.apiBaseUrl}/Agendamiento`;
  
  constructor(private http: HttpClient) {}

    consultarAgendamientos(request: any) {
        const params = new HttpParams({ fromObject: request });
        return this.http.get<any>(`${this.baseUrl}/consultarAgendaRecurso`, { params });
    }

    registrarCita(request: any) {
        return this.http.post<any>(`${this.baseUrl}/registrarCita`, request)
    }

    consultarCitasRecurso(request: any) {
        const params = new HttpParams({ fromObject: request });
        return this.http.get<any>(`${this.baseUrl}/consultarCitasRecurso`, { params });
    }

    cancelarCita(request: any) {
        return this.http.post<any>(`${this.baseUrl}/cancelarCita`, request)
    }

    ConfirmarAsitenciaCita(request: any) {
        return this.http.post<any>(`${this.baseUrl}/asistioCita`, request)
    }

    registrarBloqueoDias(request: any) {
        return this.http.post<any>(`${this.baseUrl}/registrarBloqueo`, request) 
    }

}