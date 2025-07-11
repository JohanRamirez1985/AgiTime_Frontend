import { GeneroResponse, TipoDocumento, TipoDocumentoResponse } from "../../interfaces/shared.interface";
import { SharedService } from "../../services/shared.service";

export function obtenerTiposDocumentos(
  sharedService: SharedService,
  idEmpresa: string,
  callback: (datos: TipoDocumento[]) => void
) {
  sharedService.obtenerTiposDocumentos(idEmpresa).subscribe({
    next: (res: TipoDocumentoResponse) => callback(res.datos)
  });
}

export function obtenerGeneros(
  sharedService: SharedService,
  idEmpresa: string,
  callback: (datos: TipoDocumento[]) => void
) {
  sharedService.obtenerGenerosUsuarios(idEmpresa).subscribe({
    next: (res: GeneroResponse) => callback(res.datos)
  });
}

export function obtenerRoles(
  sharedService: SharedService,
  idEmpresa: string,
  callback: (datos: TipoDocumento[]) => void
) {
  sharedService.obtenerRolesUsuarios(idEmpresa).subscribe({
    next: (res: GeneroResponse) => callback(res.datos)
  });
}

export function obtenerSedes(
  sharedService: SharedService,
  idEmpresa: string,
  callback: (datos: TipoDocumento[]) => void
) {
  sharedService.obtenerSedesUsuarios(idEmpresa).subscribe({
    next: (res: GeneroResponse) => callback(res.datos)
  });
}