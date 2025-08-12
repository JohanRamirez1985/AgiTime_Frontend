import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
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

  citas: any[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private agendaService : AgendamientoService,
    private cdr: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idEmpresa = +params['emp']
    })
  }

  public consultar() {
    this.mostrarContenido = false;
    this.loading = true;
    if (!this.telefono || this.telefono.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono requerido',
        text: 'Por favor, ingresa un número de celular válido',
      });
      return;
    }

    const request = {
      empresa: this.idEmpresa,
      FechaIni: new Date().toISOString().split('T')[0] + 'T00:00:00',
      'clienteInfo.Telefono': this.telefono
    }

    this.agendaService.consultarCitasCliente(request)
    .subscribe({
      next: rest => {
        if(rest.exito) {
          this.citas = rest.datos.map((item: any) => {
            const serviciosNombres = item.servicios
              .map((s: any) => s.nombre)
              .join(', ');

            const totalValor = item.servicios
              .reduce((total: number, s: any) => total + (s.valor || 0), 0);

            return {
              valor: totalValor,
              servicio: serviciosNombres || 'Servicio no especificado',
              recursoNombre: item.recursoNombre || 'No disponible',
              fecha: new Date(item.fechaInicio),
              hora: new Date(item.fechaInicio).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              sede: item.sede || 'Sede no disponible',
              id: item.id
            };
          });

          this.loading = false;
          this.mostrarContenido = true;   
          this.cdr.detectChanges();          
        }else {
          this.loading = false;
          Swal.fire({
            icon: 'info',
            title: 'Sin citas encontradas',
            text: `Con el teléfono ${this.telefono} no hay citas agendadas.`
          });
          this.cdr.detectChanges();
        }
      },
      error: errr => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errr.mensaje,
        });
        this.cdr.detectChanges();
      }
    })

  }

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa }
    });
  }

  cancelarCita(cita: any) {   
    Swal.fire({
      title: '¿Cancelar cita?',
      html: `<p>¿Estás seguro de cancelar la cita programada para las <strong> ${cita.hora} </strong> de <strong> hoy </strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarContenido = false;
        const now = new Date();
        const fechaLocal = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + 'T' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

        const request = {
          empresa: this.idEmpresa,
          Id: cita.id,
          fechaCancelacion: fechaLocal,
          usuarioCancelacion: 'Cliente'
        }
        this.agendaService.cancelarCita(request)
        .subscribe({
          next : rest => {
            if(rest.exito) {
              this.consultar();
            }            
          }
        })
        
      }else {
        this.loading = false;
      }
    })
  }

}
