import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ClienteAgendar } from '../../clientes/cliente-agendar/cliente-agendar';
import { SharedService } from '../../../services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule,
    // ClienteAgendar
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  citasHoy: any[] = [];

  constructor(private router: Router,
    private shared : SharedService
  ) {

    this.citasHoy = [
      {
        servicio: 'Corte de cabello',
        hora: '10:00 AM',
        usuario: 'alejandro rodriguez',
        id: 1,
        valor: 50000
      },
      {
        servicio: 'Masaje relajante',
        hora: '2:00 PM',
        usuario: 'Monica vera',
        id: 2,
        valor: 40000
      }
    ];
  }

  ngOnInit() {

  }

  abrirAgendar() {
    this.router.navigate(['/cliente/agendar']);
  }

  cancelarCita(cita: any) {
    console.log('Cancelar cita con ID:', cita.id);
    Swal.fire({
      title: '¿Cancelar cita?',
      html: `<p>¿Estás seguro de cancelar la cita programada para las <strong> 10 am </strong> del <strong> hoy </strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      customClass: {
        popup: 'swal-reserva-responsive'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(result);
        
      }
    })
  }
}