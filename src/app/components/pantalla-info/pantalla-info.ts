import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { AgendamientoService } from '../../services/agendamiento.service';
import { Modal } from '../../shared/services/modal';
import Swal from 'sweetalert2';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Cita {
  hora: string;
  cliente: string;
  servicio: string;
  fidelidad: string;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADA';
}

interface Recurso {
  id: number;
  nombre: string;
  citas: Cita[];
}

interface Sede {
  id: number;
  nombre: string;
  recursos: Recurso[];
}

@Component({
  selector: 'app-pantalla-info',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pantalla-info.html',
  styleUrls: ['./pantalla-info.css']
})
export class PantallaInfo implements OnInit {

  fechaActual = new Date();
  esMobile = false;
  fechaInicio: Date;
  fechaFin: Date;
  idEmpresa: number = 0;
  viewDate: Date = new Date();
  sedes: Sede[] = [];
  empresaLogo: string = '';
  empresaNombre: string = '';
  loading: boolean = true;
  private intervalId: any;
  mostrarBtnNav: boolean = false;
  mustraTodoAgenda: boolean = false;

  constructor(
    private agendaService: AgendamientoService,
    private modalService: Modal,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
  ) {
    const hoy = new Date();

    this.fechaFin = new Date(hoy);

    this.fechaInicio = new Date();
    this.fechaInicio.setDate(hoy.getDate() - 7);
  }

  public nextPeriod(): void {
    this.loading = true;
    this.viewDate = new Date(this.viewDate);
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.consultarAgenda(this.viewDate);
  }

  public previusPeriod(): void {
    const nuevaFecha = new Date(this.viewDate);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    nuevaFecha.setHours(0, 0, 0, 0);
    this.loading = true;
    this.viewDate = nuevaFecha;
    this.consultarAgenda(this.viewDate);
  }

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', () => {
      this.checkScreen();
    });
    setInterval(() => {
      this.fechaActual = new Date();
    }, 1000);

    this.intervalId = setInterval(() => {
      this.consultarAgenda(this.viewDate);
    }, 5 * 60 * 1000);

    this.idEmpresa = Number(
      this.route.snapshot.paramMap.get('empresaId') ?? 0
    );
    this.obtenerRangoParametrizado();
    this.obtenerEmpresas();
  }

  private obtenerEmpresas() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa: any = rest.datos.find((em) => em.id === this.idEmpresa);
          this.empresaLogo = 'assets/img/' + empresa.logo;
          this.empresaNombre = empresa.nombre;
          localStorage.setItem('empresa', JSON.stringify(empresa));
          this.consultarAgenda(this.viewDate);
        }
      },
    });
  }

  onDateChange(event: any) {
    const fecha = event.value;
    if (!fecha) return;
    this.loading = true;
    this.viewDate = fecha;
    this.consultarAgenda(this.viewDate);
  }

  formatearHora(hora: string): string {
    if (!hora) return '';

    const [horas, minutos] = hora.split(':').map(Number);

    const periodo = horas >= 12 ? 'PM' : 'AM';
    const hora12 = horas % 12 || 12;

    return `${hora12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  }

  private consultarAgenda(fecha: any) {

    const request = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin: this.formatearFechaLocal(fecha, '23:59:59'),
    };

    this.agendaService.consultarAgendaCitas(request)
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.sedes = rest.datos.map((sede: any) => ({
              ...sede,
              recursos: sede.recursos.map((recurso: any) => ({
                ...recurso,
                citas: this.agruparCitas(
                  recurso.citas
                    .filter((cita: any) =>
                      !this.mustraTodoAgenda ? cita.estado === 'Activo' : true
                    )
                    .sort((a: any, b: any) => {
                      const [ha, ma] = a.hora.split(':').map(Number);
                      const [hb, mb] = b.hora.split(':').map(Number);

                      return (ha * 60 + ma) - (hb * 60 + mb);
                    })
                    .map((cita: any) => ({
                      ...cita,
                      hora: this.formatearHora(cita.hora)
                    }))
                )
              }))
            }));
          } else {
            this.sedes = [];
            this.modalService.error(rest.mensaje);
          }

          this.loading = false;
        },
        error: (err) => {
          this.sedes = [];
          this.modalService.error(err.statusText);
          this.loading = false;
        }
      });
  }

  private agruparCitas(citas: any[]): any[] {

    const mapa = new Map<string, any>();

    citas.forEach(cita => {

      const key = `${cita.cliente}-${cita.hora}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          ...cita
        });
      } else {
        const existente = mapa.get(key);

        existente.servicio += `, ${cita.servicio}`;
      }

    });

    return Array.from(mapa.values());

  }

  checkScreen() {
    this.esMobile = window.innerWidth < 768;
  }

  retrocederDia() {
    const d = new Date(this.fechaActual);
    d.setDate(d.getDate() - 1);
    this.fechaActual = d;
    this.cargarDatos();
  }

  avanzarDia() {
    const d = new Date(this.fechaActual);
    d.setDate(d.getDate() + 1);
    this.fechaActual = d;
    this.cargarDatos();
  }

  cargarDatos() {
    console.log('Cargando datos para:', this.fechaActual);
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  private obtenerRangoParametrizado(): void {
    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          const mostrarFecha = rest.datos.find(
            (t: any) => t.tipo === 'FechaMonitorAgenda'
          )?.valor ?? 'true';

          const muestraTodo = rest.datos.find(
            (t: any) => t.tipo === 'MostrarTodoMonitorAgenda'
          )?.valor ?? 'true';
          this.mostrarBtnNav = mostrarFecha?.toLowerCase() === 'true';
          this.mustraTodoAgenda = muestraTodo?.toLowerCase() === 'true';
        }
      },
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}