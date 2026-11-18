import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Modal } from '../../shared/services/modal';
import Swal from 'sweetalert2';
import { AgendamientoService } from '../../services/agendamiento.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { EdicionCitas } from '../recursos/edicion-citas/edicion-citas';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})

export class Citas {
  loading: boolean = true;
  day: Date = new Date();
  citasHoy: any[] = [];
  esMobile = window.innerWidth < 768;
  empresaServicio: boolean = false;
  WhatsappRecordatorio: boolean = false;
  mensajeRecordatorioWssp: string = '';
  empresa: any = '';
  mostrarMetodoPago: boolean = false;
  user: any = '';
  metodosPago: string[] = [];
  usoBono: boolean = false;
  empresaOrden: boolean = false;
  idEmpresa: number = 0;
  empresaRecursoMultiple: boolean = false;


  constructor(
    private modalService: Modal,
    private cdr: ChangeDetectorRef,
    private agendamientoServices: AgendamientoService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = this.empresa.id
    this.consultarCitas(this.idEmpresa, this.day)
  }

  getEstadoClase(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'estado-pendiente';
      case 'asistio':
        return 'estado-confirmada';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  public editarCita(cita: any) {

    const dialogRef = this.dialog.open(EdicionCitas, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      data: cita
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp?.actualizado) {
        this.loading = true;
        this.consultarCitas(this.empresa, this.day);
      }
    });
  }

  cancelarCita(cita: any) {
    const horaCita = new Date(cita.fechaInicio).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    Swal.fire({
      title: '¿Cancelar cita?',
      html: `<p>¿Estás seguro de cancelar la cita programada para las <strong> ${horaCita} </strong> de <strong> hoy </strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const now = new Date(this.day);
        const fechaLocal = this.formatearFechaManual(now);

        const request = {
          empresa: JSON.parse(localStorage.getItem('empresa') || '{}').id,
          Id: cita.id,
          fechaCancelacion: fechaLocal,
          usuarioCancelacion: 'Usuario',
        };
        this.agendamientoServices.cancelarCita(request).subscribe({
          next: (rest) => {
            if (rest.exito) {
              this.consultarCitas(
                this.idEmpresa,
                new Date(fechaLocal),
              );
            }
          },
        });
      }
    });
  }

  private consultarCitas(empresa: any, fecha: Date): void {
    this.loading = true;

    const request: any = {
      empresa: empresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      FechaFin: this.formatearFechaLocal(fecha, '23:59:00'),
    };

    this.agendamientoServices.consultarCitasRecurso(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.citasHoy = rest.datos;
          const citasConTotales = this.citasHoy.map((cita) => {
            let totalServicios
            if (this.empresaServicio) {
              totalServicios = cita.total;
            } else {
              totalServicios = cita.servicios.reduce(
                (acum: any, servicio: any) => acum + servicio.valor,
                0,
              );
            }

            return {
              ...cita,
              totalServicios,
            };
          });
          this.citasHoy = citasConTotales;
        } else {
          this.citasHoy = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // private pad(n: number): string {
  //   return n < 10 ? '0' + n : '' + n;
  // }

  // formatearFechaActual(): string {
  //   const now = new Date();

  //   return `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())}` +
  //     `T${this.pad(now.getHours())}:${this.pad(now.getMinutes())}:${this.pad(now.getSeconds())}`;
  // }

  private formatearFechaManual(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  public recordatorioWssp(cliente: any): void {
    const fecha = this.empresaServicio
      ? new Date(cliente.fechaOrden)
      : new Date(cliente.fechaInicio);

    const fechaFormateada = fecha.toLocaleDateString('es-CO');

    const horaFormateada = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let numero = '';
    let nombreCliente = '';
    let servicios = '';
    let abono = 0;
    let telefonoBreB = '';

    if (this.empresaServicio) {
      nombreCliente = cliente.cliente;
      numero = '57' + cliente.telefono;
      servicios = cliente.nombre;

      abono = Number(cliente.total || 0) / 2;
      telefonoBreB = '3137938061';
    } else {
      nombreCliente = cliente.nombreCliente;
      numero = '57' + cliente.telefonoCliente;

      servicios = cliente.servicios
        ?.map((s: any) => s.nombre)
        .join(', ') || '';

      abono = 30000;
      telefonoBreB = '3022566598';
    }

    let mensaje = this.mensajeRecordatorioWssp || '';

    mensaje = mensaje
      .replace(/\$\{nombreCliente\}/g, nombreCliente || '')
      .replace(/\$\{empresaNombre\}/g, this.empresa?.nombre || '')
      .replace(/\$\{fechaFormateada\}/g, fechaFormateada)
      .replace(/\$\{horaFormateada\}/g, horaFormateada)
      .replace(/\$\{servicios\}/g, servicios)
      .replace(
        /\$\{abono\.toLocaleString\(["']es-CO["']\)\}/g,
        abono.toLocaleString('es-CO')
      )
      .replace(/\$\{telefonoBreB\}/g, telefonoBreB);

    // Normalizar los saltos de línea recibidos del backend
    mensaje = mensaje
      .replace(/\\r\\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log(mensaje);


    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const url = esMovil
      ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
      : `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;

    if (esMovil) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }

  public onDateChange(event: any) {
    const fecha = event.value;

    if (!fecha) return;

    this.day = fecha;
    this.consultarCitas(this.idEmpresa, fecha);
  }

  public previus(): void {
    const nuevaFecha = new Date(this.day);
    this.day = nuevaFecha;
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    this.consultarCitas(this.idEmpresa, nuevaFecha);
  }

  public nextPeriod(): void {
    const nuevaFecha = new Date(this.day);
    this.day = nuevaFecha;
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    this.consultarCitas(this.idEmpresa, nuevaFecha);
  }

}