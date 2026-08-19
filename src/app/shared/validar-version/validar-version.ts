import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ModalActualizando } from '../modal-actualizando/modal-actualizando';

@Component({
  selector: 'app-validar-version',
  standalone: true,
  imports: [],
  templateUrl: './validar-version.html',
  styleUrl: './validar-version.css'
})
export class ValidarVersion implements OnInit {

  // Versión que tiene el frontend actualmente
  version = environment.version;

  constructor(
    private sharedServices: SharedService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.validarVersionApp();
  }

  public validarVersionApp(): void {

    this.sharedServices.parametrosGenerales().subscribe({

      next: (rest) => {

        if (!rest.exito) {
          console.error('No fue posible consultar los parámetros generales');
          return;
        }

        const parametroVersion: any = rest.datos.find(
          (v: any) => v.tipo === 'version'
        );

        const versionBd = parametroVersion?.valor || '';

        console.log('--------------------------------');
        console.log('Validación de versión');
        console.log('Versión frontend:', this.version);
        console.log('Versión BD:', versionBd);
        console.log('--------------------------------');

        // La versión es correcta
        if (versionBd === this.version) {
          console.log('✅ La aplicación está actualizada');
          return;
        }

        // Hay una versión nueva
        console.log('⚠️ Hay una nueva versión disponible');

        this.modalActualizacion(versionBd);
      },

      error: (error) => {
        console.error(
          'Error validando versión de la aplicación:',
          error
        );
      }

    });

  }

  private modalActualizacion(versionBd: string): void {

    console.log('Abriendo modal de actualización');
    console.log('Versión actual:', this.version);
    console.log('Nueva versión:', versionBd);

    this.dialog.open(ModalActualizando, {
      disableClose: true,
      panelClass: 'update-dialog',
      backdropClass: 'update-backdrop'
    });

  }

}