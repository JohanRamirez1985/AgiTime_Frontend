import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
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

  constructor(
    private router: Router,
    private agendamientoServices: AgendamientoService,
    private sharedServices: SharedService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.consultarCitas(this.user, this.empresa, this.day);
    this.idEmpresa = this.empresa.id;
    this.rol = this.user.rol;
    this.estadoActivoInactivo();
    this.obtenerRangoParametrizado();
    this.obtenerServicios(this.idEmpresa);
    this.rolesPermitidos = [RolesContent.Empleado, RolesContent.Administrador];
    this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    this.obtenerBloqueos();
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.rangoTiempo = rest.datos.find(
            (h: any) => h.tipo === this.tipoRangoTiempo
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
          Swal.fire({
            icon: 'success',
            title: 'Bloqueo actualizado!',
            text: rest.mensaje,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: rest.mensaje,
          });
        }
        this.loading = false;
        this.estadoActivoInactivo();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.statusText,
        });
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
            (item: any) => item.tipo === 'Activarme'
          );
          const motivo = activarmeObj ? activarmeObj.valor : '';

          const request = this.crearRequest(
            '2',
            fechaInicio,
            '07:00',
            '23:59',
            motivo,
            this.idEmpresa,
            fechaInicio
          );

          // Retornamos el observable del segundo servicio
          return this.agendamientoServices.registrarBloqueoDias(request);
        })
      )
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            Swal.fire({
              icon: 'success',
              title: '¡Bloqueo Creado!',
              text: rest.mensaje,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Ok',
            }).then(() => {
              this.tipoBloqueo = '';
              this.horaInicio = '';
              this.horaFin = '';
              this.dias.forEach((dia) => (dia.checked = false));
              this.obtenerBloqueos();
              this.mostrarBloqueo = false;
              this.cdr.detectChanges();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: rest.statusText,
            });
          }
          this.estadoActivoInactivo();
          this.loading = false;
        },
        error: (err) => {
          this.estadoActivoInactivo();
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.statusText,
          });
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
          this.obtenerBloqueos();
          Swal.fire({
            icon: 'success',
            title: 'Bloqueo actualizado!',
            text: rest.mensaje || 'El bloqueo fue actualizado exitosamente',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok',
          });
        } else {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: rest.mensaje || 'Error de servidor',
          });
        }
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.statusText,
        });
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
      this.day
    );

    this.agendamientoServices.registrarBloqueoDias(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          Swal.fire({
            icon: 'success',
            title: '¡Bloqueo Creado!',
            text: rest.mensaje,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok',
          }).then(() => {
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
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: rest.statusText,
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.statusText,
        });
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
    day?: Date
  ) {
    const diasSeleccionados = this.dias
      .filter((d) => d.checked)
      .map((d) => d.value)
      .join(',');
    const now = day ? new Date(day) : new Date();
    const fechaLocal = this.formatearFechaManual(now);
    let fechaIni: any = fechaLocal;

    if (this.tipoBloqueo === '4') {
      fechaIni = new Date(fechaLocal);
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

  toggleSeleccionServicio(servicio: any): void {
    const esOtro = servicio.nombre?.toLowerCase() === 'otro';

    if (this.estaSeleccionado(servicio)) {
      // Si el servicio ya estaba seleccionado, lo quitamos
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(
        (s) => s.id !== servicio.id
      );

      // Si se desmarcó "Otro", volvemos a permitir todos
      if (esOtro) {
        this.otroSeleccionado = false;
        this.cdr.detectChanges();
      }
      this.cdr.detectChanges();
    } else {
      // Si se selecciona un servicio nuevo
      if (esOtro) {
        // Si selecciona "Otro", limpiamos los demás
        this.serviciosSeleccionados = [servicio];
        this.otroSeleccionado = true;
        this.cdr.detectChanges();
      } else {
        // Si "Otro" ya estaba seleccionado, no permitimos seleccionar otro
        if (this.otroSeleccionado) return;

        // Caso normal: agregar el servicio
        this.serviciosSeleccionados.push(servicio);
        this.cdr.detectChanges();
      }
      this.cdr.detectChanges();
    }
  }

  public reservar(): void {
    if (this.otroSeleccionado) {
      console.log('ENTROOOOOOOOOOOOO');

      this.cdr.detectChanges();
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
      this.mostrarAgenda = true;
      this.cdr.detectChanges();
    }
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some((s) => s.id === servicio.id);
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        this.serviciosFiltrados = [...rest.datos];
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
          this.seleccionarRecursoEmpleado(this.day);
        } else {
          this.seleccionarRecurso(this.day);
        }
      },
    });
  }

  seleccionarRecursoEmpleado(fecha: Date): void {
    const request = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
      recurso: this.user.id,
    };

    this.agendamientoServices
      .consultarAgendamientosEmpleado(request)
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            for (let i = 0; i < this.horas.length; i++) {
              let disponible = true;
              disponible = rest.horasOcupadas.find(
                (h: any) => h === this.horas[i].hora
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

  public seleccionarRecurso(fecha: Date): void {
    const request = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
      recurso: this.user.id,
    };

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
                (h: any) => h === this.horas[i].hora
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
      minutos
    );
  };

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  private consultarCitas(user: any, empresa: any, fecha: Date): void {
    this.loading = true;
    const request = {
      empresa: empresa.id,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      FechaFin: this.formatearFechaLocal(fecha, '23:59:00'),
      recurso: user.id,
    };

    this.agendamientoServices.consultarCitasRecurso(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.citasHoy = rest.datos;
          const citasConTotales = this.citasHoy.map((cita) => {
            const totalServicios = cita.servicios.reduce(
              (acum: any, servicio: any) => acum + servicio.valor,
              0
            );
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

  public confirmarCita(cita: any) {
    Swal.fire({
      title: 'Confirmar Asistecia',
      html: `<p>¿El cliente <strong> ${cita.nombreCliente} </strong>  asistio a la cita?</p>`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive',
      },
    }).then((result) => {
      this.loading = true;
      const now = new Date(this.day);
      const fechaLocal =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        'T' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0') +
        ':' +
        String(now.getSeconds()).padStart(2, '0');

      const request = {
        empresa: JSON.parse(localStorage.getItem('empresa') || '{}').id,
        Id: cita.id,
        Asistencia: result.isConfirmed,
      };

      this.agendamientoServices.ConfirmarAsitenciaCita(request).subscribe({
        next: (rest) => {
          this.consultarCitas(this.user, this.empresa, new Date(fechaLocal));
        },
      });
    });
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
        const fechaLocal =
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0') +
          'T' +
          String(now.getHours()).padStart(2, '0') +
          ':' +
          String(now.getMinutes()).padStart(2, '0') +
          ':' +
          String(now.getSeconds()).padStart(2, '0');

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
                new Date(fechaLocal)
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

  public seleccionarHora(hora: any): void {
    this.loading = true;
    let horaDiponible = false;

    horaDiponible = this.validarHoraDisponible(hora.hora);

    if (horaDiponible) {
      const request = this.createJson(hora.hora);
      this.agendamientoServices.registrarCita(request).subscribe({
        next: (rest) => {
          if (rest.exito) {
            Swal.fire({
              icon: 'success',
              title: '¡Cita creada!',
              text: rest.mensaje || 'La cita fue creado exitosamente',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Ok',
            }).then(() => {
              this.serviciosSeleccionados = [];
              this.mostrarAgenda = false;
              this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
            });
          } else {
            Swal.fire({
              icon: 'error',
              text: rest.mensaje || 'Error de servidor',
            });
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error de servidor',
            text: err.statusText,
          });
        },
      });
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
      (h) => !this.horas.some((x) => x.hora === h)
    );

    if (conflicto) {
      return false;
    }

    return true;
  }

  prueba(tipo: string) {
    console.log();
  }

  private createJson(hora: string) {
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
      const fechaLocal =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        'T' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0') +
        ':' +
        String(now.getSeconds()).padStart(2, '0');

      const valor = this.serviciosSeleccionados.map((s) => s.valor);
      const tiempoTotalServicio = this.serviciosSeleccionados
        .map((s) => s.tiempo)
        .reduce((a, b) => a + b, 0);
      const serviciosSeleccionados = this.serviciosSeleccionados.map((s) => ({
        servicio: s.id,
      }));

      const costo = valor.reduce((a, b) => a + b, 0);

      const json = {
        FechaIni: fechaFinal,
        recurso: this.user.id,
        Valor: this.otroSeleccionado ? this.costoOtro : costo,
        UsuarioCreacion: 'Usuario',
        Hora: tiempoTotalServicio === 0 ? 30 : tiempoTotalServicio,
        empresa: this.idEmpresa,
        servicios: serviciosSeleccionados,
        clienteInfo: null,
        fechaCreacion: fechaLocal,
      };
      return json;
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
