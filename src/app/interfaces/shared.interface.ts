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

export interface UserResponse {
  exito: boolean;
  datos: Usuario[];
}


export interface Usuario {
  id: number;
  nombre: string;
  tipoDocumento: number;
  documento: string;
  correo: string;
  login: string;
  password: string;
  telefono: string;
  genero: number;
  fechaNacimiento: string;
  estado: string;
  fechaCreacion: string;
  sede: number;
  rol: string;
  // agrega más campos si los necesitas
}

export interface UsuarioRegistro {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  fechaNacimiento: string; // ISO string, e.g. "1998-07-11T14:56:23.637Z"
  genero: number;
  tipoDocumento: number;
  sede: number;
  documento: string;
  empresa: number;
  rol: number;
  recurso: boolean
}


export interface UsuarioRegistroResponse {
  mensaje: string,
  exito: boolean,
  clienteId: number
}

export interface ClienteRegistro {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  fechaNacimiento: string; // ISO string, e.g. "1998-07-11T14:56:23.637Z"
  genero: number;
  tipoDocumento: number;
  documento: string;
  empresa: number;
}


export interface ClienteRegistroResponse {
  mensaje: string,
  exito: boolean,
  clienteId: number
}

