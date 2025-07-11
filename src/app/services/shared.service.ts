import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";
import { EmpresasResponse, GeneroResponse, TipoDocumentoResponse, UserResponse } from "../interfaces/shared.interface";


@Injectable({ providedIn: 'root' })

export class SharedService {
    private baseUrlUsuario = `${environment.apiBaseUrl}/Parametros`;

    constructor(private http: HttpClient) {}

    obtenerTiposDocumentos(emp: number) {
        return this.http.get<TipoDocumentoResponse>(`${this.baseUrlUsuario}/tipodocumento`, {
        params: { emp: emp.toString() }
        });
    }

    obtenerGenerosUsuarios(emp: number) {
        return this.http.get<GeneroResponse>(`${this.baseUrlUsuario}/genero`, {
        params: { emp: emp.toString() }
        });
    }

    obtenerEmpresasApp() {
        return this.http.get<EmpresasResponse>(`${this.baseUrlUsuario}/empresas`)
    }

    obtenerUsuarios(emp: number) {
        return this.http.get<UserResponse>(`${this.baseUrlUsuario}/usuarios`, {
        params: { emp: emp.toString() }
        });  
    }

}