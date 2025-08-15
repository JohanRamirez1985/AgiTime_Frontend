import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { HttpParams } from '@angular/common/http';

export class inventarioProductosService {
    private baseUrlPro = `${environment.apiBaseUrl}/Productos`;
    private baseUrlPar = `${environment.apiBaseUrl}/Parametros`;

    constructor(private http: HttpClient) {}

    consultarProductos(request: any) {
        const params = new HttpParams({ fromObject: request });
        return this.http.get<any>(`${this.baseUrlPar}/productos`, { params });
    }
}