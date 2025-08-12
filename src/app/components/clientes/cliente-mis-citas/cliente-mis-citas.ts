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

  citas = [
    {
      servicio: 'Corte de Cabello',
      profesional: 'Juan Pérez',
      fecha: new Date(2025, 7, 15), // agosto es mes 7 porque enero = 0
      hora: '10:30 AM',
      sede: 'Sede Central'
    },
    {
      servicio: 'Afeitado',
      profesional: 'Carlos López',
      fecha: new Date(2025, 7, 18),
      hora: '4:00 PM',
      sede: 'Sucursal Norte'
    }
  ];


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
          console.log();
          
        }else {
          Swal.fire({
            icon: 'info',
            title: 'Sin citas encontradas',
            text: `Con el teléfono ${this.telefono} no hay citas agendadas.`
          });
          this.telefono = '';
        }
        this.btnConsultar = false;
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
