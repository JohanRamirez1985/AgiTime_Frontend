import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RolesContent } from '../../../shared/libs/roles';
import { switchMap, tap } from 'rxjs/operators';
import { Modal } from '../../../shared/services/modal';
import { ReservaDialog } from '../../reserva-dialog/reserva-dialog';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-dashboardR',
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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // ClienteAgendar
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardRecurso {
  citasHoy: any[] = [];
  totalServicios: number = 0;
  loading: boolean = true;
  user: any = '';
  empresa: any = '';
  day: Date = new Date();
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  horas: { hora: string; disponible: boolean }[] = [];
  idEmpresa: number = 0;
  mostrarAgenda: boolean = false;
  serviciosFiltrados: any[] = [];
  servicios: any[] = [];
  serviciosSeleccionados: any[] = [];
  dias = [
    { nombre: 'L', checked: false, value: 1 },
    { nombre: 'M', checked: false, value: 2 },
    { nombre: 'M', checked: false, value: 3 },
    { nombre: 'J', checked: false, value: 4 },
    { nombre: 'V', checked: false, value: 5 },
    { nombre: 'S', checked: false, value: 6 },
    { nombre: 'D', checked: false, value: 7 },
  ];
  horaInicio: string = '';
  horaFin: string = '';
  motivo: string = '';
  bloqueoDia: boolean = false;
  mostrarBloqueo: boolean = false;
  tipoBloqueo: string = '';
  mostrarTipoBloqueos: boolean = true;
  fechaBloqueo: Date | null = null;
  fechaInicioVacaciones: any;
  fechaFinVacaciones: any;
  diasMap: { [key: string]: string } = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábado',
    '7': 'Domingo',
  };
  btnActivar: boolean = false;
  bloqueos = [
    {
      id: 0,
      nombre: '',
      dia: '',
      hora: ``,
      recurso: ``,
      estado: '',
      fechaInicio: '',
      tipoBloqueo: '',
    },
  ];
  rol: any;
  rolesPermitidos: number[] = [];
  otroSeleccionado: boolean = false;
  costoOtro: number = 0;
  rangoTiempo: string = '';
  tipoRangoTiempo: string = 'Tiempo_Agenda';
  estaDeshabilitado: boolean = false;
  seleccionRecurso: boolean = false;
  viewDate: Date = new Date();
  clientesEmpresa: any[] = [];
  busqueda: string = '';

  constructor(
    private router: Router,
    private agendamientoServices: AgendamientoService,
    private sharedServices: SharedService,
    private cdr: ChangeDetectorRef,
    private modalService: Modal,
    private dialog: MatDialog,
    private clienteService: ClienteService,
  ) { }

  onTipoBloqueoChange(valor: string) {
    this.tipoBloqueo = valor;
    this.mostrarTipoBloqueos = false;
    this.estaDeshabilitado = false;
    if (this.tipoBloqueo === '3') {
      this.horaInicio = '00:00';
      this.horaFin = '23:59';
      this.motivo = 'Descanso';
      this.estaDeshabilitado = true;
    }
  }

  public cambiarTipo(): void {
    this.mostrarTipoBloqueos = true;
    this.tipoBloqueo = '';
    this.estaDeshabilitado = false;
    this.horaInicio = '';
    this.horaFin = '';
    this.motivo = '';
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = this.empresa.id;
    this.seleccionRecurso = this.empresa.servicio;
    this.rol = this.user.rol;
    this.consultarCitas(this.user, this.empresa, this.day);
    this.estadoActivoInactivo();
    this.obtenerRangoParametrizado();
    this.obtenerServicios(this.idEmpresa);
    this.rolesPermitidos = [RolesContent.Empleado, RolesContent.Administrador];
    this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    this.obtenerBloqueos();
    this.consultarInfoCliente();
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.rangoTiempo = rest.datos.find(
            (h: any) => h.tipo === this.tipoRangoTiempo,
          ).valor;
        }
      },
    });
  }

  private estadoActivoInactivo() {
    const request = {
      emp: this.idEmpresa,
      usuario: this.user.id,
    };

    this.agendamientoServices.consultarEstadoUsuario(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.btnActivar = rest.datos;
          this.cdr.detectChanges();
        }
      },
    });
  }

  public activarUsuario() {
    this.loading = true;
    const request = {
      empresa: this.idEmpresa,
      Usuario: this.user.id,
    };

    this.agendamientoServices.activarUsuarioBtn(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.modalService.success(
            rest.mensaje || 'Bloqueo actualizado!',
            () => { }
          );
        } else {
          this.modalService.error(rest.mensaje);
        }
        this.loading = false;
        this.estadoActivoInactivo();
      },
      error: (err) => {
        this.modalService.error(err.statusText);
        this.loading = false;
      },
    });
  }

  public inactivarUsuario() {
    this.loading = true;
    const fechaInicio = new Date();

    this.sharedServices
      .parametros(this.idEmpresa.toString())
      .pipe(
        switchMap((rest: any) => {
          const activarmeObj = rest.datos.find(
            (item: any) => item.tipo === 'Activarme',
          );
          const motivo = activarmeObj ? activarmeObj.valor : '';

          const request = this.crearRequest(
            '2',
            fechaInicio,
            '07:00',
            '23:59',
            motivo,
            this.idEmpresa,
          );

          // Retornamos el observable del segundo servicio
          return this.agendamientoServices.registrarBloqueoDias(request);
        }),
      )
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.modalService.success(
              rest.mensaje || '¡Bloqueo Creado!',
              () => {
                this.tipoBloqueo = '';
                this.horaInicio = '';
                this.horaFin = '';
                this.dias.forEach((dia) => (dia.checked = false));
                this.obtenerBloqueos();
                this.mostrarBloqueo = false;
                this.cdr.detectChanges();
              }
            );
          } else {
            this.modalService.error(rest.statusText);
          }
          this.estadoActivoInactivo();
          this.loading = false;
        },
        error: (err) => {
          this.modalService.error(err.statusText);
          this.estadoActivoInactivo();
          this.loading = false;
        },
      });
  }

  private obtenerBloqueos(): void {
    const request = {
      empresa: this.idEmpresa,
      FechaInicio: this.formatearFechaLocal(this.day, '00:00:00'),
      Usuario: this.user.id,
    };

    this.agendamientoServices.consultarBloqueos(request).subscribe({
      next: (rest) => {
        if (rest.exito && Array.isArray(rest.datos)) {
          this.bloqueos = rest.datos.map((item: any) => {
            const dias = (item.diasSemana ?? '')
              .split(',')
              .filter((d: any) => d.trim() !== '')
              .map((d: any) => this.diasMap[d] ?? '')
              .join(', ');

            return {
              nombre: item.motivo ?? 'Sin motivo',
              dia: dias || 'Sin días',
              hora: `${item.horaInicio} - ${item.horaFin}`,
              recurso: `Usuario ${item.usuario}`,
              id: item.id,
              estado: item.estado,
              tipoBloqueo: item.tipoBloqueo.toString(),
              fechaInicio: item.fechaInicio,
            };
          });
        } else {
          this.bloqueos = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  irABloqueo(bloqueo: any, activar: boolean) {
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
              this.obtenerBloqueos();
            }
          );
        } else {
          this.modalService.error(rest.mensaje || 'Error de servidor');
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        this.modalService.error(err.statusText);
      },
    });
  }

  inhabilitarHorarios() {
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
              this.obtenerBloqueos();
              this.mostrarBloqueo = false;
              this.cdr.detectChanges();
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
  }

  public back() {
    this.mostrarBloqueo = false;
    this.cdr.detectChanges();
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
    const now = fechaBloqueo ? new Date(fechaBloqueo) : new Date(this.day);
    const fechaLocal = this.formatearFechaManual(this.day);
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
      Usuario: this.user.id,
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

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  toggleSeleccionServicio(servicio: any): void {
    const esOtro = servicio.nombre?.toLowerCase() === 'otro';

    if (this.estaSeleccionado(servicio)) {
      // Si el servicio ya estaba seleccionado, lo quitamos
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(
        (s) => s.id !== servicio.id,
      );

      // Si se desmarcó "Otro", volvemos a permitir todos
      if (esOtro) {
        this.otroSeleccionado = false;
      }
    } else {
      // Si se selecciona un servicio nuevo
      if (esOtro) {
        // Si selecciona "Otro", limpiamos los demás
        this.serviciosSeleccionados = [servicio];
        this.otroSeleccionado = true;
      } else {
        // Si "Otro" ya estaba seleccionado, no permitimos seleccionar otro
        if (this.otroSeleccionado) return;

        // Caso normal: agregar el servicio
        this.serviciosSeleccionados.push(servicio);
      }
    }

    this.cdr.detectChanges();
  }

  public reservar(): void {
    if (this.otroSeleccionado) {
      Swal.fire({
        title: 'Ingrese el costo del servicio',
        input: 'number',
        inputLabel: 'Valor del servicio',
        inputPlaceholder: 'Ej: 25000',
        inputAttributes: {
          min: '0',
          step: '1000',
        },
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        customClass: {
          input: 'swal-input-centered', // 👈 agregamos una clase personalizada
        },
        inputValidator: (value) => {
          if (!value || isNaN(+value) || +value <= 0) {
            return 'Por favor ingrese un valor válido';
          }
          return null;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const costo = Number(result.value);
          this.costoOtro = costo;
          this.mostrarAgenda = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      let serviciosSinCosto = this.serviciosSeleccionados
        .filter(s => s.valor === 0 && s.id !== 2);

      if (serviciosSinCosto.length > 0) {

        const htmlInputs = serviciosSinCosto.map((servicio, index) => `
          <div style="margin-bottom:10px; text-align:left;">
            <label><b>${servicio.nombre}</b></label>
            <input 
              type="number" 
              id="costo-${index}" 
              class="swal2-input" 
              placeholder="Ej: 25000"
              min="0"
              step="1000"
            >
          </div>
        `).join('');

        Swal.fire({
          title: 'Ingrese los costos de los servicios',
          html: htmlInputs,
          confirmButtonText: 'Guardar',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false,

          preConfirm: () => {
            const costos: number[] = [];

            for (let i = 0; i < serviciosSinCosto.length; i++) {
              const input = document.getElementById(`costo-${i}`) as HTMLInputElement;
              const valor = Number(input.value);

              if (!valor || isNaN(valor) || valor <= 0) {
                Swal.showValidationMessage(`Ingrese un valor válido para ${serviciosSinCosto[i].nombre}`);
                return;
              }

              costos.push(valor);
            }

            return costos;
          }
        }).then((result) => {
          if (result.isConfirmed) {

            result.value.forEach((valor: number, index: number) => {
              serviciosSinCosto[index].valor = valor;
            });

            this.finalizarAgenda();
          }
        });

      } else {
        this.finalizarAgenda();
      }
    }
  }

  finalizarAgenda() {
    this.seleccionarRecursoEmpleado(this.day);
    this.mostrarAgenda = true;
    this.cdr.detectChanges();
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some((s) => s.id === servicio.id);
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        this.serviciosFiltrados = [...rest.datos];
        this.serviciosFiltrados = this.serviciosFiltrados.filter(
          (s) => s.sede === this.user.sede,
        );
        this.servicios = this.serviciosFiltrados;
        this.loading = false;
      },
    });
  }

  public obtenerHorarios(rolPermitido: boolean): void {
    this.sharedServices.obtenerAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        const respuesta = rest.datos;
        this.horas = respuesta.map((h: { valor: string; estado: boolean }) => {
          const [hour, minute] = h.valor.split(':');
          const date = new Date();
          date.setHours(Number(hour), Number(minute));

          const horaFormateada = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          return {
            hora: horaFormateada,
            disponible: h.estado,
          };
        });

        if (rolPermitido) {
          if (this.seleccionRecurso) {
            this.loading = false;
          }
          this.seleccionarRecursoEmpleado(this.day);
        } else {
          this.seleccionarRecurso(this.day);
        }
      },
    });
  }

  seleccionarRecursoEmpleado(fecha: Date): void {

    let request: any = {}

    if (this.seleccionRecurso) {
      request = {
        empresa: this.idEmpresa,
        FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
        fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
        profesional: [...new Set(
          this.serviciosSeleccionados
            .filter(s => s.recurso != null)
            .map(s => s.recurso)
        )].join(',')
      };
    } else {
      request = {
        empresa: this.idEmpresa,
        FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
        fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
        recurso: this.user.id,
      };
    }

    if (this.seleccionRecurso && !request.profesional) {
      this.loading = false;
      this.cdr.detectChanges();
    } else {
      this.agendamientoServices
        .consultarAgendamientosEmpleado(request)
        .subscribe({
          next: (rest) => {
            if (rest.exito) {
              for (let i = 0; i < this.horas.length; i++) {
                let disponible = true;
                disponible = rest.horasOcupadas.find(
                  (h: any) => h === this.horas[i].hora,
                );
                if (disponible) {
                  this.horas[i].disponible = false;
                }
              }
              this.horas = this.horas.filter((h) => h.disponible);
            }
            this.verificarHoras();
          },
        });
    }
  }

  public seleccionarRecurso(fecha: Date): void {
    const request: any = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
    };

    if (!this.seleccionRecurso) {
      request.recurso = this.user.id;
    }

    this.agendamientoServices.consultarAgendamientos(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          if (rest.diaCompletoBloqueado) {
            this.horas.forEach((h) => {
              h.disponible = false;
            });
          } else {
            for (let i = 0; i < this.horas.length; i++) {
              let disponible = true;
              disponible = rest.horasOcupadas.find(
                (h: any) => h === this.horas[i].hora,
              );
              if (disponible) {
                this.horas[i].disponible = false;
              }
            }
          }

          this.horas = this.horas.filter((h) => h.disponible);
        }
        this.verificarHoras();
      },
    });
  }

  private esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }

  private verificarHoras(): void {
    const ahora = new Date();
    const fechaSeleccionada = this.day;

    const esHoy = this.esHoy(fechaSeleccionada);

    let horasFuturas: any[] = [];

    if (this.rolesPermitidos.includes(this.rol)) {
      horasFuturas = this.horas.map((h) => ({
        ...h,
        fecha: this.convertirHoraAFecha(h.hora, fechaSeleccionada),
      }));
    } else {
      horasFuturas = this.horas
        .map((h) => ({
          ...h,
          fecha: this.convertirHoraAFecha(h.hora, fechaSeleccionada),
        }))
        .filter((h) => (esHoy ? h.fecha >= ahora : true));
    }

    // Ordenar
    horasFuturas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    // Separar
    this.horasAM = horasFuturas.filter((h) => h.hora.includes('AM'));
    this.horasPM = horasFuturas.filter((h) => h.hora.includes('PM'));

    this.loading = false;
    this.cdr.detectChanges();
  }

  private convertirHoraAFecha = (horaStr: string, fechaBase: Date): Date => {
    const [tiempo, ampm] = horaStr.split(' ');
    let [hora, minutos] = tiempo.split(':').map(Number);

    if (ampm === 'PM' && hora !== 12) hora += 12;
    if (ampm === 'AM' && hora === 12) hora = 0;

    return new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      hora,
      minutos,
    );
  };

  private consultarCitas(user: any, empresa: any, fecha: Date): void {
    this.loading = true;

    const request: any = {
      empresa: empresa.id,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      FechaFin: this.formatearFechaLocal(fecha, '23:59:00'),
    };

    if (!this.seleccionRecurso) {
      request.recurso = user.id;
    }

    this.agendamientoServices.consultarCitasRecurso(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.ordenCitas(rest.datos);
          const citasConTotales = this.citasHoy.map((cita) => {
            let totalServicios
            if (this.seleccionRecurso) {
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

  private ordenCitas(citas: any) {
    if (this.seleccionRecurso) {
      this.agruparPorRecurso(citas);
    } else {
      this.citasHoy = citas;
    }
  }

  private agruparPorRecurso(citas: any[]) {
    const resultado = citas
      .map(item => {
        const clienteInfo = item.citas[0]?.cliente;
        const cliente = `${clienteInfo?.nombreCliente ?? ''} - ${clienteInfo?.telefonoCliente ?? ''}`;
        const nombreCliente = item.citas[0]?.cliente?.nombreCliente ?? '';
        const telefono = item.citas[0]?.cliente?.telefonoCliente ?? '';

        const todasLasCitas = item.citas.flatMap((c: any) => c.servicios || []);

        const nombresServicios = todasLasCitas
          .map((s: any) => s.nombre)
          .join(', ');

        const totalServicios = todasLasCitas
          .reduce((sum: number, s: any) => sum + (s.valor || 0), 0);

        const citaMasAntigua = item.citas
          .slice()
          .sort((a: any, b: any) =>
            new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
          )[0];

        const fecha = new Date(citaMasAntigua.fechaInicio);

        const hora = fecha.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        return {
          id: item.padre,
          nombreCliente: cliente,
          hora,
          fechaOrden: fecha.getTime(),
          nombre: nombresServicios,
          total: totalServicios,
          cliente: nombreCliente,
          telefono: telefono,
          estado: item.citas[0].estado,
          fechaInicio: fecha
        };
      })
      .sort((a, b) => a.fechaOrden - b.fechaOrden);

    this.citasHoy = resultado
  }

  public recordatorioWssp(cliente: any) {
    const fecha = new Date(cliente.fechaOrden);

    const fechaFormateada = fecha.toLocaleDateString('es-CO');
    const horaFormateada = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const telefonoBreB = '3137938061'
    const abono = cliente.total / 2;


    const mensaje = `¡Hola ${cliente.cliente}! 

    Queremos recordarte que tu servicio de ${cliente.nombre} está programado para el ${fechaFormateada} a las ${horaFormateada}.
    Para confirmar la cita se debe realizar un abono de $${abono.toLocaleString("es-CO")}, para mayor comodidad, te ofrecemos la opción de pagar de manera rápida y segura a través de la llave Bre-b ${telefonoBreB}.  
    Por favor envía el comprobante al WhatsApp. Se aclara que si no se realiza el abono, el sistema libera la cita y puede ser ocupada por otro cliente.
    Si necesitas asistencia con el proceso de pago, no dudes en contactarnos.

    ¡Nos vemos pronto!

    Saludos,  
    El equipo de KC NAILS COFFE BAR`;


    // 👉 Redirección a WhatsApp
    const numero = '57' + cliente.telefono;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  public confirmarCita(cita: any) {
    const nombreMostrar = this.seleccionRecurso
      ? cita.nombreCliente.split('-')[0].trim()
      : cita.nombreCliente;
    const checkboxHtml = this.seleccionRecurso ? '' : `
      <div style="margin-top: 15px; display: flex; justify-content: center; align-items: center;">
        <label style="font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="usoBonoCheckbox">
          ¿El servicio incluye bono?
        </label>
      </div>
    `;

    Swal.fire({
      title: 'Confirmar Asistencia',
      html: `
        ${checkboxHtml}
        <p>¿El cliente <strong>${nombreMostrar}</strong> asistió a la cita?</p>
      `,
      icon: 'success',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive',
      },
      preConfirm: () => {
        const usoBono = this.seleccionRecurso ? false : (document.getElementById('usoBonoCheckbox') as HTMLInputElement).checked;
        return { usoBono };
      }
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.cancel) {
        this.loading = true;

        const now = new Date(this.day);
        const fechaLocal = this.formatearFechaManual(now);

        const request: any = {
          empresa: JSON.parse(localStorage.getItem('empresa') || '{}').id,
          Id: cita.id,
          Asistencia: result.isConfirmed,
          Bono: result.value?.usoBono || false
        };

        if (this.seleccionRecurso) {
          request.usuarioCreacion = this.user.id.toString()
          request.fechaCreacion = this.formatearFechaActual()
        }

        this.agendamientoServices.ConfirmarAsitenciaCita(request).subscribe({
          next: (rest) => {
            this.consultarCitas(this.user, this.empresa, new Date(fechaLocal));
          },
          error: (err) => {
            this.modalService.error(err.error.mensaje)
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  formatearFechaActual(): string {
    const now = new Date();

    return `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())}` +
      `T${this.pad(now.getHours())}:${this.pad(now.getMinutes())}:${this.pad(now.getSeconds())}`;
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

  abrirAgendar() {
    this.router.navigate(['/cliente/agendar']);
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
                this.user,
                this.empresa,
                new Date(fechaLocal),
              );
            }
          },
        });
      }
    });
  }

  public previus(cita: boolean): void {
    const nuevaFecha = new Date(this.day);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    if (cita) {
      this.day = nuevaFecha;
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    } else {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      nuevaFecha.setHours(0, 0, 0, 0);

      if (
        nuevaFecha < hoy &&
        (this.rol === null || !this.rolesPermitidos.includes(this.rol))
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Día no hábil',
          text: 'No puedes consultar días anteriores',
        });
      } else {
        this.day = nuevaFecha;
        this.loading = true;
        this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
      }
    }
    this.cdr.detectChanges();
  }

  public nextPeriod(cita: boolean): void {
    const nuevaFecha = new Date(this.day);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    this.day = nuevaFecha;
    this.day = nuevaFecha;
    if (cita) {
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    } else {
      this.loading = true;
      this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    }
    this.cdr.detectChanges();
  }

  public mostrarServicios(): void {
    this.mostrarAgenda = false
    this.cdr.detectChanges();
  }

  filtrarServicios() {
    const texto = this.busqueda.toLowerCase();

    this.serviciosFiltrados = this.servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto)
    );
    this.cdr.detectChanges();
  }

  public today(cita: boolean): void {
    const nuevaFecha = new Date();
    this.day = nuevaFecha;
    this.day = nuevaFecha;
    if (cita) {
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    } else {
      this.loading = true;
      this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    }
    this.cdr.detectChanges();
  }

  private agendar(hora: any, bono: boolean, result: any) {
    const request: any = this.createJson(hora, bono, result);
    // Si request.FechaIni viene como ISO: 2026-04-07T15:00:00
    const fecha = new Date(request?.FechaIni);

    // Formato fecha: 07-04-26
    const fechaFormateada = fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    // Hora: 15:00
    const horaFormateada = fecha.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const numero = '57' + result.celular;
    const nombre = result.nombre;
    const nombresServicios = this.serviciosSeleccionados.map(s => s.nombre);
    const servicio =
      nombresServicios.length > 1
        ? nombresServicios.slice(0, -1).join(', ') + ' y ' + nombresServicios[nombresServicios.length - 1]
        : nombresServicios[0];

    const mensaje = `¡Hola ${nombre}!

      Tu cita ha sido agendada exitosamente en KC NAILS COFFE BAR.

      * Fecha: ${fechaFormateada}  
      * Hora: ${horaFormateada}  
      * Servicio: ${servicio}

      Te recomendamos llegar puntual para brindarte la mejor atención y cumplir con tu horario.

      En caso de que necesites reprogramar tu cita, puedes comunicarte con nosotros con anticipación.

      ¡Será un gusto atenderte!

      Saludos,  
      El equipo de KC NAILS COFFE BAR`;

    if (this.seleccionRecurso) {
      this.agendamientoServices.guardarCita(request).subscribe({
        next: (rest) => {
          this.modalService.success(
            rest.mensaje || 'La cita fue creada exitosamente',
            () => {
              this.serviciosSeleccionados = [];
              this.mostrarAgenda = false;
              this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
            }
          );
          this.loading = false;

          const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
          window.open(url, '_blank');
        },
        error: (err) => {
          this.modalService.error(err.statusText);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.agendamientoServices.registrarCita(request).subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.modalService.success(
              rest.mensaje || 'La cita fue creado exitosamente',
              () => {
                this.serviciosSeleccionados = [];
                this.mostrarAgenda = false;
                this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
              }
            );
          } else {
            this.modalService.error(rest.mensaje || 'Error de servidor')
          }
          this.loading = false;
        },
        error: (err) => {
          this.modalService.error(err.statusText);
          this.loading = false;
        },
      });
    }
  }

  private consultarInfoCliente(): void {
    this.clienteService
      .obtenerInfoCliente(this.idEmpresa.toString())
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.clientesEmpresa = rest.datos;
          }
        },
      });
  }

  public seleccionarHora(hora: any): void {
    this.loading = true;
    let horaDiponible = false;

    horaDiponible = this.validarHoraDisponible(hora.hora);

    if (horaDiponible) {
      if (this.seleccionRecurso) {
        const fechaFormateada = this.viewDate.toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const valor = this.serviciosSeleccionados.map((s) => s.valor);
        let costo = valor.reduce((a, b) => a + b, 0);
        const costoFormateado = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(costo);

        const dialogRef = this.dialog.open(ReservaDialog, {
          width: '400px',
          data: {
            fecha: fechaFormateada,
            hora: hora.hora,
            costo: costoFormateado,
          },
        });
        // 👂 Accedemos a la instancia del modal para escuchar el evento
        const instance = dialogRef.componentInstance;

        instance.celularIngresado.subscribe((celular: string) => {
          const cliente = this.clientesEmpresa.find(
            (c) => c.telefono === celular || c.celular === celular
          );

          if (cliente) {
            instance.poblarDatos(cliente); // ✅ rellenar datos en el modal
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loading = true;
            this.agendar(hora.hora, false, result);
          } else {
            this.loading = false;
          }
        });
      } else {
        Swal.fire({
          title: 'Cita',
          html: `<div style="margin-top: 15px; display: flex; justify-content: center; align-items: center;">
                    <label style="font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" id="usoBonoCheckbox">
                      ¿El servicio incluye bono?
                    </label>
                  </div>`,
          icon: 'success',
          showCloseButton: true,
          confirmButtonColor: '#3085d6',
          preConfirm: () => {
            const usoBono = (document.getElementById('usoBonoCheckbox') as HTMLInputElement).checked;
            return { usoBono };
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.close) {
            this.loading = false;
            this.cdr.detectChanges();
          } else {
            const usoBono = result.value?.usoBono || false;
            this.loading = true;
            this.agendar(hora.hora, usoBono, '');
          }
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje',
        text: 'No puedes realizar el agendamiento ya que el tiempo de la cita sobrepasa al rango de horas disponibles.',
      });
      this.loading = false;
    }

    this.cdr.detectChanges();
  }

  private validarHoraDisponible(hora: string): boolean {
    const loteHoras =
      this.serviciosSeleccionados.reduce((acc, item) => acc + item.tiempo, 0) /
      parseInt(this.rangoTiempo);

    const parseHora = (horaStr: string): Date => {
      const [time, modifier] = horaStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const formatHora = (date: Date): string => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mm = minutes.toString().padStart(2, '0');
      const hh = hours.toString().padStart(2, '0');
      return `${hh}:${mm} ${ampm}`;
    };

    const rangoMinutos = parseInt(this.rangoTiempo);
    const horaBase = parseHora(hora);
    const horasGeneradas: string[] = [];

    for (let i = 0; i < loteHoras; i++) {
      const nuevaHora = new Date(horaBase.getTime() + i * rangoMinutos * 60000);
      horasGeneradas.push(formatHora(nuevaHora));
    }

    const conflicto = horasGeneradas.find(
      (h) => !this.horas.some((x) => x.hora === h),
    );

    if (conflicto) {
      return false;
    }

    return true;
  }

  private createJson(hora: string, bono: boolean, result: any) {
    const match = hora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    //const fechaBase = this.day.toISOString().split('T')[0];
    const year = this.day.getFullYear();
    const month = String(this.day.getMonth() + 1).padStart(2, '0');
    const day = String(this.day.getDate()).padStart(2, '0');
    const fechaBase = `${year}-${month}-${day}`;

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
      const horasStr = horas.toString().padStart(2, '0');
      const fechaFinal = `${fechaBase}T${horasStr}:${minutos}:00`;
      const now = new Date(this.day);
      const fechaLocal = this.formatearFechaManual(now);

      const valor = this.serviciosSeleccionados.map((s) => s.valor);
      const tiempoTotalServicio = this.serviciosSeleccionados
        .map((s) => s.tiempo)
        .reduce((a, b) => a + b, 0);
      const serviciosSeleccionados = this.serviciosSeleccionados.map((s) => ({
        servicio: s.id,
      }));

      const costo = valor.reduce((a, b) => a + b, 0);

      let json = {};

      if (this.seleccionRecurso) {
        let alterno = this.serviciosSeleccionados
          .filter(s => s.alterno)
          .sort((a, b) => b.tiempo - a.tiempo);
        let noAlterno = this.serviciosSeleccionados
          .filter(s => !s.alterno)
          .sort((a, b) => b.tiempo - a.tiempo);

        let resultadoAlterno = alterno.map(a => ({
          FechaIni: fechaFinal,
          recurso: a.recurso,
          Valor: a.valor,
          Hora: a.tiempo,
          servicios: [
            {
              servicio: a.id
            }
          ]
        }));
        let baseFecha = fechaFinal;
        let horaAlterno = 0;

        if (alterno.length > 0) {
          baseFecha = resultadoAlterno[0].FechaIni;
          horaAlterno = alterno[0].tiempo
        }

        const formatearFechaLocal = (fecha: Date) => {
          return fecha.getFullYear() + '-' +
            String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
            String(fecha.getDate()).padStart(2, '0') + 'T' +
            String(fecha.getHours()).padStart(2, '0') + ':' +
            String(fecha.getMinutes()).padStart(2, '0') + ':' +
            String(fecha.getSeconds()).padStart(2, '0');
        };

        let base = new Date(baseFecha);

        if (isNaN(base.getTime())) {
          throw new Error("baseFecha inválida: " + baseFecha);
        }

        // arrancan después del tiempo de alternos
        base.setMinutes(base.getMinutes() + horaAlterno);

        let resultadoNoAlterno = noAlterno.map(a => {
          const fechaInicio = new Date(base);

          const item = {
            FechaIni: formatearFechaLocal(fechaInicio),
            recurso: a.recurso,
            Valor: a.valor,
            Hora: a.tiempo,
            servicios: [
              {
                servicio: a.id
              }
            ]
          };

          base.setMinutes(base.getMinutes() + a.tiempo);

          return item;
        });

        resultadoNoAlterno.forEach(element => {
          resultadoAlterno.push(element)
        });

        json = {
          FechaIni: fechaFinal,
          empresa: this.idEmpresa,
          UsuarioCreacion: 'Usuario',
          fechaCreacion: fechaLocal,
          clienteInfo: {
            Nombre: result.nombre,
            Telefono: result.celular,
            Correo: result.correo,
            FechaNacimiento: result.fechaNacimiento,
          },
          citas: resultadoAlterno
        }
        return json;
      } else {

        json = {
          recurso: result.celular ? 0 : this.user.id,
          FechaIni: fechaFinal,
          Valor: this.otroSeleccionado ? this.costoOtro : costo,
          UsuarioCreacion: 'Usuario',
          Hora: tiempoTotalServicio === 0 ? 30 : tiempoTotalServicio,
          empresa: this.idEmpresa,
          servicios: serviciosSeleccionados,
          clienteInfo: result?.celular
            ? {
              Nombre: result.nombre,
              Telefono: result.celular,
              Correo: result.correo,
              FechaNacimiento: result.fechaNacimiento,
            }
            : null,
          fechaCreacion: fechaLocal,
          Bono: bono
        };

        return json;
      }
    } else {
      return;
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const index = event.index;
    this.day = new Date();
    this.loading = true;
    if (index === 0) {
      this.consultarCitas(this.user, this.empresa, this.day);
    }
    if (index === 1) {
      this.serviciosSeleccionados = [];
      this.mostrarAgenda = false;
      this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    }
    if (index === 2) {
      this.mostrarBloqueo = false;
      this.tipoBloqueo = '';
      this.mostrarTipoBloqueos = true;
      this.obtenerBloqueos();
    }
  }

  public bloqueo(): void {
    this.mostrarBloqueo = true;
    this.loading = false;
    this.mostrarTipoBloqueos = true;
    this.cdr.detectChanges();
  }
}
