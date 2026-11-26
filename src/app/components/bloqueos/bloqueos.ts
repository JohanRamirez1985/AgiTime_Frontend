
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedService } from '../../services/shared.service';
import { AgendamientoService } from '../../services/agendamiento.service';
import { Modal } from '../../shared/services/modal';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';



@Component({
  selector: 'app-bloqueos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatNativeDateModule
  ],
  templateUrl: './bloqueos.html',
  styleUrl: './bloqueos.css'
})
export class Bloqueos implements OnInit {

  recursos: any[] = [];
  bloqueos: any[] = [];
  bloqueosPrueba: any[] = [];
  loading = false;
  mostrarBloqueo = false;
  mostrarTipoBloqueos = true;
  estaDeshabilitado = false;
  recursoSeleccionado: number = 0;
  nombreRecursoSeleccionado = '';
  tipoBloqueo = '';
  fechaBloqueo: Date | null = null;
  fechaInicioVacaciones: any;
  fechaFinVacaciones: any;
  horaInicio = '';
  horaFin = '';
  motivo = '';
  idEmpresa: number = 0;
  diasMap: { [key: string]: string } = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábado',
    '7': 'Domingo',
  };
  dias = [
    { nombre: 'L', checked: false, value: 1 },
    { nombre: 'M', checked: false, value: 2 },
    { nombre: 'M', checked: false, value: 3 },
    { nombre: 'J', checked: false, value: 4 },
    { nombre: 'V', checked: false, value: 5 },
    { nombre: 'S', checked: false, value: 6 },
    { nombre: 'D', checked: false, value: 7 },
  ];


  constructor(
    private agendamientoServices: AgendamientoService,
    private modalService: Modal,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
    this.consultarUsuarios();
  }


  ngOnInit(): void {
    const empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = empresa.id;
  }

  public consultarUsuarios(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      console.warn('No se encontró ID de empresa en el localStorage');
      return;
    }

    this.loading = true;

    this.sharedService.obtenerUsuarios(idEmpresa).subscribe({
      next: res => {
        if (res.exito) {
          this.recursos = res.datos.filter(r => r.recurso);
        }

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  cambiarRecurso(id: number): void {

    const recurso = this.recursos.find(r => r.id === id);

    this.recursoSeleccionado = id;
    this.nombreRecursoSeleccionado = recurso?.nombre || '';

    this.loading = true;
    this.bloqueos = [];

    const request = {
      empresa: this.idEmpresa,
      FechaInicio: this.formatearFechaLocal(new Date(), '00:00:00'),
      Usuario: this.recursoSeleccionado
    };

    this.agendamientoServices.consultarBloqueos(request).subscribe({
      next: (rest) => {

        if (rest.exito && Array.isArray(rest.datos)) {

          this.bloqueos = rest.datos.map((item: any) => {

            const dias = (item.diasSemana || '')
              .split(',')
              .map((d: string) => d.trim())
              .filter((d: string) => d !== '')
              .map((d: string) => this.diasMap[d] || '')
              .filter((d: string) => d !== '')
              .join(', ');

            return {
              id: item.id,
              tipoBloqueo: Number(item.tipoBloqueo),
              fechaInicio: item.fechaInicio,
              fechaFin: item.fechaFin,
              diasSemana: item.diasSemana,
              horaInicio: item.horaInicio,
              horaFin: item.horaFin,
              motivo: item.motivo,
              usuario: item.usuario,
              fechaCreacion: item.fechaCreacion,
              estado: item.estado,

              nombre: item.motivo || 'Sin motivo',
              dia: dias || 'Sin días',
              hora: `${this.formatearHora(item.horaInicio)} - ${this.formatearHora(item.horaFin)}`,
              recurso: recurso?.nombre || ''
            };
          });

        } else {
          this.bloqueos = [];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.bloqueos = [];
        console.error('Error al consultar bloqueos:', err);
      }
    });
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }


  bloqueo(): void {

    if (!this.recursoSeleccionado) return;

    this.limpiarFormulario();

    this.mostrarBloqueo = true;

  }

  back(): void {
    this.cambiarRecurso(this.recursoSeleccionado);
    this.mostrarBloqueo = false;
    this.limpiarFormulario();
  }

  cambiarTipo(): void {

    this.limpiarFormulario();

    this.mostrarTipoBloqueos = true;

  }

  onTipoBloqueoChange(tipo: string): void {

    this.tipoBloqueo = tipo;

    this.dias.forEach(d => d.checked = false);

    this.fechaBloqueo = null;

    this.fechaInicioVacaciones = null;

    this.fechaFinVacaciones = null;

    this.horaInicio = '';

    this.horaFin = '';

    this.motivo = '';

    this.estaDeshabilitado = tipo === '3';

  }

  private crearRequest(
    tipoBloqueo: string,
    fechaBloqueo: Date | null,
    horaInicio: string,
    horaFin: string,
    motivo: string,
    idEmpresa: number,
  ) {
    const diasSeleccionados = this.dias
      .filter((d) => d.checked)
      .map((d) => d.value)
      .join(',');
    const now = fechaBloqueo ? new Date(fechaBloqueo) : new Date();
    const fechaLocal = this.formatearFechaManual(new Date());
    let fechaIni: any = this.formatearFechaManual(now);

    if (this.tipoBloqueo === '4') {
      fechaIni = new Date(this.fechaInicioVacaciones);
      fechaIni.setHours(0, 0, 0, 0);
      fechaIni = this.formatearFechaManual(fechaIni);
      motivo = 'Vacaciones';
      horaInicio = '00:00';
      horaFin = '23:59';

      if (this.fechaFinVacaciones) {
        const fechaFin = new Date(this.fechaFinVacaciones);
        fechaFin.setHours(23, 59, 59, 999);
        this.fechaFinVacaciones = this.formatearFechaManual(fechaFin);
      }
    }

    return {
      TipoBloqueo: parseInt(tipoBloqueo),
      Usuario: this.recursoSeleccionado,
      FechaInicio: ['2', '4'].includes(tipoBloqueo) ? fechaIni : null,
      FechaFin: tipoBloqueo === '4' ? this.fechaFinVacaciones : null,
      HoraInicio: horaInicio,
      HoraFin: horaFin,
      Motivo: motivo,
      DiasSemana: ['1', '3'].includes(tipoBloqueo) ? diasSeleccionados : '',
      FechaCreacion: fechaLocal,
      empresa: idEmpresa,
    };
  }

  private formatearFechaManual(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  inhabilitarHorarios(): void {

    this.loading = true;

    if (this.tipoBloqueo === '') {
      this.loading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'Debes seleccionar un tipo de bloqueo.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido',
      });
      return;
    } else {
      if (this.tipoBloqueo === '1' || this.tipoBloqueo === '3') {
        const checked = this.dias.filter((dia) => dia.checked).length;
        if (checked === 0) {
          this.loading = false;
          Swal.fire({
            icon: 'warning',
            title: 'Campo obligatorio',
            text: 'Debes seleccionar un dia por lo menos.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido',
          });
          return;
        }
      } else if (this.tipoBloqueo === '2') {
        if (!this.fechaBloqueo) {
          this.loading = false;
          Swal.fire({
            icon: 'warning',
            title: 'Campo obligatorio',
            text: 'Debes seleccionar una fecha.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido',
          });
          return;
        }
      } else if (this.tipoBloqueo === '4') {
        if (!this.fechaInicioVacaciones || !this.fechaFinVacaciones) {
          this.loading = false;
          Swal.fire({
            icon: 'warning',
            title: 'Campo obligatorio',
            text: 'Debes seleccionar una fecha inicial y una final para tus vacaciones.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido',
          });
          return;
        }
      }
    }

    if (this.tipoBloqueo !== '4') {
      if (!this.horaInicio || !this.horaFin || !this.motivo) {
        this.loading = false;
        let campoFaltante = '';

        if (!this.horaInicio) {
          campoFaltante = 'Hora de inicio';
        } else if (!this.horaFin) {
          campoFaltante = 'Hora de fin';
        } else if (!this.motivo) {
          campoFaltante = 'Motivo';
        }

        Swal.fire({
          icon: 'warning',
          title: 'Campo obligatorio',
          text: `Por favor ingresa ${campoFaltante} antes de continuar.`,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Entendido',
        });

        return;
      }
    }

    const request = this.crearRequest(
      this.tipoBloqueo,
      this.fechaBloqueo,
      this.horaInicio,
      this.horaFin,
      this.motivo,
      this.idEmpresa,
    );

    this.agendamientoServices.registrarBloqueoDias(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.modalService.success(
            rest.mensaje || '¡Bloqueo Creado!',
            () => {
              this.tipoBloqueo = '';
              this.horaInicio = '';
              this.horaFin = '';
              this.motivo = '';
              this.dias.forEach((dia) => {
                dia.checked = false;
              });
              this.loading = true;
              this.back()
            }
          );
        } else {
          this.modalService.error(rest.statusText);
        }
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.statusText);
        this.loading = false;
      },
    });
    this.back();

  }

  irABloqueo(bloqueo: any, activar: boolean): void {

    this.loading = true;
    const request = {
      empresa: this.idEmpresa,
      Id: bloqueo.id,
      Activar: activar,
    };

    this.agendamientoServices.inactivarBloqueo(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.modalService.success(
            rest.mensaje || 'El bloqueo fue actualizado exitosamente',
            () => {
              this.cambiarRecurso(this.recursoSeleccionado);
            }
          );
        } else {
          this.modalService.error(rest.mensaje || 'Error de servidor');
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.modalService.error(err.statusText);
      },
    });

  }

  // =====================================
  // ELIMINAR BLOQUEO
  // =====================================

  async eliminarBloqueo(element: any): Promise<void> {
    await Swal.fire({
      title: '¿Eliminar bloqueo?',
      html: `
        ¿Está seguro de eliminar el bloqueo?
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',

      // 🔹 Muestra el loading
      showLoaderOnConfirm: true,

      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {

          await firstValueFrom(
            this.agendamientoServices.eliminarBloqueo(this.idEmpresa, element.id)
          );

        } catch (error) {

          Swal.showValidationMessage(
            'Ocurrió un error al eliminar el bloqueo.'
          );

        }
      }
    }).then((result) => {

      if (result.isConfirmed) {

        Swal.fire({
          icon: 'success',
          title: 'Bloqueo eliminado',
          text: 'La bloqueo fue eliminado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        this.cambiarRecurso(this.recursoSeleccionado);
      }

    });

  }

  formatearHora(hora: string): string {

    if (!hora) return '';

    const [hh, mm] = hora.split(':');

    const horas = Number(hh);
    const hora12 = horas % 12 || 12;
    const periodo = horas >= 12 ? 'PM' : 'AM';

    return `${String(hora12).padStart(2, '0')}:${mm} ${periodo}`;
  }

  // =====================================
  // LIMPIAR FORMULARIO
  // =====================================

  limpiarFormulario(): void {

    this.tipoBloqueo = '';

    this.fechaBloqueo = null;

    this.fechaInicioVacaciones = null;

    this.fechaFinVacaciones = null;

    this.horaInicio = '';

    this.horaFin = '';

    this.motivo = '';

    this.estaDeshabilitado = false;

    this.dias.forEach(d => d.checked = false);

  }

}
