import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ReservaDialog } from '../../reserva-dialog/reserva-dialog';
import { ClienteService } from '../../../services/cliente.service';
import { Modal } from '../../../shared/services/modal';

interface Horario {
  hora: string;
  disponible: boolean;
}

interface Recurso {
  id: number;
  nombre: string;
  foto: string;
  horarios: Horario[];
}

@Component({
  selector: 'app-agenda-profesionales',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './agenda-profesionales.html',
  styleUrl: './agenda-profesionales.css'
})
export class AgendaProfesionales {

  fechaSeleccionada: Date = new Date();
  recursos: Recurso[] = [];
  loading: boolean = true;
  idEmpresa: number = 0;
  horas: { hora: string; disponible: boolean }[] = [];
  mostrarServicios: boolean = false;
  busqueda: string = '';
  serviciosFiltrados: any[] = [];
  servicios: any[] = [];
  serviciosSeleccionados: any[] = [];
  serviciosRecurso: any[] = [];
  horarioSeleccionado: {
    recursoId: number;
    hora: string;
  } | null = null;
  clientesEmpresa: any[] = [];
  enviarMjsWssp: boolean = false;


  constructor(private sharedService: SharedService,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private modalService: Modal
  ) {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    this.idEmpresa = info?.idEmpresa;
    this.consultarInfoCliente();
    this.obtenerRangoParametrizado();
    this.obtenerServicios();
    this.consultarUsuarios(this.idEmpresa);
  }

