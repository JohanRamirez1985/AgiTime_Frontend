import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class Modal {

   constructor() {}
  
      mostrarModal(
      tipo: SweetAlertIcon,
      titulo: string,
      mensaje: string,
      callback?: () => void
    ) {
      Swal.fire({
        icon: tipo,
        title: titulo,
        html: mensaje,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok',
      }).then((result) => {
        if (result.isConfirmed && callback) {
          callback();
        }
      });
    }
  
    success(mensaje: string, callback?: () => void) {
      this.mostrarModal('success', '¡Éxito!', mensaje, callback);
    }
  
    error(mensaje: string) {
      this.mostrarModal('error', 'Error', mensaje);
    }  
}
