import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ChangeDetectorRef, Component, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedService } from '../../../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ReservaDialog } from '../../reserva-dialog/reserva-dialog';
import { ClienteService } from '../../../services/cliente.service';
import { Modal } from '../../../shared/services/modal';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ValidarVersion } from '../../../shared/validar-version/validar-version';
import { environment } from '../../../../environments/environment';
import { Profesionales } from '../../profesionales/profesionales';
import { PromocionesService } from '../../promociones/promociones.services';

registerLocaleData(localeEs);

@Component({
  selector: 'app-cliente-agendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatCardModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    ValidarVersion,
    Profesionales
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css',
})
export class ClienteAgendar {
  viewDate: Date = new Date();
  nombreDelRecurso: string = '';
  serviciosFiltrados: any[] = [];
  servicios: any[] = [];
  serviciosSeleccionados: any[] = [];
  idEmpresa: number = 0;
  horaInicioServicios: number = 0;
  horaFinServicios: number = 0;
  horas: { hora: string; disponible: boolean }[] = [];
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  mostrarDisponibilidad: boolean = false;
  costo: number = 0;
  idRecurso: number = 0;
  fotoRecurso: string = '';
  loading: boolean = true;
  mostrarServicios: boolean = false;
  mensajeError: string = '';
  inactiva: boolean = false;
  clientesEmpresa: any[] = [];
  empresaLogo: string = '';
  empresaNombre: any = '';
  recursoSede: any;
  recursoId: any;
  rangoTiempo: string = '';
  tipoRangoTiempo: string = 'Tiempo_Agenda';
  empresaServicio: boolean = false;
  empresaOrden: boolean = false;
  empresaRecursoMultiple: boolean = false;
  empresaNormal: boolean = false;
  busqueda: string = '';
  esMobile = window.innerWidth < 768;
  enviarMjsWssp: boolean = false;
  EnvioMensajeEmpresa: boolean = false;
  telefonoRecurso: string = '';
  telefonoEmpresa: string = '';
  ultimoHorarioJornada: any;
  currentYear: number = new Date().getFullYear();
  serviciosEmpresaRecursoMultiple: any[] = [];
  recursosEmpresa: any[] = [];
  recursosSeleccionados: any[] = [];
  gruposRecursos: any[] = [];
  mostrarModalRecursos = false;
  version = environment.version;
  sedeSeleccionada: any = {};
  idSedeSeleccoinada: number = 0;
  mostrarRecursos: boolean = false;
  recursosList: any[] = [];
  mostrarInfoRecursos: boolean = false;
  mensajeWsspEmpresa: string = '';
  AgendarDespues: boolean = false;
  TiempoAgendaDespues: number = 0;
  MostrarAgendaCualquiera: boolean = false;
  seleccionoCualquiera: boolean = false;
  btnPromociones: boolean = false;
  tituloBtnPromo: string = '';
  subTituloBtnPromo: string = '';
  promociones: any[] = [];
  promocionSeleccionada: any = null;