  filtrarServicios() {
    const texto = this.busqueda.toLowerCase();

    this.serviciosFiltrados = this.servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto)
    );
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

  private obtenerRangoParametrizado(): void {
    this.sharedService.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.enviarMjsWssp =
            rest.datos.find((h: any) => h.tipo === 'WhatsappRecurso')
              ?.valor?.toLowerCase() === 'true';
        }
      },
    });
  }

  private obtenerServicios(): void {
    this.sharedService.obtenerServicios(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.servicios = rest.datos;
        } else {
          this.servicios = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener servicios:', err);
        this.loading = false;
      },
    });
  }

  seleccionarHorario(recurso: Recurso, horario: Horario): void {
    if (!horario.disponible) {
      return;
    }
    this.horarioSeleccionado = {
      recursoId: recurso.id,
      hora: horario.hora
    };
    this.serviciosRecurso = this.servicios.filter(s => s.recurso === recurso.id);
    this.mostrarServicios = true
    this.cdr.detectChanges();
  }

  reservarServicios(): void {
    this.mostrarServicios = false;
    this.loading = true;
    this.cdr.detectChanges();

    const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const valor = this.serviciosSeleccionados.map((s) => s.valor);
    const costo = valor.reduce((a, b) => a + b, 0);
    const costoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(costo);

    const dialogRef = this.dialog.open(ReservaDialog, {
      width: '400px',
      data: {
        fecha: fechaFormateada,
        hora: this.horarioSeleccionado?.hora,
        costo: costoFormateado,
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
        this.cdr.detectChanges();
        this.reservarCita(result, this.horarioSeleccionado?.hora);
      } else {
        this.serviciosSeleccionados = [];
        this.horarioSeleccionado = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

    // const recurso = this.recursosSeleccionados
    //       .map(r => r.nombre)
    //       .join(', ');

    // const mensaje = `📅 ¡Hola ${this.empresaNombre}!

    //       Te informo que acabo de agendar una cita en ${this.empresaNombre}.

    //       👤 Profesional: ${recurso}
    //       📅 Fecha: ${fechaFormateada}
    //       🕐 Hora: ${horaFormateada}
    //       ✂️ Servicios: ${nombresServicios}
    //       🙋 Cliente: ${datos.nombre}
    //       ${enviaMensaje ? "⚠️ Observación: Validar horario." : ""}

    //       ✅ La cita ha sido registrada correctamente.

    //       ¡Nos vemos ese día! Muchas gracias por elegir ${this.empresaNombre}. 🙌`;

    // const numero = '57' + this.telefonoRecurso;

    // const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // if (esMovil) {
    //   window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    // } else {
    //   window.open(
    //     `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`,
    //     '_blank'
    //   );
    // }
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
    hora: any
  ) {
    const request = this.createJson(hora, datos);
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
        this.serviciosSeleccionados = [];
        this.horarioSeleccionado = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.modalService.error(err.statusText);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public volver(): void {
    this.consultarUsuarios(this.idEmpresa)
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

    const year = this.fechaSeleccionada.getFullYear();
    const month = String(this.fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const day = String(this.fechaSeleccionada.getDate()).padStart(2, '0');

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
    const fechaFinal = this.obtenerFechaIni(hora);
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
        Nombre: datos.nombre,
        Telefono: datos.celular,
        Correo: datos.correo,
        FechaNacimiento: datos.fechaNacimiento,
      },
      citas: agrupados,
      validaHorario: true
    }
    return json;

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

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some((s) => s.id === servicio.id);
  }

  cambiarDia(cantidad: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    const fecha = new Date(this.fechaSeleccionada);
    fecha.setDate(fecha.getDate() + cantidad);
    this.fechaSeleccionada = fecha;
    this.obtenerHorarios();
  }

  irHoy(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.fechaSeleccionada = new Date();
    this.obtenerHorarios();
  }

  get fechaTexto(): string {

    return this.fechaSeleccionada.toLocaleDateString(
      'es-CO',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }

  esHoy(): boolean {

    const hoy = new Date();

    return (
      hoy.getFullYear() === this.fechaSeleccionada.getFullYear() &&
      hoy.getMonth() === this.fechaSeleccionada.getMonth() &&
      hoy.getDate() === this.fechaSeleccionada.getDate()
    );
  }

  public consultarUsuarios(idEmpresa: number): void {
    this.sharedService.obtenerRecursosAgenda(idEmpresa).subscribe({
      next: (res) => {
        if (res.exito) {
          this.recursos = res.datos.usuario.map((r: any) => ({
            id: r.id,
            nombre: r.nombre,
            foto: r.foto,
            horarios: []
          }));
        } else {

        }
        this.obtenerHorarios();
      },
      error: (err) => {
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

  private consultarAgendaRecursos(): void {
    const consultas = this.recursos.map((recurso: any) => {

      const request = {
        empresa: this.idEmpresa,
        FechaIni: this.formatearFechaLocal(
          this.fechaSeleccionada,
          '00:00:00'
        ),
        fechaFin: this.formatearFechaLocal(
          this.fechaSeleccionada,
          '23:59:59'
        ),
        recurso: recurso.id
      };

      return this.agendaService.consultarAgendamientos(request);
    });


    forkJoin(consultas).subscribe({
      next: (respuestas: any[]) => {
        respuestas.forEach((rest, index) => {
          const recurso = this.recursos[index];
          recurso.horarios = [];

          if (rest.exito) {
            if (rest.diaCompletoBloqueado) {
              recurso.horarios = [];
            } else {
              recurso.horarios = this.horas
                .filter((h: any) => {
                  return !rest.horasOcupadas.some(
                    (horaOcupada: any) =>
                      horaOcupada === h.hora
                  );
                })
                .map((h: any) => ({
                  hora: h.hora,
                  disponible: true
                }));
            }
          } else {
            recurso.horarios = this.horas.map((h: any) => ({
              hora: h.hora,
              disponible: true
            }));
          }
        });
        this.loading = false;
        this.cdr.detectChanges();

      },
      error: (error) => {
        console.error(
          'Error consultando disponibilidad:',
          error
        );
        this.loading = false;
      }
    });
  }

  private obtenerHorarios(): void {
    this.sharedService.obtenerAgenda(this.idEmpresa).subscribe({
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


        } else {

        }
        this.consultarAgendaRecursos();
      },
    });
  }

}