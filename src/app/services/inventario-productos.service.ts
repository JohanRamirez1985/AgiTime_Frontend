import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class inventarioProductosService {
    private baseUrlPro = `${environment.apiBaseUrl}/Productos`;
    private baseUrlPar = `${environment.apiBaseUrl}/Parametros`;

    constructor(private http: HttpClient) {}

    consultarProductos(request: any) {
        const params = new HttpParams({ fromObject: request });
        return this.http.get<any>(`${this.baseUrlPro}/productos`, { params });
    }

    crearProducto(request: any) {
        return this.http.post<any>(`${this.baseUrlPro}/registrarProducto`, request)
    }

    agregarProducto(request: any) {
        return this.http.post<any>(`${this.baseUrlPro}/actualizarProducto`, request)
    }

    editarProducto(request: any) {
        return this.http.post<any>(`${this.baseUrlPro}/editarProducto`, request)
    }

    ventaProducto(request: any) {
        return this.http.post<any>(`${this.baseUrlPro}/ventaProducto`, request)
    }
}