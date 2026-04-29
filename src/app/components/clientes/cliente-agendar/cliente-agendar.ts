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
    MatDividerModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css',
})
export class ClienteAgendar {
  viewDate: Date = new Date();
  nombreDelRecurso: string = '';
  serviciosFiltrados: any[] = [];
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
  mostrarDetalle: boolean = false;
  mostrarServicios: boolean = false;
  detallesRecurso: string[] = [
    'Disponible de 8:00 a.m.',
    'corte + barba + ceja $30000',
    'Recurso: Sala 3',
  ];
  mensajeError: string = '';
  inactiva: boolean = false;
  clientesEmpresa: any[] = [];
  empresaLogo: string = '';
  empresaNombre: any = '';
  recursoSede: any;
  recursoId: any;
  rangoTiempo: string = '';
  tipoRangoTiempo: string = 'Tiempo_Agenda';
  seleccionRubro: boolean = false;

  constructor(
    private sharedServices: SharedService,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private modalService: Modal
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.idEmpresa = +params['emp'];
    });
    this.route.queryParams.subscribe((params) => {
      this.idRecurso = +params['rcr'];
    });
    this.obtenerRangoParametrizado();
    this.obtenerEmpresas();
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

  reservarServicios(): void {
    if (this.seleccionRubro) {
      this.loading = true;
      this.seleccionarRecurso(this.viewDate, this.seleccionRubro);
    }

    this.detallesRecurso = this.serviciosSeleccionados.map(
      (s) =>
        `${s.nombre} - ${new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(s.valor)}`
    );

    this.mostrarDetalle = true;
    this.mostrarServicios = false;
    this.mostrarDisponibilidad = true;
    this.cdr.detectChanges();
  }

  private obtenerEmpresas() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa: any = rest.datos.find((em) => em.id === this.idEmpresa);
          this.empresaLogo = 'assets/img/' + empresa?.logo;
          this.empresaNombre = empresa?.nombre;
          this.seleccionRubro = empresa.servicio;
          localStorage.setItem('empresa', JSON.stringify(empresa));
          this.obtenerRecursos();
        } else {
          this.inactiva = true;
        }
      },
    });
  }

  private obtenerRecursos(): void {
    this.sharedServices.obtenerRecursosAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          let recurso = rest.datos;
          const recursoActual = !this.seleccionRubro ? recurso.usuario.find(
            (r: any) => r.id === this.idRecurso
          ) : recurso.usuario[0].sede;
          if (!this.seleccionRubro) {
            this.fotoRecurso = recursoActual.foto;
            this.nombreDelRecurso = recursoActual.nombre;
            this.recursoId = recursoActual.id;
            this.recursoSede = recursoActual.sede
          } else {
            this.recursoSede = recursoActual;
          }
          localStorage.setItem('recurso', JSON.stringify(recursoActual));
          this.obtenerServicios(this.idEmpresa);
        } else {
          // this.modalService.error(rest.mensaje)
          // this.inactiva = true;
          // this.mensajeError = rest.mensaje;
          // this.cdr.detectChanges();
        }
      },
    });
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

  public seleccionarHora(hora: any): void {
    let horaDiponible = false;
    horaDiponible = this.validarHoraDisponible(hora.hora);

    if (horaDiponible) {
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
          this.reservarCita(result, hora.hora);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje',
        text: 'No puedes realizar el agendamiento ya que el tiempo de la cita sobrepasa al rango de horas disponibles.',
      });
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
      const nuevaHora = new Date(horaBase.getTime() + i * rangoMinutos * 60000);
      horasGeneradas.push(formatHora(nuevaHora));
    }

    let ultimoId =
      this.horas.findIndex((h) => h.hora === hora) === this.horas.length - 1;

    if (ultimoId) {
      return true;
    }

    let conflicto;

    if (
      this.horas.findIndex((h) => h.hora === hora) ===
      this.horas.length - 2
    ) {
      conflicto =
        !this.horas[this.horas.findIndex((h) => h.hora === hora) + 1]
          .disponible;
    } else {
      conflicto = horasGeneradas.find(
        (h) => !this.horas.some((x) => x.hora === h)
      );
    }

    if (conflicto) {
      return false;
    }

    return true;
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

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa },
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
    const request = this.createJson(hora, datos);
    if (this.seleccionRubro) {
      this.agendaService.guardarCita(request).subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.modalService.success(
              rest.mensaje || 'La cita fue creada exitosamente',
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
      this.agendaService.registrarCita(request).subscribe({
        next: (rest) => {
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
    const year = this.viewDate.getFullYear();
    const month = String(this.viewDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.viewDate.getDate()).padStart(2, '0');
    const fechaBase = `${year}-${month}-${day}`;
    const tiempoTotalServicio = this.serviciosSeleccionados
      .map((s) => s.tiempo)
      .reduce((a, b) => a + b, 0);

    const serviciosSeleccionados = this.serviciosSeleccionados.map((s) => ({
      servicio: s.id,
    }));

    // Extraer la hora y el periodo (AM o PM)
    const match = hora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
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

      // Asegurar formato 2 dígitos
      const horasStr = horas.toString().padStart(2, '0');
      const fechaFinal = `${fechaBase}T${horasStr}:${minutos}:00`;

      const now = new Date(this.viewDate);
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

      let json = {};


      if (this.seleccionRubro) {

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
          UsuarioCreacion: 'Cliente',
          fechaCreacion: fechaLocal,
          clienteInfo: {
            Nombre: datos.nombre,
            Telefono: datos.celular,
            Correo: datos.correo,
            FechaNacimiento: datos.fechaNacimiento,
          },
          citas: resultadoAlterno
        }
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
        };
      }
      return json;
    } else {
      return;
    }
  }

  public nextPeriod(): void {
    this.viewDate = new Date(this.viewDate);
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.loading = true;
    this.obtenerHorarios();
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
      this.obtenerHorarios();
      this.cdr.detectChanges();
    }
  }

  public today(): void {
    this.viewDate = new Date();
    this.loading = true;
    this.obtenerHorarios();
    this.cdr.detectChanges();
  }

  public seleccionarRecurso(fecha: Date, seleccionRubro: boolean): void {
    let request = {}

    if (seleccionRubro) {
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
        recurso: this.recursoId,
      };
    }


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
        this.consultarInfoCliente();
        this.verificarHoras();
        this.cdr.detectChanges();
      },
    });
  }

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

    // Ordenar
    horasFuturas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    // Separar
    this.horasAM = horasFuturas.filter((h) => h.hora.includes('AM'));
    this.horasPM = horasFuturas.filter((h) => h.hora.includes('PM'));
    this.loading = false;
    this.cdr.detectChanges();
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.serviciosFiltrados = !this.seleccionRubro ? rest.datos.filter(
            (s: any) =>
              s.sede === this.recursoSede &&
              s.nombre?.toLowerCase().trim() !== 'otro'
          ) :
            rest.datos.filter(
              (s: any) =>
                s.sede === this.recursoSede &&
                s.cliente === true
            );
          this.mostrarServicios = true;
          this.obtenerHorarios();
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

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  public obtenerHorarios(): void {
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

          // this.seleccionarRecurso(this.viewDate);

          if (!this.seleccionRubro) {
            this.seleccionarRecurso(this.viewDate, this.seleccionRubro);
          } else {
            this.consultarInfoCliente();
            this.verificarHoras();
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
}
