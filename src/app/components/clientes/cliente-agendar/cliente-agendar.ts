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
    ValidarVersion
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
    this.consultarInfoCliente();
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


        }
      },
    });
  }

  filtrarServicios() {
    const texto = this.busqueda.toLowerCase();

    this.serviciosFiltrados = this.servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto)
    );
    this.cdr.detectChanges();
  }

  public misCitas(): void {
    this.router.navigate(['/cliente/misCitas'], {
      queryParams: {
        emp: this.idEmpresa,
      },
    });
  }

  reservarServicios(): void {
    if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
      this.loading = true;
      const empresa = this.empresaServicio
        || this.empresaOrden
        || this.empresaRecursoMultiple;
      this.seleccionarRecurso(this.viewDate, empresa);
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

    if (this.empresaRecursoMultiple) {

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

      this.seleccionarRecursos(serviciosConRecursos);
    } else {
      this.mostrarDisponibilidad = true;
    }

    this.mostrarServicios = false;
    this.mostrarDetalle = true;
    this.cdr.detectChanges();
  }

  async seleccionarRecursos(servicios: any[]) {

    
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

    let html = `
    <div class="seleccion-recursos">
  `;

    grupos.forEach((grupo: any) => {
      html += `
      <div class="grupo-recursos">

        <div class="servicios-grupo">
    `;

      grupo.servicios.forEach((servicio: any) => {

        html += `
        <div class="servicio-nombre">
          ${servicio.nombre}
        </div>
      `;

      });

      html += `
        </div>

        <div class="recursos-grid">
    `;

      grupo.recursos.forEach((recurso: any) => {

        html += `
        <label class="recurso-card">

          <input
            type="radio"
            name="grupo-${grupos.indexOf(grupo)}"
            value="${recurso.recurso}"
            class="recurso-radio"
          >

          <img
            src="${recurso.foto}"
            class="foto-recurso"
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


    const result = await Swal.fire({
      title: '¿Quién realizará tus servicios?',
      html: html,
      width: '650px',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2',
      preConfirm: () => {
        const seleccionados: any[] = [];
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

          const recurso = Number(seleccionado.value);
          grupo.servicios.forEach((servicio: any) => {
            seleccionados.push({
              idServicio: servicio.id,
              nombreServicio: servicio.nombre,
              recurso: recurso
            });
          });
        });

        if (seleccionados.length === 0) {
          return false;
        }

        return seleccionados;
      }

    });

    if (result.isConfirmed) {
      this.mostrarDisponibilidad = true;
    }else {
      this.mostrarServicios = true;
    }
    this.cdr.detectChanges();

  }

  private obtenerEmpresas() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa: any = rest.datos.find((em) => em.id === this.idEmpresa);
          const sedeSeleccionada: any = JSON.parse(localStorage.getItem('sedeSeleccionada') || '{}');
          this.empresaLogo = 'assets/img/' + empresa?.logo;
          this.empresaNombre = empresa?.nombre;
          this.empresaServicio = empresa.servicio;
          this.empresaOrden = empresa.ordenes;
          this.empresaRecursoMultiple = empresa.recursoMultiple;
          this.empresaNormal = !this.empresaServicio && !this.empresaOrden && !this.empresaRecursoMultiple;
          this.telefonoEmpresa = sedeSeleccionada.telefono;
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
          this.recursosEmpresa = recurso.usuario;
          let recursoSeleccionado: any;

          if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
            recursoSeleccionado = recurso.usuario[0];
            recurso = recurso.usuario[0].sede;


            this.recursoSede = recursoSeleccionado.sede;
            this.fotoRecurso = recursoSeleccionado.foto;
            this.nombreDelRecurso = recursoSeleccionado.nombre;
            this.recursoSede = recursoSeleccionado.sede;
          } else {
            recurso = recurso.usuario.find(
              (r: any) => r.id === this.idRecurso
            );

            this.fotoRecurso = recurso.foto;
            this.nombreDelRecurso = recurso.nombre;
            this.recursoId = recurso.id;
            this.recursoSede = recurso.sede;
          }

          if (this.EnvioMensajeEmpresa) {
            this.telefonoRecurso = this.telefonoEmpresa;
          } else {
            this.telefonoRecurso = recurso.telefono;
          }
          localStorage.setItem('recurso', JSON.stringify(recurso));
          this.obtenerServicios(this.idEmpresa);
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

    let ultimoId = this.ultimoHorarioJornada === hora;

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

  private mensajeWssp(request: any, datos: any): void {

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

    const recurso = this.idEmpresa === 8
      ? this.empresaNombre
      : JSON.parse(localStorage.getItem('recurso') || '{}').nombre;

    const destinatario = this.EnvioMensajeEmpresa
      ? recurso
      : 'contigo';

    const mensaje = `📅 ¡Hola ${this.empresaNombre}!

          Te informo que acabo de agendar una cita en ${this.empresaNombre}.

          👤 Profesional: ${destinatario}
          📅 Fecha: ${fechaFormateada}
          🕐 Hora: ${horaFormateada}
          ✂️ Servicios: ${nombresServicios}
          🙋 Cliente: ${datos.nombre}

          ✅ La cita ha sido registrada correctamente.

          ¡Nos vemos ese día! Muchas gracias por elegir ${this.empresaNombre}. 🙌`;

    const numero = '57' + this.telefonoRecurso;

    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMovil) {
      window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );
    }
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
    if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
      this.agendaService.guardarCita(request).subscribe({
        next: (rest) => {
          if (rest.exito) {
            if (this.enviarMjsWssp) {
              this.mensajeWssp(request, datos);
            }
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
      if (this.empresaOrden) {
        this.agendaService.guardarCitaSesion(request).subscribe({
          next: (rest) => {
            if (this.enviarMjsWssp) {
              this.mensajeWssp(request, datos);
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
              this.mensajeWssp(request, datos);
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
  }

  private guardarCita(request: any) {

  }

  onDateChange(event: any) {
    const fecha = event.value;
    if (!fecha) return;

    this.viewDate = fecha;
    this.loading = true;
    this.obtenerHorarios();
    if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
      const empresa = this.empresaServicio
        || this.empresaOrden
        || this.empresaRecursoMultiple;
      this.seleccionarRecurso(this.viewDate, empresa)
    }
    this.cdr.detectChanges();
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

      const now = new Date();
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


      if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {

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
          citas: resultadoAlterno,
          validaHorario: true
        }
        return json;
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
          };
        }
        return json;
      }
    } else {
      return;
    }
  }

  public nextPeriod(): void {
    this.viewDate = new Date(this.viewDate);
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.loading = true;
    this.obtenerHorarios();
    if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
      const empresa = this.empresaServicio
        || this.empresaOrden
        || this.empresaRecursoMultiple;
      this.seleccionarRecurso(this.viewDate, empresa)
    }
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
      if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
        const empresa = this.empresaServicio
          || this.empresaOrden
          || this.empresaRecursoMultiple;
        this.seleccionarRecurso(this.viewDate, empresa)
      }
      this.cdr.detectChanges();
    }
  }

  public today(): void {
    this.viewDate = new Date();
    this.loading = true;
    this.obtenerHorarios();
    if (this.empresaServicio || this.empresaOrden || this.empresaRecursoMultiple) {
      const empresa = this.empresaServicio
        || this.empresaOrden
        || this.empresaRecursoMultiple;
      this.seleccionarRecurso(this.viewDate, empresa)
    }
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

    // Separar
    this.horasAM = horasValidas.filter((h) => h.hora.includes('AM'));
    this.horasPM = horasValidas.filter((h) => h.hora.includes('PM'));
    this.loading = false;
    this.cdr.detectChanges();
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
                s.sede === this.recursoSede &&
                s.cliente === true
            );
          }

          this.mostrarServicios = true;
          this.servicios = this.serviciosFiltrados;
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
          this.ultimoHorarioJornada = this.horas[this.horas.length - 1].hora;

          if (!this.empresaServicio && !this.empresaOrden && !this.empresaRecursoMultiple) {
            this.seleccionarRecurso(this.viewDate, this.empresaServicio);
          } else {
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
