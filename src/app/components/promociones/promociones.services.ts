import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })

export class PromocionesService {
    private baseUrlUsuario = `${environment.apiBaseUrl}/Parametros`;

    constructor(private http: HttpClient) { }


    gestionarPromociones(emp: number) {
        return this.http.get<any>(
            `${this.baseUrlUsuario}/promoCombos`,
            {
                params: { emp: emp.toString() },
            }
        );
    }

    guardarPromocion(request: any) {
        return this.http.post<any>(`${this.baseUrlUsuario}/registrarPromoCombo`, request);
    }

    modificarCita(request: any) {
        return this.http.put<any>(`${this.baseUrlUsuario}/editarPromoCombo`, request);
    }

}