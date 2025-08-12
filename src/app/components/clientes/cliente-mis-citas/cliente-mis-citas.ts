import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AgendamientoService } from '../../../services/agendamiento.service';

@Component({
  selector: 'app-cliente-mis-citas',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './cliente-mis-citas.html',
  styleUrl: './cliente-mis-citas.css'
})

export class ClienteMisCitas {
  idEmpresa: number = 0;
  empresa: any = '';
  loading: boolean = false;
  telefono: string = '';
  mostrarContenido: boolean = false;
  btnConsultar: boolean = false;

  citas: any[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private agendaService : AgendamientoService
  ) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idEmpresa = +params['emp']
    })
  }

  public consultar() {
    this.mostrarContenido = false;
    if (!this.telefono || this.telefono.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono requerido',
        text: 'Por favor, ingresa un número de celular válido',
      });
      return;
    }

    this.btnConsultar = true;

    const request = {
      empresa: this.idEmpresa,
      FechaIni: new Date().toISOString().split('T')[0] + 'T00:00:00',
      'clienteInfo.Telefono': this.telefono
    }

    this.agendaService.consultarCitasCliente(request)
    .subscribe({
      next: rest => {
        if(rest.exito) {
          this.citas = rest.datos.flatMap((item: any) =>
            item.servicios.map((servicio: any) => ({
              valor: servicio.valor,
              servicio: servicio.nombre || 'Servicio no especificado',
              recursoNombre: item.recursoNombre || 'No disponible',
              fecha: new Date(item.fechaInicio),
              hora: new Date(item.fechaInicio).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              sede: item.sede || 'Sede no disponible'
            }))
          );
          this.btnConsultar = false;
          this.telefono = '';
          this.mostrarContenido = true;             
        }else {
          Swal.fire({
            icon: 'info',
            title: 'Sin citas encontradas',
            text: `Con el teléfono ${this.telefono} no hay citas agendadas.`
          });
        }
          this.btnConsultar = false;
          this.telefono = '';
      },
      error: errr => {
        this.btnConsultar = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errr.mensaje,
        });
      }
    })

  }

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa }
    });
  }

  cancelarCita(cita: any) {
    console.log('Cancelar cita:', cita);
    // Aquí pondrías tu lógica para cancelar
  }

}
