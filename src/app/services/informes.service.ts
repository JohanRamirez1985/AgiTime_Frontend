import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InformesService {
  private baseUrl = `${environment.apiBaseUrl}/Informes`;

  constructor(private http: HttpClient) { }

  infoDashboard(request: any) {
    const params = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${this.baseUrl}/informacionDashboard`, {
      params,
    });
  }

  generarInforme(request: any, diario: boolean) {
    const params = new HttpParams({ fromObject: request });

    if (diario) {
      return this.http.get(`${this.baseUrl}/informacionDiaria`, {
        params,
        responseType: 'blob', // 👈 recibir archivo binario
      });
    } else {
      return this.http.get(`${this.baseUrl}/informacionSemanal`, {
        params,
        responseType: 'blob',
      });
    }
  }

  liquidacionSemanal(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/liquidacionSemanal`,
      payload
    );
  }
}
