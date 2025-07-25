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
  duracion: any = '';
  duraciones: { label: string, value: string}[] =  [
    { label: '1 hora', value: '1' },
    { label: '2 horas', value: '2' },
    { label: '3 horas', value: '3' },
    { label: '4 horas', value: '4' },
    { label: '5 horas', value: '5' },
    { label: '6 horas', value: '6' }
  ];
  recurso: string = '';
  servicio: any = '';
  cliente: number | null = 0;
  fecha : Date;
  idEmpresa: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<HoraDialogComponent>,
    private agendamientoService : AgendamientoService,
  ) {
    this.horasAM = data.horas.filter((h: { hora: string }) => h.hora.includes('AM'));
    this.horasPM = data.horas.filter((h: { hora: string }) => h.hora.includes('PM'));
    const usuario = localStorage.getItem('usuario');
    const infoempresa = localStorage.getItem('empresa');
    if (infoempresa) {
      const empresa = JSON.parse(infoempresa);
      this.idEmpresa = empresa.id;
    }    
    this.cliente = usuario ? JSON.parse(usuario).id : null;
    this.fecha = data.fecha;
    this.servicio = data.servicio;
    this.recurso = data.recurso;
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
          title: '¡Cita creada!',
          text: rest.mensaje || 'La cita fue creado exitosamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.dialogRef.close();
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
  }

  private createJson() {
    const fecha = new Date(this.fecha);
    const fechaBase = fecha.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Extraer la hora y el periodo (AM o PM)
    const match = this.horaSeleccionada.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let horas = parseInt(match[1], 10);
      const minutos = match[2];
      const periodo = match[3].toUpperCase();

      // Convertir a formato 24 horas
      if (periodo === 'PM' && horas < 12) {
        horas += 12;
      } else if (periodo === 'AM' && horas === 12) {
        horas = 0;
      }

      // Asegurar formato 2 dígitos
      const horasStr = horas.toString().padStart(2, '0');
      const fechaFinal = `${fechaBase}T${horasStr}:${minutos}:00`;

      const json = {
          Hora: this.duracion.value,
          FechaIni: fechaFinal,
          recurso: this.recurso,
          Cliente: this.cliente,
          Servicio: this.servicio.id,
          UsuarioCreacion: 'Cliente',
          empresa: this.idEmpresa
        };
    
      return json
      } 
      else {
        return
      }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}