  constructor(
    private sharedServices: SharedService,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private modalService: Modal,
    private promoService: PromocionesService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.idEmpresa = +params['emp'];
    });
    this.route.queryParams.subscribe((params) => {
      this.idRecurso = +params['rcr'];
    });
    this.validarPromociones();
    this.obtenerRangoParametrizado();
    this.obtenerMensajesCliente();
    this.obtenerEmpresas();
    this.consultarInfoCliente();
  }

  private validarPromociones(): void {
    this.promoService.gestionarPromociones(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.btnPromociones = rest.datos.some(
            (item: any) => item.estado?.toLowerCase() === 'activo'
          );
          this.promociones = rest.datos;
        } else {
          this.btnPromociones = false;
        }
      },
      error: (err) => {
        this.btnPromociones = false;
      }
    })
  }

  private obtenerMensajesCliente(): void {
    this.sharedServices.mensajesWhatsApp(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.mensajeWsspEmpresa = rest.datos.find((h: any) => h.tipo === 'WhatsappCliente').mensaje;
        }
      },
    });
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.rangoTiempo = rest.datos.find(
            (h: any) => h.tipo === this.tipoRangoTiempo
          ).valor;
          this.enviarMjsWssp =
            rest.datos.find((h: any) => h.tipo === 'WhatsappCliente')
              ?.valor?.toLowerCase() === 'true';

          this.EnvioMensajeEmpresa =
            rest.datos.find((h: any) => h.tipo === 'EnvioMensajeEmpresa')
              ?.valor?.toLowerCase() === 'true';

          this.AgendarDespues =
            rest.datos.find((h: any) => h.tipo === 'AgendarDespues')
              ?.valor?.toLowerCase() === 'true';

          this.MostrarAgendaCualquiera =
            rest.datos.find((h: any) => h.tipo === 'MostrarAgendaCualquiera')
              ?.valor?.toLowerCase() === 'true';

          const tiempoAgenda = rest.datos.find(
            (h: any) =>
              h.tipo === 'TiempoAgendaDespues' &&
              h.estado === true
          );

          this.TiempoAgendaDespues = tiempoAgenda
            ? Number(tiempoAgenda.valor)
            : 0;

          const botonPromociones = rest.datos.find((h: any) => h.tipo === 'NombreBotonPromocion');

          if (botonPromociones) {
            this.tituloBtnPromo = botonPromociones.valor.split('/')[0].trim();
            this.subTituloBtnPromo = botonPromociones.valor.split('/')[1].trim();
          }
        }
      },
    });
  }

  public irAReservar(event: any) {
    this.loading = true;
    if (event.cualquierPf) {
      const hora = {
        disponible: true,
        fecha: this.viewDate,
        hora: ''
      }
      this.seleccionoCualquiera = true;
      this.llamarModalRegistroCliente(hora);
    } else {
      this.mostrarRecursos = false;
      this.mostrarServicios = false;
      this.mostrarInfoRecursos = true;
      this.recursoId = event.id;
      this.idRecurso = this.recursoId;
      this.seleccionoCualquiera = false;

      const totalServicios = this.serviciosSeleccionados.reduce(
        (total: number, s: any) => total + Number(s.valor || 0),
        0
      );

      this.recursosSeleccionados = this.recursosSeleccionados
        .filter((r: any) => r.id === this.recursoId)
        .map((r: any) => ({
          ...r,
          detalles: this.serviciosSeleccionados.map((s: any) => s.nombre),
          totalServicios
        }));

      this.obtenerHorarios(true);
    }
    this.cdr.detectChanges();
  }

  public cambiarSede() {
    console.log();

  }

  private obtenerEmpresas() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa: any = rest.datos.find((em) => em.id === this.idEmpresa);
          const sedeSeleccionada: any = JSON.parse(localStorage.getItem('sedeSeleccionada') || '{}');
          this.idSedeSeleccoinada = sedeSeleccionada.id;
          this.sedeSeleccionada = sedeSeleccionada.nombre;
          this.empresaLogo = 'assets/img/' + empresa?.logo;
          this.empresaNombre = empresa?.nombre;
          this.empresaServicio = empresa.servicio;
          this.empresaOrden = empresa.ordenes;
          this.empresaRecursoMultiple = empresa.recursoMultiple;
          this.empresaNormal = !this.empresaServicio && !this.empresaOrden && !this.empresaRecursoMultiple;
          this.telefonoEmpresa = sedeSeleccionada.telefono;
          this.aplicarEstilosEmpresa(empresa.apariencia);
          localStorage.setItem('empresa', JSON.stringify(empresa));
          this.obtenerRecursos();
        } else {
          this.inactiva = true;
        }
      },
    });
  }

  private aplicarEstilosEmpresa(apariencia: any): void {

    if (!apariencia) {
      return;
    }

    const root = document.documentElement;

    // Fuente
    root.style.setProperty(
      '--app-font-family',
      apariencia.tipoLetra || 'Roboto'
    );

    // Color general de textos
    root.style.setProperty(
      '--app-text',
      apariencia.colorLetra || '#212121'
    );

    // Fondo general
    root.style.setProperty(
      '--app-background',
      apariencia.colorFondo || '#FFFFFF'
    );

    // Color de fondo de la cabecera
    root.style.setProperty(
      '--app-header',
      apariencia.colorCabecera || '#424242'
    );

    // Color de texto de la cabecera
    root.style.setProperty(
      '--app-header-text',
      apariencia.colorLetraCabecera || '#FFFFFF'
    );

    // Color de fondo del pie de página
    root.style.setProperty(
      '--app-footer',
      apariencia.colorPiePagina || '#424242'
    );

    // Color de texto del pie de página
    root.style.setProperty(
      '--app-footer-text',
      apariencia.colorLetraPiePagina || '#FFFFFF'
    );
  }

  private obtenerRecursos(): void {
    this.sharedServices.obtenerRecursosAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          let recurso = rest.datos;
          this.recursosEmpresa = recurso.usuario;
          let recursoSeleccionado: any;

          if (this.empresaServicio || this.empresaRecursoMultiple) {
            recursoSeleccionado = recurso.usuario[0];
            recurso = recurso.usuario[0].sede;

            this.recursoSede = recursoSeleccionado.sede;
            this.fotoRecurso = recursoSeleccionado.foto;
            this.nombreDelRecurso = recursoSeleccionado.nombre;
            this.recursoSede = recursoSeleccionado.sede;

            this.recursosSeleccionados.push({
              id: 0,
              nombre: this.empresaNombre,
              foto: this.empresaLogo,
              detalles: []
            })
          } else {
            recurso = recurso.usuario.find(
              (r: any) => r.id === this.idRecurso
            );
          }

          // if (this.EnvioMensajeEmpresa) {
          //   this.telefonoRecurso = this.telefonoEmpresa;
          // } else {
          //   this.telefonoRecurso = recurso.telefono;
          // }
          this.obtenerServicios(this.idEmpresa);
          localStorage.setItem('recurso', JSON.stringify(recurso));
        }
      },
    });
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        if (rest.exito) {
          if (this.empresaRecursoMultiple) {
            this.serviciosFiltrados = Array.from(
              new Map(
                rest.datos
                  .filter(
                    (s: any) =>
                      s.sede === this.recursoSede &&
                      s.cliente === true
                  )
                  .map((s: any) => [s.id, s])
              ).values()
            );
            this.serviciosEmpresaRecursoMultiple = rest.datos;
          } else {
            this.serviciosFiltrados = rest.datos.filter(
              (s: any) =>
                s.sede === this.idSedeSeleccoinada &&
                s.cliente === true &&
                s.nombre !== 'Otro'
            );
          }

          this.mostrarServicios = true;
          this.servicios = this.serviciosFiltrados;
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
      },
      error: (err) => {
        console.error('Error al obtener servicios:', err);
        this.loading = false;
      },
    });
  }

  public obtenerHorarios(consultarRecursosAgenda: boolean): void {
    this.sharedServices.obtenerAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          const respuesta = rest.datos;
          this.horas = respuesta.map(
            (h: { valor: string; estado: boolean }) => {
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
            }
          );
          this.ultimoHorarioJornada = this.horas[this.horas.length - 1].hora;
          if (consultarRecursosAgenda) {
            this.consultarHorariosOcupadosRecurso(this.viewDate);
          }
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
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

  private verificarHoras(): void {
    const ahora = new Date();
    const fechaSeleccionada = this.viewDate;

    const esHoy = this.esHoy(fechaSeleccionada);

    const horasFuturas = this.horas
      .map((h) => ({
        ...h,
        fecha: this.convertirHoraAFecha(h.hora, fechaSeleccionada),
      }))
      .filter((h) => (esHoy ? h.fecha >= ahora : true));

    horasFuturas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const horasValidas = horasFuturas.filter((horaActual, index, array) => {
      const anterior = array[index - 1];
      const siguiente = array[index + 1];

      const tieneAnterior =
        anterior &&
        horaActual.fecha.getTime() - anterior.fecha.getTime() ===
        parseInt(this.rangoTiempo) * 60000;

      const tieneSiguiente =
        siguiente &&
        siguiente.fecha.getTime() - horaActual.fecha.getTime() ===
        parseInt(this.rangoTiempo) * 60000;

      return tieneAnterior || tieneSiguiente;
    });

    let horasFiltradas = [...horasValidas];

    if (this.AgendarDespues) {

      const minutosMinimos = Number(this.TiempoAgendaDespues) || 0;

      // Hora actual + minutos mínimos de anticipación
      const horaMinima = new Date();
      horaMinima.setMinutes(horaMinima.getMinutes() + minutosMinimos);

      horasFiltradas = horasValidas.filter((h: any) => {
        const fechaHora = new Date(h.fecha);

        return !isNaN(fechaHora.getTime()) && fechaHora.getTime() >= horaMinima.getTime();
      });
    }

    // Separar las horas después de aplicar el filtro
    this.horasAM = horasFiltradas.filter((h: any) => h.hora.includes('AM'));
    this.horasPM = horasFiltradas.filter((h: any) => h.hora.includes('PM'));
    this.loading = false;
    this.mostrarServicios = false;
    this.mostrarDisponibilidad = true;
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

  public volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa },
    });
  }

  public misCitas(): void {
    this.router.navigate(['/cliente/misCitas'], {
      queryParams: {
        emp: this.idEmpresa,
      },
    });
  }

  public validarVersionApp(callback: () => void): void {
    this.sharedServices.parametrosGenerales().subscribe({
      next: (rest) => {
        const parametroVersion: any = rest.datos.find(
          (v: any) => v.tipo === 'version'
        );

        const versionBd = parametroVersion?.valor || '';

        if (versionBd === this.version) {
          callback();
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Versión desactualizada',
            html: `
                <div style="font-size: 16px;">
                  Tu versión de la aplicación está desactualizada.
                  <br><br>
                  <strong>Actualizando...</strong>
                </div>
              `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            this.volver();
          });
        }
      },
      error: (error) => {
        this.modalService.error(error.mensaje);
      }
    });
  }

  filtrarServicios() {
    const texto = this.busqueda.toLowerCase();

    this.serviciosFiltrados = this.servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto)
    );
    this.cdr.detectChanges();
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some((s) => s.id === servicio.id);
  }

  toggleSeleccionServicio(servicio: any): void {
    if (this.estaSeleccionado(servicio)) {
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(
        (s) => s.id !== servicio.id
      );
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
    this.cdr.detectChanges();
  }

  reservarServicios(): void {
    this.btnPromociones = false;
    this.validarVersionApp(() => {
      this.loading = true;
      if (this.recursosSeleccionados.length > 0) {
        this.recursosSeleccionados[0].detalles =
          this.serviciosSeleccionados.map(
            (servicio: any) => servicio.nombre
          );
      }
      this.cdr.detectChanges();
      if (this.empresaRecursoMultiple) {
        this.obtenerHorarios(false);
        const serviciosConRecursos = this.serviciosSeleccionados.map((servicio: any) => {
          const recursos = this.serviciosEmpresaRecursoMultiple
            .filter(
              (item: any) => item.id === servicio.id
            )
            .map((item: any) => {
              const recursoEmpresa = this.recursosEmpresa.find(
                (recurso: any) => recurso.id === item.recurso
              );
              return {
                ...item,
                foto: recursoEmpresa?.foto
              };
            });

          return {
            id: servicio.id,
            nombre: servicio.nombre,
            recursos: recursos
          };

        });

        this.seleccionarRecursosModal(serviciosConRecursos);
      } else {
        this.recursosList = this.recursosEmpresa
          .filter((r: any) => r.sede === this.idSedeSeleccoinada)
          .map((r: any) => ({
            id: r.id,
            nombre: r.nombre,
            foto: r.foto,
            telefono: r.telefono,
            sede: this.sedeSeleccionada,
            cualquierPf: false
          }));

        if (this.MostrarAgendaCualquiera) {
          this.recursosList.unshift({
            id: 0,
            nombre: 'El primer profesional disponible',
            foto: 'assets/img/Sin_foto.jpg',
            telefono: '',
            sede: this.sedeSeleccionada,
            cualquierPf: true
          });
        }

        this.recursosSeleccionados = this.recursosList;
        this.loading = false;
        this.mostrarServicios = false;
        if (this.empresaServicio || this.empresaOrden) {
          this.mostrarDisponibilidad = true;
          this.mostrarInfoRecursos = true;
          this.recursoId = this.recursosSeleccionados[0].id;
          this.idRecurso = this.recursoId;
          if (this.empresaOrden) {
            this.recursosSeleccionados = this.recursosSeleccionados
              .filter((r: any) => r.id === this.recursoId)
              .map((r: any) => ({
                ...r,
                detalles: this.serviciosSeleccionados.map((s: any) => s.nombre)
              }));
          } else if (this.empresaServicio) {
            if (this.idEmpresa == 8) {
              this.recursosSeleccionados = this.recursosSeleccionados
                .filter((r: any) => r.id === this.idEmpresa)
                .map((r: any) => ({
                  ...r,
                  nombre: this.empresaNombre,
                  foto: this.empresaLogo,
                  detalles: this.serviciosSeleccionados.map((s: any) => s.nombre)
                }));
            }
            else {
              const recursoId = this.serviciosSeleccionados[0]?.recurso;

              this.recursosSeleccionados = this.recursosSeleccionados.filter(
                r => r.id === recursoId
              );
            }
          }
          this.obtenerHorarios(true);
        } else {
          this.mostrarRecursos = true;
          this.mostrarDisponibilidad = false;
        }
        this.cdr.detectChanges();
      }
    })
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  public consultarHorariosOcupadosRecurso(fecha: Date): void {
    let request = {}

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
      if (this.empresaRecursoMultiple) {
        const servicioPrioritario = this.serviciosSeleccionados.reduce(
          (menor: any, actual: any) =>
            Number(actual.validaciones) < Number(menor.validaciones)
              ? actual
              : menor
        );

        request = {
          empresa: this.idEmpresa,
          FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
          fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
          recurso: servicioPrioritario?.recurso
        };
      } else {
        request = {
          empresa: this.idEmpresa,
          FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
          fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
          recurso: this.recursoId,
        };
      }
    }

    if (this.recursosSeleccionados.length > 0) {
      this.agendaService.consultarAgendamientos(request).subscribe({
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
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }

  }

  public nextPeriod(): void {
    this.viewDate = new Date(this.viewDate);
    if (this.promocionSeleccionada) {
      const fechaFinal = new Date(this.viewDate);
      fechaFinal.setDate(fechaFinal.getDate() + 1);

      const fechaFinPromocion = new Date(this.promocionSeleccionada.fechaFin);

      if (fechaFinal > fechaFinPromocion) {
        Swal.fire({
          title: 'Promoción no disponible',
          text: 'La fecha seleccionada supera la vigencia de la promoción.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.loading = true;
    this.obtenerHorarios(true);
    this.cdr.detectChanges();
  }

  public previusPeriod(): void {
    const nuevaFecha = new Date(this.viewDate);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    nuevaFecha.setHours(0, 0, 0, 0);

    if (nuevaFecha < hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Dia no habil',
        text: 'No puedes consultar dias anteriores',
      });
    } else {
      this.viewDate = nuevaFecha;
      this.loading = true;
      this.obtenerHorarios(true);
      this.cdr.detectChanges();
    }
  }

  public today(): void {
    this.viewDate = new Date();
    this.loading = true;
    this.obtenerHorarios(true);
    this.cdr.detectChanges();
  }

  public onDateChange(event: any) {
    const fecha = event.value;
    if (!fecha) return;

    if (this.promocionSeleccionada) {
      const fechaSeleccionada = new Date(fecha);
      fechaSeleccionada.setHours(0, 0, 0, 0);

      const fechaIniPromocion = new Date(this.promocionSeleccionada.fechaIni);
      fechaIniPromocion.setHours(0, 0, 0, 0);

      const fechaFinPromocion = new Date(this.promocionSeleccionada.fechaFin);
      fechaFinPromocion.setHours(0, 0, 0, 0);

      if (
        fechaSeleccionada < fechaIniPromocion ||
        fechaSeleccionada > fechaFinPromocion
      ) {
        Swal.fire({
          title: 'Promoción no disponible',
          text: 'La fecha seleccionada está fuera de la vigencia de la promoción.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Dia no habil',
        text: 'No puedes consultar dias anteriores',
      });
    } else {
      this.viewDate = fecha;
      this.loading = true;
      this.obtenerHorarios(true);
      this.cdr.detectChanges();
    }
  }

  public seleccionarHora(hora: any): void {
    this.validarVersionApp(() => {
      let horaDiponible = false;
      horaDiponible = this.validarHoraDisponible(hora.hora);

      if (horaDiponible) {
        this.llamarModalRegistroCliente(hora);
      } else {
        const tiempoServicios = this.serviciosSeleccionados.reduce(
          (total, servicio) => total + servicio.tiempo,
          0
        );
        Swal.fire({
          icon: 'info',
          title: `No es posible agendar a las ${hora.hora}`,
          html: `
          El servicio seleccionado requiere <b> ${tiempoServicios} minutos continuos</b>.<br><br>
          Desde las <b>${hora.hora}</b> no hay tiempo suficiente para completar el servicio antes de la siguiente cita.<br><br>
          <b>Por favor selecciona un horario anterior.</b>
        `,
          confirmButtonText: 'Entendido'
        });
      }
    })
  }

  private llamarModalRegistroCliente(hora: any): void {
    const fechaFormateada = this.viewDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const valor = this.serviciosSeleccionados.map((s) => s.valor);
    this.costo = valor.reduce((a, b) => a + b, 0);
    const costoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.costo);

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

    const instance = dialogRef.componentInstance;

    instance.celularIngresado.subscribe((celular: string) => {
      const cliente = this.clientesEmpresa.find(
        (c) => c.telefono === celular || c.celular === celular
      );

      if (cliente) {
        instance.poblarDatos(cliente);
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        if (result.fechaNacimiento === '') {
          const hoy = new Date();
          result.fechaNacimiento = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T05:00:00`;
        }
        this.reservarCita(result, hora.hora);
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private reservarCita(
    datos: {
      celular: string;
      nombre: string;
      fecha: string;
      hora: string;
      correo: string;
      fechaNacimiento: string;
    },
    hora: string
  ) {
    this.validarVersionApp(() => {
      const request = this.createJson(hora, datos);
      if (this.empresaServicio || this.empresaRecursoMultiple) {
        this.agendaService.guardarCita(request).subscribe({
          next: (rest) => {
            if (rest.exito) {
              if (this.enviarMjsWssp) {
                this.mensajeWssp(request, datos, rest.envioMensaje);
              }
              const mensaje = rest.fidelidadMensaje
                ? `
                <div>
                  <div style="font-size: 17px; font-weight: 600;">
                    ✅ ${rest.mensaje || 'La cita fue creada exitosamente'}
                  </div>

                  <div style="
                    margin-top: 15px;
                    padding: 12px;
                    border-radius: 8px;
                    background: #f8f9fa;
                  ">
                    🎁 <strong>Fidelidad</strong><br>
                    ${rest.fidelidadMensaje}
                  </div>
                </div>
              `
                : rest.mensaje || 'La cita fue creada exitosamente';

              this.modalService.success(
                mensaje,
                () => this.volver()
              );
            } else {
              this.modalService.error(rest.mensaje)
            }
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.modalService.error(err.statusText);
            this.loading = false;
            this.mostrarDisponibilidad = true;
            this.cdr.detectChanges();
          },
        });
      } else {
        if (this.empresaOrden) {
          this.agendaService.guardarCitaSesion(request).subscribe({
            next: (rest) => {
              if (this.enviarMjsWssp) {
                this.mensajeWssp(request, datos, false);
              }
              this.modalService.success(
                rest.mensaje || 'La cita fue creada exitosamente',
                () => this.volver()
              );
              this.loading = false;
            },
            error: (err) => {
              this.modalService.error(err.mensaje);
              this.loading = false;
              this.mostrarDisponibilidad = true;
            }
          })
        } else {
          this.agendaService.registrarCita(request).subscribe({
            next: (rest) => {
              if (this.enviarMjsWssp) {
                this.mensajeWssp(request, datos, false);
              }
              this.modalService.success(
                rest.mensaje || 'La cita fue creada exitosamente',
                () => this.volver()
              );
              this.loading = false;
            },
            error: (err) => {
              this.modalService.error(err.mensaje);
              this.loading = false;
              this.mostrarDisponibilidad = true;
            },
          });
        }
      }
    })
  }

  public irPromociones(): void {

    if (!this.promociones || this.promociones.length === 0) {
      Swal.fire('Promociones', 'No hay promociones disponibles.', 'info');
      return;
    }
    this.serviciosSeleccionados = [];
    this.promociones = this.promociones.filter(p => p.estado === 'Activo');

    const opciones = this.promociones.map((promo: any, index: number) => `
    <label style="
      display: block;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 12px;
      cursor: pointer;
      text-align: left;
    ">
      <input type="radio" name="promocion" value="${index}"
        ${index === 0 ? 'checked' : ''}
        style="margin-right: 8px;">

      <span style="font-size: 22px; font-weight: bold; color: #16a34a;">
        ${promo.valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    })}
      </span>

      <div style="font-size: 13px; color: #777; margin: 8px 0;">
        Vigencia: ${new Date(promo.fechaIni).toLocaleDateString('es-CO')}
        - ${new Date(promo.fechaFin).toLocaleDateString('es-CO')}
      </div>

      <div style="font-weight: 600; margin-bottom: 5px;">
        Servicios incluidos:
      </div>

      <ul style="padding-left: 20px; margin: 0;">
        ${promo.servicios.map((s: any) => `
          <li>${s.nombre}</li>
        `).join('')}
      </ul>
    </label>
  `).join('');

    Swal.fire({
      title: '🎉 Elige tu promoción',
      html: `
      <div style="max-height: 400px; overflow-y: auto;">
        ${opciones}
      </div>
    `,
      confirmButtonText: 'Usar esta promoción',
      confirmButtonColor: '#1976d2',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      width: '480px',
      preConfirm: () => {
        const seleccion = document.querySelector(
          'input[name="promocion"]:checked'
        ) as HTMLInputElement;

        if (!seleccion) {
          Swal.showValidationMessage('Selecciona una promoción');
          return false;
        }

        return this.promociones[Number(seleccion.value)];
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const promocionSeleccionada = result.value;
        this.promocionSeleccionada = promocionSeleccionada;
        this.serviciosSeleccionados = this.servicios.filter(servicio =>
          this.promocionSeleccionada.servicios.some(
            (promo: any) => promo.id === servicio.id
          )
        );
        this.reservarServicios();
      }
    });
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

    const year = this.viewDate.getFullYear();
    const month = String(this.viewDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.viewDate.getDate()).padStart(2, '0');

    const fechaBase = `${year}-${month}-${day}`;
    const horasStr = String(horas).padStart(2, '0');

    return `${fechaBase}T${horasStr}:${minutos}:00`;
  }

  private createJson(
    hora: string,
    datos: {
      celular: string;
      nombre: string;
      fecha: string;
      hora: string;
      correo: string;
      fechaNacimiento: string;
    }
  ) {
    const fechaFinal = this.seleccionoCualquiera ? '' : this.obtenerFechaIni(hora);
    const serviciosSeleccionados = this.serviciosSeleccionados.map((s) => ({
      servicio: s.id,
    }));
    const tiempoTotalServicio = this.serviciosSeleccionados
      .map((s) => s.tiempo)
      .reduce((a, b) => a + b, 0);

    const fechaLocal =
      new Date().getFullYear() +
      '-' +
      String(new Date().getMonth() + 1).padStart(2, '0') +
      '-' +
      String(new Date().getDate()).padStart(2, '0') +
      'T' +
      String(new Date().getHours()).padStart(2, '0') +
      ':' +
      String(new Date().getMinutes()).padStart(2, '0') +
      ':' +
      String(new Date().getSeconds()).padStart(2, '0');

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

        if (this.promocionSeleccionada && agrupados.length > 0) {
          const primerAgrupado: any = agrupados.at(0);

          if (primerAgrupado) {
            primerAgrupado.Valor = this.promocionSeleccionada.valor;
          }
        }

        json = {
          FechaIni: fechaFinal,
          empresa: this.idEmpresa,
          UsuarioCreacion: 'Cliente',
          fechaCreacion: fechaLocal,
          clienteInfo: {
            Nombre: datos.nombre,
            Telefono: datos.celular,
            Correo: datos.correo,
            FechaNacimiento: datos.fechaNacimiento,
          },
          citas: agrupados,
          validaHorario: true,
          promociones: !!this.promocionSeleccionada
        }
        return json;
      } else {
        json = {
          FechaIni: fechaFinal,
          empresa: this.idEmpresa,
          UsuarioCreacion: 'Cliente',
          fechaCreacion: fechaLocal,
          clienteInfo: {
            Nombre: datos.nombre,
            Telefono: datos.celular,
            Correo: datos.correo,
            FechaNacimiento: datos.fechaNacimiento,
          },
          citas: resultadoAlterno,
          validaHorario: true
        }
        return json;
      }
    } else {
      if (this.empresaOrden) {
        let servicios = this.serviciosSeleccionados.map((s) => ({
          servicio: s.id,
          cantidad: s.sesiones
        }));

        json = {
          recurso: this.idRecurso,
          FechaIni: fechaFinal,
          Valor: this.costo,
          UsuarioCreacion: 'Cliente',
          Hora: tiempoTotalServicio,
          empresa: this.idEmpresa,
          servicios: servicios,
          clienteInfo: {
            Nombre: datos.nombre,
            Telefono: datos.celular,
            Correo: datos.correo,
            FechaNacimiento: datos.fechaNacimiento,
          },
          fechaCreacion: fechaLocal,
        };

        return json;

      } else {
        json = {
          FechaIni: fechaFinal,
          recurso: this.idRecurso,
          Valor: this.costo,
          UsuarioCreacion: 'Cliente',
          Hora: tiempoTotalServicio,
          empresa: this.idEmpresa,
          servicios: serviciosSeleccionados,
          clienteInfo: {
            Nombre: datos.nombre,
            Telefono: datos.celular,
            Correo: datos.correo,
            FechaNacimiento: datos.fechaNacimiento,
          },
          fechaCreacion: fechaLocal,
          seleccionoCualquiera: this.seleccionoCualquiera,
          sede: this.idSedeSeleccoinada
        };
      }
      return json;
    }
  }

  private mensajeWssp(request: any, datos: any, enviaMensaje: boolean): void {

    const fecha = new Date(request.FechaIni);
    const nombresServicios = this.serviciosSeleccionados
      .map((s: any) => s.nombre)
      .join(', ');
    const fechaFormateada = fecha.toLocaleDateString('es-CO');
    const horaFormateada = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const recurso: string = this.recursosSeleccionados
      .map(r => r.nombre)
      .join(', ');

    let tel: string = '';

    if (this.EnvioMensajeEmpresa) {
      tel = this.telefonoEmpresa;
    } else {
      tel = this.recursosSeleccionados[0].telefono;
    }

    let mensaje = this.mensajeWsspEmpresa || '';

    mensaje = mensaje
      .replace(/\$\{empresaNombre\}/g, this.empresaNombre)
      .replace(/\$\{recurso\}/g, recurso)
      .replace(/\$\{fechaFormateada\}/g, fechaFormateada)
      .replace(/\$\{horaFormateada\}/g, horaFormateada)
      .replace(/\$\{nombresServicios\}/g, nombresServicios)
      .replace(/\$\{nombreCliente\}/g, datos.nombre)
      .replace(
        /\$\{enviaMensaje\s*\?\s*"⚠️ Observación: Validar horario\."\s*:\s*""\}/g,
        enviaMensaje ? '⚠️ Observación: Validar horario.' : ''
      )
      .replace(
        /\$\{fidelidadMensaje\}/g,
        request.fidelidadMensaje?.trim() || ''
      )
      .replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n');

    const numero = '57' + tel;
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    console.log(mensaje);


    if (esMovil) {
      window.location.href =
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );
    }
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
      const nuevaHora = new Date(
        horaBase.getTime() + i * rangoMinutos * 60000
      );

      horasGeneradas.push(formatHora(nuevaHora));
    }

    let ultimoId = this.ultimoHorarioJornada === hora;

    if (ultimoId) {
      return true;
    }

    let conflicto;

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

      conflicto = horasGeneradas.some(horaGenerada => {
        const horario = horas.find(h => h.hora === horaGenerada);
        return !horario || !horario.disponible;
      });

    } else {
      conflicto = horasGeneradas.some(horaGenerada => {
        const horario = this.horas.find(h => h.hora === horaGenerada);

        return !horario || !horario.disponible;
      });
    }

    if (conflicto) {
      return false;
    }

    return true;
  }

  async seleccionarRecursosModal(servicios: any[]) {

    const grupos: any[] = [];
    servicios.forEach((servicio: any) => {
      const recursosIds = servicio.recursos
        .map((r: any) => r.recurso)
        .sort((a: number, b: number) => a - b)
        .join(',');

      const grupoExistente = grupos.find(
        grupo => grupo.recursosIds === recursosIds
      );

      if (grupoExistente) {
        grupoExistente.servicios.push(servicio);
      } else {
        grupos.push({
          recursosIds: recursosIds,
          servicios: [servicio],
          recursos: servicio.recursos
        });
      }
    });

    grupos.forEach((grupo: any) => {
      grupo.recursos.sort((a: any, b: any) => {
        const aObservacion = Number(a.observacion) === 1;
        const bObservacion = Number(b.observacion) === 1;
        return Number(bObservacion) - Number(aObservacion);
      });
    });

    let html = `
    <div class="seleccion-recursos">
  `;

    grupos.forEach((grupo: any, index: number) => {
      const tieneObservacion = grupo.servicios.some(
        (servicio: any) => Number(servicio.observacion) === 1
      );
      html += `
        <div class="grupo-recursos ${tieneObservacion ? 'grupo-prioritario' : ''}">

          <div class="cabecera-grupo">

            <div class="servicios-grupo">
      `;
      grupo.servicios.forEach((servicio: any) => {
        html += `
          <div class="servicio-nombre">
            ${servicio.nombre}
          </div>
        `;

      });
      if (tieneObservacion) {
        html += `
          <span class="badge-observacion">
            Requiere atención
          </span>
        `;
      }

      html += `
          </div>

          <div class="recursos-grid">
      `;

      grupo.recursos.forEach((recurso: any) => {
        html += `
      <label class="recurso-card">

        <input
          type="radio"
          name="grupo-${index}"
          value="${recurso.recurso}"
          class="recurso-radio"
        >

        <img
          src="${recurso.foto}"
          class="foto-recurso"
          onerror="this.src='assets/img/recurso-default.png'"
        >

        <div class="nombre-recurso">
          ${recurso.nombre_recurso}
        </div>

        <div class="check-icon">
          ✓
        </div>

      </label>
    `;

      });

      html += `
      </div>
    </div>
  `;
    });

    html += `</div>`;

    const seleccionados: any[] = [];

    const result = await Swal.fire({
      title: '¿Con quién deseas realizar tu servicio?',
      html: html,
      width: '700px',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2',
      customClass: {
        popup: 'modal-recursos'
      },
      preConfirm: () => {

        grupos.forEach((grupo: any, index: number) => {

          const seleccionado = document.querySelector(
            `input[name="grupo-${index}"]:checked`
          ) as HTMLInputElement;

          if (!seleccionado) {
            Swal.showValidationMessage(
              `Selecciona quién realizará el servicio`
            );
            return;
          }

          const recursoId = Number(seleccionado.value);
          const recursoSeleccionado = grupo.recursos.find(
            (r: any) => Number(r.recurso) === recursoId
          );

          grupo.servicios.forEach((servicio: any) => {
            seleccionados.push({
              idServicio: servicio.id,
              nombreServicio: servicio.nombre,
              recurso: recursoId
            });

            const servicioOriginal = this.serviciosSeleccionados.find(
              (s: any) => Number(s.id) === Number(servicio.id)
            );

            if (servicioOriginal) {
              servicioOriginal.recurso = recursoId;
              servicioOriginal.nombre_recurso =
                recursoSeleccionado?.nombre_recurso ?? '';
            }
          });
        });

        if (seleccionados.length === 0) {
          return false;
        }

        return seleccionados;
      }

    });

    if (result.isConfirmed) {
      this.mostrarInfoRecursos = true;
      this.ordenarCabecera(seleccionados);
      this.consultarHorariosOcupadosRecurso(this.viewDate)
    } else {
      this.loading = false;
      this.mostrarServicios = true;
    }

    this.cdr.detectChanges();
  }

  private ordenarCabecera(seleccionados: any[]): void {
    const recursosMap = new Map<number, any>();

    seleccionados.forEach((servicio: any) => {
      const idRecurso = Number(servicio.recurso);
      const recursoEmpresa = this.recursosEmpresa.find(
        (r: any) => Number(r.id) === idRecurso
      );

      if (!recursoEmpresa) {
        return;
      }

      if (!recursosMap.has(idRecurso)) {
        recursosMap.set(idRecurso, {
          id: recursoEmpresa.id,
          nombre: recursoEmpresa.nombre,
          foto: recursoEmpresa.foto,
          detalles: []
        });
      }

      recursosMap.get(idRecurso).detalles.push(servicio.nombreServicio);

    });

    this.recursosSeleccionados = Array.from(recursosMap.values());
  }

}