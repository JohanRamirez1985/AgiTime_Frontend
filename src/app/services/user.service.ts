import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UsuarioRegistro, UsuarioRegistroResponse } from "../interfaces/shared.interface";



@Injectable({ providedIn: 'root' })

export class UserService {
    private baseUrlUsuario = `${environment.apiBaseUrl}/Usuarios`;

    constructor(private http: HttpClient) {}

    crearUsuario(request: UsuarioRegistro) {
        return this.http.post<UsuarioRegistroResponse>(`${this.baseUrlUsuario}/registrarUsuario`, request);
    }


}