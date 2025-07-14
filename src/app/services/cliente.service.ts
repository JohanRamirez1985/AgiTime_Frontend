import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ClienteRegistro, ClienteRegistroResponse } from "../interfaces/shared.interface";
import { environment } from "../../environments/environment";



@Injectable({ providedIn: 'root' })

export class ClienteService {

    private baseUrlUsuario = `${environment.apiBaseUrl}/Usuarios`;

    constructor(private http: HttpClient) {}

    crearCliente(request: ClienteRegistro) {
        return this.http.post<ClienteRegistroResponse>(`${this.baseUrlUsuario}/registrarUsuario`, request);
    }
}