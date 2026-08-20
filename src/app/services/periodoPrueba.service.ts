import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneroResponse } from '../interfaces/shared.interface';

@Injectable({ providedIn: 'root' })
export class PeriodoPruebaService {

    private baseUrlPp = `${environment.apiBaseUrl}/Informes`;
    private baseUrlParametros = `${environment.apiBaseUrl}/Parametros`;

    constructor(private http: HttpClient) { }


    obtenerTodasSedes(emp: string) {
        return this.http.get<GeneroResponse>(`${this.baseUrlParametros}/allSedes`, {
            params: { emp: emp.toString() },
        });
    }

    guardarPeriodoPrueba(request: any) {
        return this.http.post(
            `${this.baseUrlPp}/ingresoMesPrueba`,
            request
        );
    }
}