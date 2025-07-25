import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { AgendamientoService } from '../../services/agendamiento.service';
import { requestRegistroCita } from '../../interfaces/shared.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hora-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatExpansionModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelect, MatOption  ],
  templateUrl: './hora-dialog.component.html',
  styleUrls: ['./hora-dialog.component.css'],
})
export class HoraDialogComponent {
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  seleccionHora: boolean = false;
  horaSeleccionada: string = '';
  duracion: string = '';
  duraciones: string[] = ['15 minutos', '30 minutos', '45 minutos', '1 hora', '1 hora 30 minutos', '2 horas'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<HoraDialogComponent>,
    private agendamientoService : AgendamientoService,
    private router: Router
  ) {
    this.horasAM = data.horas.filter((h: { hora: string }) => h.hora.includes('AM'));
    this.horasPM = data.horas.filter((h: { hora: string }) => h.hora.includes('PM'));
  }

  seleccionarHora(hora: string) {
    this.seleccionHora = true;
    this.horaSeleccionada = hora;
    // this.dialogRef.close(hora);
  }

  confirmar() {
    const request = this.createJson();
    this.agendamientoService.registrarCita(request)
    .subscribe({
      next: rest => {
        console.log();
        Swal.fire({
          icon: 'success',
          title: '¡Cira creada!',
          text: rest.mensaje || 'La cifa fue creado exitosamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.router.navigate(['/cliente/reservar']);
        });        
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: err.mensaje || 'Error de servidor',
        });
      }
    })
    // Aquí podrías cerrar el diálogo y pasar la info al componente padre si quieres
    // this.dialogRef.close({
    //   hora: this.horaSeleccionada,
    //   duracion: this.duracion
    // });
  }

  private createJson() {
    const json = {
        hora: this.horaSeleccionada,
      };
  
    return
  }




  cerrar(): void {
    this.dialogRef.close();
  }
}