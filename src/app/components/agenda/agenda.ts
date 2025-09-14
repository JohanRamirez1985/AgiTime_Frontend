import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AgendamientoService } from '../../services/agendamiento.service';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ReservaDialog } from '../reserva-dialog/reserva-dialog';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  empresaNombre: string = '';
  empresaLogo: string = '';
  mensajeError: string = '';
  inactiva: boolean = false;
  idEmpresa: number = 0;
  loading: boolean = true;
  serviciosFiltrados: any[] = [];
  serviciosSeleccionados: any[] = [];
  sedes: any[] = [];
  mostrarSede: boolean = false;
  sedeSeleccionada: number | null = null;
  reservaClick: boolean = false;
  horas: { hora: string; disponible: boolean }[] = [];
  recursos: any[] = [];
  recursosFiltrados: any[] = [];
  rangoTiempo: string = '';
  tiempoAgenda: string = '';
  tipoRango: string = 'Tiempo_Agenda_Diaria';
  tipoRangoTiempo: string = 'Tiempo_Agenda';
  clientesEmpresa: any[] = [];

  reservas = [
    {
      foto: 'assets/img/peluquero1.jpg',
      nombre: 'Carlos Gómez',
      servicios: ['Corte', 'Barba', 'Tintura'],
      valor: 50000,
      horarios: ['09:00', '10:00', '11:30', '14:00'],
    },
    {
      foto: 'assets/img/peluquero2.jpg',
      nombre: 'Andrés Pérez',
      servicios: ['Corte', 'Peinado'],
      valor: 40000,
      horarios: ['10:00', '13:00', '15:00'],
    },
  ];

  constructor(
    private sharedServices: SharedService,
    private route: ActivatedRoute,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.idEmpresa = +params['emp'];
    });
    this.consultarInfoCliente();
    this.obtenerRangoParametrizado();
    this.obtenerRecursos();
    this.obtenerHorarios();
    this.obtenerSedes();
    this.obtenerEmpresas();
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.rangoTiempo =
            rest.datos.find((t: any) => t.tipo === this.tipoRango)?.valor ?? '';
          this.tiempoAgenda =
            rest.datos.find((t: any) => t.tipo === this.tipoRangoTiempo)
              ?.valor ?? '';
        }
      },
    });
  }

  private obtenerRecursos(): void {
    this.sharedServices.obtenerRecursosAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          let recurso = rest.datos;
          this.recursos = recurso.usuario;
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
      },
    });
  }

  private obtenerHorarios(): void {
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
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
      },
    });
  }

  public seleccionarSede(sede: any) {
    this.loading = true;
    this.sedeSeleccionada = sede.id;
    this.obtenerServicios(this.idEmpresa);
    console.log();
  }

  private obtenerSedes() {
    this.sharedServices
      .obtenerSedesUsuarios(this.idEmpresa.toString())
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.sedes = rest.datos;
            this.mostrarSede = this.sedes.length === 1;
            if (this.mostrarSede) {
              this.sedeSeleccionada = this.sedes[0].id;
              this.obtenerServicios(this.idEmpresa);
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error de servidor',
            text: err.mensaje,
          });
        },
      });
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.serviciosFiltrados = [
            ...rest.datos.filter((s: any) => s.sede === this.sedeSeleccionada),
          ];
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
        this.loading = false;
        this.mostrarSede = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: err.mensaje,
        });
      },
    });
  }

  private generarIntervalos(
    horaInicio: string,
    horas: number,
    intervaloMin: number
  ): { hora: string; disponible: boolean; ocupado: boolean }[] {
    const result: { hora: string; disponible: boolean; ocupado: boolean }[] =
      [];

    const [hora, minutos, ampm] = horaInicio
      .match(/(\d+):(\d+) (\wM)/)!
      .slice(1);
    let h = parseInt(hora, 10);
    let m = parseInt(minutos, 10);
    let isPM = ampm === 'PM';

    // convertir a 24h
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;

    const start = new Date();
    start.setHours(h, m, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + horas);

    while (start <= end) {
      const hh = start.getHours();
      const mm = start.getMinutes();
      const am = hh >= 12 ? 'PM' : 'AM';
      const hh12 = hh % 12 || 12;
      const mmStr = mm.toString().padStart(2, '0');
      const horaStr = `${hh12}:${mmStr} ${am}`;

      result.push({
        hora: horaStr,
        disponible: true,
        ocupado: false,
      });

      start.setMinutes(start.getMinutes() + intervaloMin);
    }

    return result;
  }

  private consultarAgenda() {
    const hoy = new Date();

    const request = {
      empresa: this.idEmpresa,
      FechaIni: new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        0,
        0,
        0
      )
        .toISOString()
        .slice(0, 19),
      fechaFin: new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        23,
        59,
        59
      )
        .toISOString()
        .slice(0, 19),
    };

    this.agendaService.consultarAgendaDiaria(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          const agenda = rest.datos;
          this.recursosFiltrados = this.recursos;
          this.ordenarHoras(agenda);
          this.ordenarServicios();
          this.reservaClick = true;
        } else {
          this.reservaClick = false;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private ordenarServicios() {
    if (!this.serviciosSeleccionados?.length) return;

    const nombresServicios = this.serviciosSeleccionados.map((s) => s.nombre);
    const valorTotal = this.serviciosSeleccionados.reduce(
      (acc, s) => acc + s.valor,
      0
    );

    this.recursosFiltrados = this.recursosFiltrados.map((recurso) => ({
      ...recurso,
      servicios: nombresServicios,
      valor: valorTotal,
    }));
  }

  private ordenarHoras(agenda: any) {
    this.recursosFiltrados = this.recursosFiltrados.map((r) => {
      const encontrado = agenda.find((a: any) => a.usuario === r.id);

      if (encontrado) {
        const ahora = new Date();
        ahora.setMinutes(
          Math.ceil(ahora.getMinutes() / parseInt(this.tiempoAgenda)) *
            parseInt(this.tiempoAgenda),
          0,
          0
        );

        const horas = ahora.getHours();
        const minutos = ahora.getMinutes();
        const ampm = horas >= 12 ? 'PM' : 'AM';
        const horas12 = horas % 12 || 12;
        const minutosStr = minutos.toString().padStart(2, '0');
        const horaActual = `${horas12}:${minutosStr} ${ampm}`;

        const todasLasHoras = this.generarIntervalos(
          horaActual,
          parseInt(this.rangoTiempo),
          parseInt(this.tiempoAgenda)
        );

        // Marcar disponibles / ocupadas
        const horasDisponibles = todasLasHoras
          .filter((h) => !encontrado.horasOcu.includes(h.hora))
          .map((h) => ({
            hora: h.hora,
            ocupado: false,
          }));

        return { ...r, horasDisponibles };
      }

      return { ...r, horasDisponibles: [] };
    });
  }

  private obtenerEmpresas() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa = rest.datos.find((em) => em.id === this.idEmpresa);
          this.empresaLogo = 'assets/img/' + empresa?.logo;
          this.empresaNombre = empresa?.nombre ?? '';
          localStorage.setItem('empresa', JSON.stringify(empresa));
        } else {
          this.inactiva = true;
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

  public reservarServicios() {
    this.loading = true;
    this.cdr.detectChanges();
    this.consultarAgenda();
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

  public seleccionarHora(item: any, hora: any): void {
    const fechaFormateada = new Date().toLocaleDateString();

    const dialogRef = this.dialog.open(ReservaDialog, {
      width: '400px',
      data: {
        fecha: fechaFormateada,
        hora: hora.hora.hora,
        costo: item.valor,
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

    // 👂 escuchar cuando se cierre el modal
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.reservarCita(result, hora.hora.hora, item);
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
    hora: string,
    item: any
  ) {
    const request = this.createJson(hora, datos, item);
    this.agendaService.registrarCita(request).subscribe({
      next: (rest) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cita creada!',
          text: rest.mensaje || 'La cita fue creado exitosamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok',
        }).then(() => {
          this.volver();
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.mensaje,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa },
    });
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
    },
    item: any
  ) {
    const fechaBase = new Date().toISOString().split('T')[0];
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
      const json = {
        FechaIni: fechaFinal,
        recurso: item.id,
        Valor: item.valor,
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
      return json;
    } else {
      return;
    }
  }
}
