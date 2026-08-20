import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneroResponse } from '../interfaces/shared.interface';

@Injectable({ providedIn: 'root' })
export class PeriodoPruebaService {

    private baseUrlPp = `${environment.apiBaseUrl}/Informes`;


    constructor(private http: HttpClient) { }


    obtenerTodasSedes(emp: string) {
        return this.http.get<GeneroResponse>(`${this.baseUrlPp}/ingresoMesPrueba`, {
            params: { emp: emp.toString() },
        });
    }


}