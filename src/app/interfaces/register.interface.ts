export interface TipoDocumento {
  id: number;
  nombre: string;
  usuarios: any[];
}

export interface TipoDocumentoResponse {
  exito: boolean;
  datos: TipoDocumento[];
}

export interface GeneroResponse {
  exito: boolean;
  datos: TipoDocumento[];
}

export interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  logo: string;
  conexionBD: string;
  estado: string
}

export interface EmpresasResponse {
  exito: boolean;
  datos: Empresa[]
}

export interface LoginResponse {
  exito: boolean;
  mensaje: string | null;
  token: string;
  datos: {
    usuario: any;
    empresa: any;
    funcionalidad: string;
  };
}
