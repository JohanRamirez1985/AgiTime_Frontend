import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
import { MatMenuModule } from '@angular/material/menu';
import { EdicionCitas } from '../edicion-citas/edicion-citas'
import { firstValueFrom } from 'rxjs';

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
    MatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule
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
  empresaServicio: boolean = false;
  empresaOrden: boolean = false;
  empresaRecursoMultiple: boolean = false;
  empresaNormal: boolean = false;
  tipoOrden: boolean = false;
  viewDate: Date = new Date();
  clientesEmpresa: any[] = [];
  busqueda: string = '';
  esMobile = window.innerWidth < 768;
  cruzeHorario: boolean = true;
  enviarMjsWssp: boolean = false;
  mostrarInfoCliente: boolean = false;
  mostrarMetodoPago: boolean = false;
  WhatsappRecordatorio: boolean = false;
  usoBono: boolean = false;
  pestanaSeleccionada: number = 0;
  pestanaActiva: boolean = false;
  metodosPago: string[] = [];
  mensajeWsspEmpresa: string = '';
  mensajeRecordatorioWssp: string = '';
  esSedePrincipal: boolean = false;
  idSedeSeleccionada: number = 0;

  constructor(
    private router: Router,
    private agendamientoServices: AgendamientoService,
    private sharedServices: SharedService,
    private cdr: ChangeDetectorRef,
    private modalService: Modal,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private route: ActivatedRoute
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

        this.obtenerBloqueos();
      }

    });

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
    this.empresaServicio = this.empresa.servicio;
    this.empresaOrden = this.empresa.ordenes;
    this.empresaRecursoMultiple = this.empresa.recursoMultiple;
    this.empresaNormal = !this.empresaServicio && !this.empresaOrden && !this.empresaRecursoMultiple;
    this.tipoOrden = this.empresa.ordenes;
    this.rol = this.user.rol;
    this.consultarCitas(this.user, this.empresa, this.day);
    this.estadoActivoInactivo();
    this.obtenerRangoParametrizado();
    this.obtenerMetodosPago();
    this.obtenerMensajesWssp();
    this.obtenerServicios(this.idEmpresa);
    this.rolesPermitidos = [RolesContent.Empleado, RolesContent.Administrador];
    this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    this.obtenerBloqueos();
    this.consultarInfoCliente();
    this.route.queryParams.subscribe(params => {

      if (params['tab'] !== undefined) {
        const tab = Number(params['tab']);
        this.pestanaSeleccionada = tab;
        this.pestanaActiva = tab === 1;

        this.onTabChange(tab);
        this.finalizarAgenda();
      }

    });
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.rangoTiempo = rest.datos.find(
            (h: any) => h.tipo === this.tipoRangoTiempo,
          ).valor;
          this.enviarMjsWssp =
            rest.datos.find((h: any) => h.tipo === 'WhatsappRecurso')
              ?.valor?.toLowerCase() === 'true';

          this.mostrarInfoCliente =
            rest.datos.find((h: any) => h.tipo === 'MostrarInfoCliente')
              ?.valor?.toLowerCase() === 'true';

          this.usoBono =
            rest.datos.find((h: any) => h.tipo === 'UsoBono')
              ?.valor?.toLowerCase() === 'true';

          this.mostrarMetodoPago =
            rest.datos.find((h: any) => h.tipo === 'MostrarMetodoPago')
              ?.valor?.toLowerCase() === 'true';

          this.WhatsappRecordatorio =
            rest.datos.find((h: any) => h.tipo === 'WhatsappRecordatorio')
              ?.valor?.toLowerCase() === 'true';

        }
      },
    });
  }

  private obtenerMetodosPago(): void {
    this.sharedServices.metodosPago(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.metodosPago = (rest.datos || []).map((m: any) => m.nombre);
        }
      },
    });
  }

  private obtenerMensajesWssp(): void {
    this.sharedServices.mensajesWhatsApp(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.mensajeWsspEmpresa = rest.datos.find((h: any) => h.tipo === 'WhatsappRecurso').mensaje;
          this.mensajeRecordatorioWssp = rest.datos.find((h: any) => h.tipo === 'WhatsappRecordatorio').mensaje;
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
    this.consultarHorariosOcupadosRecurso(this.day);
    this.mostrarAgenda = true;
    this.cdr.detectChanges();
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some((s) => s.id === servicio.id);
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.serviciosFiltrados = [...rest.datos];
          if (this.empresaRecursoMultiple || this.empresa.id == 14) {
            this.serviciosFiltrados = this.serviciosFiltrados.filter(
              (s) => s.recurso === this.user.id
            );
          } else {
            this.serviciosFiltrados = this.serviciosFiltrados.filter(
              (s) => s.sede === this.user.sede,
            );
          }

          this.servicios = this.serviciosFiltrados;
          this.loading = false;
        } else {
          this.servicios = [];
          this.serviciosFiltrados = [];
        }
      },
      error: (err) => {
        this.servicios = [];
        this.serviciosFiltrados = [];
      }
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
          if (this.empresaServicio) {
            this.loading = false;
          }
          this.consultarHorariosOcupadosRecurso(this.day);
        } else {
          this.seleccionarRecurso(this.day);
        }
        this.cdr.detectChanges();
      },
    });
  }

  consultarHorariosOcupadosRecurso(fecha: Date): void {
    let request: any = {}

    if (this.empresaServicio) {
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
          this.cdr.detectChanges();
        },
      });
  }

  public seleccionarRecurso(fecha: Date): void {
    const request: any = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
    };

    if (!this.empresaServicio) {
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

    if (!this.empresaServicio) {
      request.recurso = user.id;
    }

    this.agendamientoServices.consultarCitasRecurso(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.ordenCitas(rest.datos);
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

  private ordenCitas(citas: any) {
    if (this.empresaServicio) {
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
          fechaInicio: fecha,
          padre: item.padre
        };
      })
      .sort((a, b) => a.fechaOrden - b.fechaOrden);

    this.citasHoy = resultado
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
      telefonoBreB = '3174764472';
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

  public confirmarCita(cita: any) {
    const nombreMostrar = this.empresaServicio
      ? cita.nombreCliente.split('-')[0].trim()
      : cita.nombreCliente;
    let fidelidadHtml = '';

    if (cita.fidelidad && cita.fidelidad.trim() !== '') {
      fidelidadHtml = `
          <div style="
            margin: 15px 0;
            padding: 12px;
            border-radius: 8px;
            background-color: #fff8e1;
            border: 1px solid #ffe082;
            text-align: center;
          ">
            <div style="
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 5px;
            ">
              🎁 Beneficio de fidelidad
            </div>

            <div style="
              font-size: 14px;
            ">
              ${cita.fidelidad}
            </div>
          </div>
        `;
    }

    let checkboxHtml = '';

    if (this.usoBono) {
      if (this.empresaOrden) {
        checkboxHtml = `
        <div style="
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        ">

          <label style="
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <input type="checkbox" id="clienteTieneDescuento">
            ¿El cliente pagará un valor diferente al precio del servicio?
          </label>

          <div id="valorPersonalizadoContainer" style="
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          ">

            <label style="
              font-size: 16px;
              font-weight: 600;
            ">
              💰 Digita el valor que se cobrará:
            </label>

            <input
              type="number"
              id="valorServicioInput"
              placeholder="Ej: 50000"
              min="0"
              style="
                width: 180px;
                padding: 8px;
                font-size: 16px;
                text-align: center;
                border: 1px solid #ccc;
                border-radius: 6px;
              "
            >

          </div>
        </div>
      `;
      } else {
        checkboxHtml = `
        <div style="
          margin-top: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        ">
          <label style="
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <input type="checkbox" id="usoBonoCheckbox">
            ¿El servicio incluye bono?
          </label>
        </div>
      `;
      }
    }

    const metodosPagoHtml = this.mostrarMetodoPago ? `
    <div style="
      margin-top: 15px;
      text-align: center;
    ">

      <p style="
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 8px;
      ">
        Método de pago
      </p>

      <div style="
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        gap: 12px;
        width: 100%;
        overflow-x: auto;
      ">

        ${this.metodosPago.map((metodo, index) => `
          <label style="
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
          ">

            <input
              type="checkbox"
              class="metodo-pago-checkbox"
              value="${metodo}"
              id="metodoPago_${index}"
            >

            <span>${metodo}</span>

          </label>
        `).join('')}

      </div>

    </div>
  ` : '';

    Swal.fire({
      title: 'Confirmar Asistencia',
      html: `
        ${fidelidadHtml}

        ${checkboxHtml}

        <p style="margin-top: 10px;">
          ¿El cliente
          <strong>${nombreMostrar}</strong>
          asistió a la cita?
        </p>

        ${metodosPagoHtml}
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
      didOpen: () => {
        if (this.usoBono && this.empresaOrden) {
          const checkboxDescuento =
            document.getElementById(
              'clienteTieneDescuento'
            ) as HTMLInputElement;

          const valorContainer =
            document.getElementById(
              'valorPersonalizadoContainer'
            ) as HTMLDivElement;

          checkboxDescuento?.addEventListener(
            'change',
            () => {
              if (checkboxDescuento.checked) {
                valorContainer.style.display = 'flex';
              } else {
                valorContainer.style.display = 'none';
                const input =
                  document.getElementById(
                    'valorServicioInput'
                  ) as HTMLInputElement;

                if (input) {
                  input.value = '';
                }
              }

            }
          );
        }

        const checkboxes = document.querySelectorAll(
          '.metodo-pago-checkbox'
        ) as NodeListOf<HTMLInputElement>;

        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              checkboxes.forEach((otro) => {
                if (otro !== checkbox) {
                  otro.checked = false;
                }
              });
            }
          });
        });
      },
      preConfirm: () => {
        let usoBono = false;
        let valorServicio: number | null = null;
        if (this.usoBono) {
          if (this.empresaOrden) {
            const checkboxDescuento =
              document.getElementById(
                'clienteTieneDescuento'
              ) as HTMLInputElement;

            const tieneValorDiferente =
              checkboxDescuento?.checked || false;

            if (tieneValorDiferente) {

              const input =
                document.getElementById(
                  'valorServicioInput'
                ) as HTMLInputElement;

              valorServicio = Number(input?.value || 0);
              if (!valorServicio || valorServicio <= 0) {
                Swal.showValidationMessage(
                  'Digita un valor válido para el servicio'
                );
                return false;
              }
            }
            usoBono = true;
          } else {
            usoBono =
              (
                document.getElementById(
                  'usoBonoCheckbox'
                ) as HTMLInputElement
              )?.checked || false;
          }
        }

        let metodoPago = null;

        if (this.mostrarMetodoPago) {
          const checkboxes = document.querySelectorAll(
            '.metodo-pago-checkbox:checked'
          ) as NodeListOf<HTMLInputElement>;

          if (checkboxes.length === 0) {
            Swal.showValidationMessage(
              'Selecciona un método de pago'
            );

            return false;
          }
          metodoPago = checkboxes[0].value;
        }

        return {
          usoBono,
          valorServicio,
          metodoPago
        };
      }
    }).then((result) => {
      if (
        result.isConfirmed ||
        result.dismiss === Swal.DismissReason.cancel
      ) {
        this.loading = true;
        const now = new Date(this.day);
        const fechaLocal =
          this.formatearFechaManual(now);
        const request: any = {
          empresa: JSON.parse(
            localStorage.getItem('empresa') || '{}'
          ).id,
          Id: cita.id,
          Asistencia: result.isConfirmed,
          Bono: result.value?.usoBono || false,
          Valor:
            result.value?.valorServicio || null,
          MetodoPago: result.isConfirmed
            ? result.value?.metodoPago || null
            : null,
          usuarioCreacion:
            this.user.id.toString(),
          fechaCreacion:
            this.formatearFechaActual()
        };

        this.agendamientoServices
          .ConfirmarAsitenciaCita(request)
          .subscribe({
            next: (rest) => {
              this.consultarCitas(
                this.user,
                this.empresa,
                new Date(fechaLocal)
              );
            },
            error: (err) => {
              this.modalService.error(
                err.error.mensaje
              );
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
        this.consultarCitas(this.user, this.empresa, this.day);
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

  private agendar(hora: any, bono: boolean, result: any): void {
    const request = this.createJson(hora, bono, result);
    const mensaje = this.construirMensajeWhatsApp(request, result);
    const observable = this.guardarCita(request);
    observable.subscribe({
      next: (rest: any) => this.procesarRespuestaAgendamiento(rest, request, mensaje, result),
      error: (err: any) => this.manejarErrorAgendamiento(err),
    });
  }

  /**
   * Construye el mensaje que se enviará por WhatsApp
   */
  private construirMensajeWhatsApp(request: any, result: any): string {
    const fecha = new Date(request?.FechaIni);

    const fechaFormateada = fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    const horaFormateada = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const servicio = this.obtenerServiciosTexto();

    const nombreCliente = this.pestanaActiva
      ? JSON.parse(localStorage.getItem('ordenSeleccionada') || '{}').nombreCLiente
      : result.nombre;

    let mensaje = this.mensajeWsspEmpresa || '';

    mensaje = mensaje
      .replace(/\$\{nombreCliente\}/g, nombreCliente || '')
      .replace(/\$\{empresaNombre\}/g, this.empresa.nombre || '')
      .replace(/\$\{fechaFormateada\}/g, fechaFormateada)
      .replace(/\$\{horaFormateada\}/g, horaFormateada)
      .replace(/\$\{servicio\}/g, servicio || '');

    return mensaje
      .replace(/\\r\\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Obtiene los servicios seleccionados en formato legible
   */
  private obtenerServiciosTexto(): string {
    return this.serviciosSeleccionados
      .map(s => s.nombre)
      .join(", ")
      .replace(/,([^,]*)$/, " y$1");
  }

  /**
   * Determina qué servicio debe utilizarse para guardar la cita
   */
  private guardarCita(request: any): any {
    if (this.tipoOrden) {
      if (this.pestanaActiva) {
        return this.agendamientoServices.guardarCitaSesionOrden(request);
      } else {
        return this.agendamientoServices.guardarCitaSesion(request);
      }
    }

    return this.empresaServicio || this.empresaRecursoMultiple
      ? this.agendamientoServices.guardarCita(request)
      : this.agendamientoServices.registrarCita(request);
  }

  /**
   * Procesa la respuesta del servidor
   */
  private procesarRespuestaAgendamiento(
    rest: any,
    request: any,
    mensaje: string,
    result: any
  ): void {

    if (!rest.exito && !this.empresaServicio) {
      this.modalService.error(rest.mensaje || "Error de servidor");
      this.loading = false;
      return;
    }

    this.modalService.success(
      rest.mensaje || "La cita fue creada exitosamente",
      () => {
        this.serviciosSeleccionados = [];
        this.mostrarAgenda = false;
        this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
      }
    );

    this.enviarWhatsApp(mensaje, result);

    this.loading = false;
  }

  /**
   * Envía el mensaje de confirmación por WhatsApp
   */
  private enviarWhatsApp(mensaje: string, result: any): void {
    if (!this.enviarMjsWssp) {
      return;
    }

    const numero = `57${result.celular}`;

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

  /**
   * Maneja errores de la petición
   */
  private manejarErrorAgendamiento(err: any): void {
    this.modalService.error(err.statusText || "Error al agendar la cita");
    this.loading = false;
    this.cdr.detectChanges();
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
    let horaDiponible = this.validarHoraDisponible(hora.hora);
    this.cruzeHorario = horaDiponible.disponible;

    if (horaDiponible.disponible) {
      this.agendarCita(hora);
    } else {
      if (this.empresaServicio) {
        Swal.fire({
          icon: 'warning',
          title: 'Conflicto de horario',
          text: 'Ya tienes un servicio agendado en este rango de tiempo y el nuevo agendamiento se cruza con dicho horario. ¿Estás seguro que deseas continuar?',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            this.agendarCita(hora)
          } else {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Horario no disponible',
          html: `
              <p>La duración de la cita supera el horario disponible.</p>
              <p>
                El horario de las <strong>${horaDiponible.horaConflicto}</strong>
                ya se encuentra ocupado.
              </p>
              <p>Por favor, selecciona una hora diferente.</p>
            `,
          confirmButtonText: 'Entendido'
        });
        this.loading = false;
      }
    }
  }

  private solicitarCliente(hora: any, Bono: boolean): void {
    const fechaFormateada = this.day.toLocaleDateString('es-CO', {
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
      width: '460px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'reserva-dialog-panel',
      data: {
        fecha: fechaFormateada,
        hora: hora.hora,
        costo: costoFormateado,
        idEmpresa: this.idEmpresa
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
        if (result.fechaNacimiento === '') {
          const hoy = new Date();
          result.fechaNacimiento = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T05:00:00`;
        }
        this.agendar(hora.hora, Bono, result);
      } else {
        this.loading = false;
      }
    });
  }




  private solicitarUsoBono(hora: any): void {
    const sedes = (this.empresa?.sedes || []).filter(
      (sede: any) => sede.id !== this.user.sede
    );

    const opcionesSedes = sedes.map((sede: any) =>
      `<option value="${sede.id}">${sede.nombre}</option>`
    ).join('');

    Swal.fire({
      title: 'Cita',
      html: `
      <div style="margin-top:15px;">

        <!-- USO DEL BONO -->
        <div style="display:flex;justify-content:center;align-items:center;">
          <label style="font-size:16px;cursor:pointer;display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="usoBonoCheckbox">
            ¿El servicio incluye bono?
          </label>
        </div>

        <hr style="margin:20px 0;border-color:#eee;">

        <!-- PREGUNTA SEDE PRIMARIA -->
        <div style="margin-top:15px;text-align:left;">

          <label style="font-size:15px;font-weight:600;">
            ¿La cita se realizó en su sede primaria?
          </label>

          <div style="display:flex;justify-content:center;gap:35px;margin-top:15px;">

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
              <input type="radio" name="sedePrincipal" value="si" checked>
              Sí
            </label>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
              <input type="radio" name="sedePrincipal" value="no">
              No
            </label>

          </div>

          <!-- LISTADO DE SEDES -->
          <div id="contenedorSedes" style="display:none;margin-top:20px;">

            <label style="font-size:14px;font-weight:600;">
              Selecciona la sede:
            </label>

            <select id="sedeSeleccionada" class="swal2-select"
              style="width:100%;margin:10px 0;">
              <option value="">Seleccionar sede</option>
              ${opcionesSedes}
            </select>

          </div>

        </div>

      </div>
    `,

      icon: 'success',
      showCloseButton: true,
      confirmButtonColor: '#3085d6',

      didOpen: () => {
        const radios = document.querySelectorAll<HTMLInputElement>(
          'input[name="sedePrincipal"]'
        );
        const contenedorSedes = document.getElementById('contenedorSedes');
        radios.forEach(radio => {
          radio.addEventListener('change', () => {
            contenedorSedes!.style.display =
              radio.value === 'no' && radio.checked ? 'block' : 'none';
          });

        });
      },

      preConfirm: () => {

        const usoBono = (
          document.getElementById('usoBonoCheckbox') as HTMLInputElement
        ).checked;

        const esSedePrincipal = (
          document.querySelector(
            'input[name="sedePrincipal"]:checked'
          ) as HTMLInputElement
        ).value === 'si';

        const sedeSeleccionada = (
          document.getElementById('sedeSeleccionada') as HTMLSelectElement
        ).value;

        // Validar selección de sede
        if (!esSedePrincipal && !sedeSeleccionada) {

          Swal.showValidationMessage(
            'Por favor selecciona la sede donde se realizó la cita.'
          );

          return false;
        }

        return {
          usoBono,
          esSedePrincipal,
          idSede: esSedePrincipal ? 0 : Number(sedeSeleccionada)
        };

      }

    }).then((result) => {

      // Cerrar modal
      if (result.dismiss === Swal.DismissReason.close) {
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      if (!result.isConfirmed) {
        return;
      }

      this.loading = true;
      const usoBono = result.value?.usoBono ?? false;
      const idSede = result.value?.idSede ?? 0;
      const esSedePrincipal = result.value?.esSedePrincipal ?? true;

      this.esSedePrincipal = esSedePrincipal;
      this.idSedeSeleccionada = idSede;

      if (this.mostrarInfoCliente) {
        this.solicitarCliente(hora, usoBono);
      } else {
        this.agendar(hora.hora, usoBono, '');
      }
    });
  }




  private agendarCita(hora: any): void {
    if (this.pestanaActiva) {
      this.loading = true;
      this.agendar(hora.hora, false, '');
    } else {
      if (this.usoBono) {
        this.solicitarUsoBono(hora);
        return;
      }
      if (this.mostrarInfoCliente) {
        this.solicitarCliente(hora, false);
      } else {
        this.loading = true;
        this.agendar(hora.hora, false, '',);
      }
    }
  }

  private validarHoraDisponible(hora: string): {
    disponible: boolean;
    horaConflicto: string | null;
  } {
    const loteHoras =
      this.serviciosSeleccionados.reduce(
        (acc, item) => acc + item.tiempo,
        0
      ) / parseInt(this.rangoTiempo);

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
      const nuevaHora = new Date(
        horaBase.getTime() + i * rangoMinutos * 60000
      );

      horasGeneradas.push(formatHora(nuevaHora));
    }

    if (this.idEmpresa === 12) {
      let horas = [...this.horas];
      horasGeneradas.forEach(horaGenerada => {

        const [hora, periodo] = horaGenerada.split(' ');
        const [h, m] = hora.split(':');

        const hora24 = (parseInt(h) % 12) + (periodo === 'PM' ? 12 : 0);

        // Solo horas posteriores a las 7:00 PM
        if (hora24 * 60 + parseInt(m) > 19 * 60) {

          if (!horas.some(h => h.hora === horaGenerada)) {
            horas.push({
              hora: horaGenerada,
              disponible: true
            });
          }

        }

      });
      const horaConflicto = horasGeneradas.find(
        (h) => !horas.some((x) => x.hora === h)
      );

      if (horaConflicto) {
        return {
          disponible: false,
          horaConflicto: horaConflicto
        };
      }
    } else {
      // Buscar la primera hora que no está disponible
      const horaConflicto = horasGeneradas.find(
        (h) => !this.horas.some((x) => x.hora === h)
      );

      if (horaConflicto) {
        return {
          disponible: false,
          horaConflicto: horaConflicto
        };
      }
    }

    return {
      disponible: true,
      horaConflicto: null
    };
  }

  onDateChange(event: any, cita: any) {
    const fecha = event.value;

    if (!fecha) return;

    this.day = fecha; // 👈 actualizas tu variable actual
    if (cita) {
      this.consultarCitas(this.user, this.empresa, fecha);
    } else {
      this.loading = true;
      this.obtenerHorarios(this.rolesPermitidos.includes(this.rol));
    }
    this.cdr.detectChanges();
  }

  obtenerFechaIni(hora: any) {
    const match = hora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    let horas = parseInt(match[1], 10);
    const minutos = match[2];
    const periodo = match[3].toUpperCase();

    // Convertir a formato militar
    if (periodo === 'PM' && horas !== 12) {
      horas += 12;
    }

    if (periodo === 'AM' && horas === 12) {
      horas = 0;
    }

    const year = this.day.getFullYear();
    const month = String(this.day.getMonth() + 1).padStart(2, '0');
    const day = String(this.day.getDate()).padStart(2, '0');

    const fechaBase = `${year}-${month}-${day}`;
    const horasStr = String(horas).padStart(2, '0');

    return `${fechaBase}T${horasStr}:${minutos}:00`;
  }

  private createJson(hora: string, bono: boolean, result: any) {
    const fechaFinal = this.obtenerFechaIni(hora);
    const valor = this.serviciosSeleccionados.map((s) => s.valor);
    let tiempoTotalServicio = this.serviciosSeleccionados
      .map((s) => s.tiempo)
      .reduce((a, b) => a + b, 0);
    const serviciosSeleccionados = this.serviciosSeleccionados.map((s) => ({
      servicio: s.id,
    }));

    const costo = valor.reduce((a, b) => a + b, 0);
    const now = new Date();
    const fechaLocal = this.formatearFechaManual(now);
    let json = {};

    if (this.empresaServicio || this.empresaRecursoMultiple) {
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

      if (this.empresaRecursoMultiple) {

        const formatearFecha = (fecha: Date): string => {
          const año = fecha.getFullYear();
          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
          const dia = String(fecha.getDate()).padStart(2, '0');
          const hora = String(fecha.getHours()).padStart(2, '0');
          const minutos = String(fecha.getMinutes()).padStart(2, '0');
          const segundos = String(fecha.getSeconds()).padStart(2, '0');

          return `${año}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
        };
        const agrupados = Object.values(
          this.serviciosSeleccionados.reduce((acc: any, element: any) => {

            if (!acc[element.recurso]) {
              acc[element.recurso] = {
                FechaIni: fechaFinal,
                recurso: element.recurso,
                validaciones: element.validaciones,
                Hora: 0,
                Valor: 0,
                servicios: []
              };
            }

            acc[element.recurso].Hora += element.tiempo;
            acc[element.recurso].Valor += Number(element.valor);
            acc[element.recurso].servicios.push({
              servicio: element.id
            });

            return acc;

          }, {})
        ).sort((a: any, b: any) =>
          Number(a.validaciones) - Number(b.validaciones)
        );

        let fechaInicio = new Date(fechaFinal);

        agrupados.forEach((item: any) => {
          item.FechaIni = formatearFecha(fechaInicio);
          fechaInicio = new Date(
            fechaInicio.getTime() + item.Hora * 60000
          );
        });

        json = {
          FechaIni: fechaFinal,
          empresa: this.idEmpresa,
          UsuarioCreacion: 'Cliente',
          fechaCreacion: fechaLocal,
          clienteInfo: {
            Nombre: result.nombre,
            Telefono: result.celular,
            Correo: result.correo,
            FechaNacimiento: result.fechaNacimiento,
          },
          citas: agrupados,
          validaHorario: true
        }
        return json;
      } else {

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
          citas: resultadoAlterno,
          validaHorario: this.cruzeHorario
        }
        return json;
      }
    } else {
      if (this.tipoOrden) {
        let servicios = this.serviciosSeleccionados.map((s) => ({
          servicio: s.id,
          cantidad: s.sesiones
        }));
        const info = JSON.parse(localStorage.getItem('ordenSeleccionada') || '{}');

        if (this.pestanaActiva) {
          if (this.serviciosSeleccionados.length === 0) {
            tiempoTotalServicio = this.servicios.find(s => s.id === info.servicioSeleccionado)?.tiempo ?? 0;
          }

          json = {
            recurso: this.user.id,
            FechaIni: fechaFinal,
            Valor: 0,
            UsuarioCreacion: 'Usuario',
            Hora: tiempoTotalServicio === 0 ? 30 : tiempoTotalServicio,
            empresa: this.idEmpresa,
            clienteInfo: {
              Id: info.idCliente
            },
            fechaCreacion: fechaLocal,
            Bono: bono,
            orden: {
              Id: info.idOrden
            },
            Sesion: info.numeroSesion
          };
        } else {
          json = {
            recurso: this.user.id,
            FechaIni: fechaFinal,
            Valor: this.otroSeleccionado ? this.costoOtro : costo,
            UsuarioCreacion: 'Usuario',
            Hora: tiempoTotalServicio === 0 ? 30 : tiempoTotalServicio,
            empresa: this.idEmpresa,
            servicios: servicios,
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
        }
      } else {
        json = {
          recurso: this.user.id,
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
          Bono: bono,
          ...(!this.esSedePrincipal && {
            sede: this.idSedeSeleccionada
          })
        };
      }
      return json;
    }
  }

  onTabChange(event: any) {
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
