import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent, CalendarMonthViewDay, CalendarView, DateAdapter } from 'angular-calendar';
import { AngularCalendarModule } from '../../../shared/angular-calendar/angular-calendar-module';
import { Subject } from 'rxjs';
import { addDays, subDays, addWeeks, subWeeks, setHours, setMinutes, startOfDay } from 'date-fns';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { HoraDialogComponent } from '../../../shared/angular-calendar/hora-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

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
    AngularCalendarModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatAccordion,
    MatExpansionModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css'
})
export class ClienteAgendar {
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  refresh = new Subject<void>();

  nombreDelRecurso: string = '';
  serviciosFiltrados: any[] = [];
  serviciosSeleccionados: any[] = [];
  idEmpresa: number = 0;
  horaInicioServicios: number = 0;
  horaFinServicios: number = 0;
  horas: {hora: string, disponible: boolean}[] = [];
  recursoInfo: { emp: number, id:number, nombre:string, sede: string} = {
    emp: 0,
    id: 0,
    nombre: '',
    sede: ''
  };
  seleccionHora: boolean = false;
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  data: any;
  horaSeleccionada: string = '';
  duracion: any = '';
    duraciones: { label: string, value: string}[] =  [
    { label: '1 hora', value: '1' },
    { label: '2 horas', value: '2' },
    { label: '3 horas', value: '3' },
    { label: '4 horas', value: '4' },
    { label: '5 horas', value: '5' },
    { label: '6 horas', value: '6' }
  ];
  recurso: string = '';
  servicio: any = '';
  cliente: number | null = 0;
  fecha : Date = new Date();



  // mostrarSede: boolean = false;
  // idUser: number | null = null;
  // idEmpresa: number = 0;
  // sedesFiltrados: any[] = [];
  // recursosFiltrados: any[] = [];
  // filtroRecurso: string = '';
  // sedeSeleccionada: string = '';
  // servicioSeleccionado: string = '';
  // serviciosDisponibles: { id: string; nombre: string; valor: number }[] = [];
  // selectRecurso: boolean = true;
  // selectServicio: boolean = false;

  // cargandoCalendario: boolean = true;

  events: CalendarEvent[] = [];

    constructor(
    private dialog: MatDialog,
    private sharedServices: SharedService,
    private route: ActivatedRoute,
    private agendaService: AgendamientoService
  ) {}

   ngOnInit() {
    const fecha = new Date();
    this.recursoInfo = JSON.parse(localStorage.getItem('recurso') || '{"emp":0,"id":0,"nombre":"","sede":""}');
    this.nombreDelRecurso = this.recursoInfo.nombre;
    this.idEmpresa = this.recursoInfo.emp;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios();
    this.seleccionarRecurso(fecha);
    // const infoEmpresa = localStorage.getItem('empresa');
    // this.idUser = JSON.parse(localStorage.getItem('usuario') || '{}')?.id ?? null;
    // if (infoEmpresa) {
    //   const empresa = JSON.parse(infoEmpresa);
    //   this.idEmpresa = empresa.id;
    //   this.sedesFiltrados = empresa.sedes;
    //   this.obtenerRecursos(this.idEmpresa);
    //   
    //   this.obtenerServicios(this.idEmpresa);
    // }  
  }

  cerrar(): void {
    // this.dialogRef.close();
  }

  confirmar() {
    const request = this.createJson();
    this.agendaService.registrarCita(request)
    .subscribe({
      next: rest => {
        console.log();
        Swal.fire({
          icon: 'success',
          title: '¡Cita creada!',
          text: rest.mensaje || 'La cita fue creado exitosamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok'
        }).then(() => {
          // this.dialogRef.close();
        });        
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: err.mensaje || 'Error de servidor',
        });
      }
    })
  }

  private createJson() {
    const fecha = new Date(this.fecha);
    const fechaBase = fecha.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Extraer la hora y el periodo (AM o PM)
    const match = this.horaSeleccionada.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
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

      const json = {
          Hora: this.duracion.value,
          FechaIni: fechaFinal,
          recurso: this.recurso,
          Cliente: this.cliente,
          Servicio: this.servicio.id,
          UsuarioCreacion: 'Cliente',
          empresa: this.idEmpresa
        };
    
      return json
      } 
      else {
        return
      }
  }

  seleccionarHora(hora: string) {
    this.seleccionHora = true;
    this.horaSeleccionada = hora;
  }

  // previousPeriod(): void {
  //   this.viewDate = this.view === CalendarView.Day
  //     ? subDays(this.viewDate, 1)
  //     : subWeeks(this.viewDate, 1);
  // }

  // nextPeriod(): void {
  //   this.viewDate = this.view === CalendarView.Day
  //     ? addDays(this.viewDate, 1)
  //     : addWeeks(this.viewDate, 1);
  // }

  // today(): Date {
  //   return new Date();
  // }

  public seleccionarRecurso(fecha: Date): void {
    // this.selectServicio = true;
    // this.cargandoCalendario = true;
    const request = {
      empresa: this.idEmpresa,
      FechaIni : this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin : this.formatearFechaLocal(fecha, '23:59:59'),
      recurso: this.recursoInfo.id
    };
    
    this.agendaService.consultarAgendamientos(request)
      .subscribe({
        next: rest => {
          if(rest.exito) {
            this.horas = this.horas.map(h => ({
              ...h,
              disponible: !rest.datos.includes(h.hora)
            }));
            // if(select) this.inicial(fecha);
            // this.cargandoCalendario = false;
          }else {
            // this.cargandoCalendario = false;
          }
        }
      })
  }

  private inicial(fecha: any) {
    this.events = this.horas
    .filter(h => !h.disponible)
    .map(h => {
      const [horaStr, ampm] = h.hora.split(' ');
      let [hour, minute] = horaStr.split(':').map(Number);

      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      const start = setHours(setMinutes(startOfDay(fecha), minute), hour);

      return {
        start,
        title: 'No disponible',
        color: {
          primary: '#b53f4f',
          secondary: '#e3f2fd'
        }
      } as CalendarEvent;
    });
  }

  // handleEvent(event: CalendarEvent): void {
  //   console.log('Evento clickeado:', event);
  // }

  // seleccionarRecursoConFecha() {
  //   const fecha = new Date();
  //   this.seleccionarRecurso(true, fecha);
  // }


  horaClickeada(event: any): void {
    const fecha = event.date;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    if (fecha < hoy) return;
    if(this.nombreDelRecurso === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes seleccionar un recurso',
      });
    }else {
      // this.seleccionarRecurso(false, fecha);
      // this.openModal(fecha, this.horas, this.recursoSeleccionado, this.servicioSeleccionado);

    }
  }



  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp)
    .subscribe({
      next: rest => {
        this.serviciosFiltrados = [...rest.datos];        
      }
    })
  }

  // private obtenerRecursos(emp: number): void {
  //   this.sharedServices.obtenerRecursosAgenda(emp)
  //   .subscribe({
  //     next: rest => {
  //       this.mostrarSede = rest.datos.mostarSede;
  //       this.selectRecurso = this.mostrarSede;
  //       this.recursosFiltrados = [...rest.datos.usuario]
  //       localStorage.setItem('recursos', JSON.stringify(this.recursosFiltrados))
  //     }
  //   })
  // }

  // onDayClick(event: { day: CalendarMonthViewDay }): void {
  //   const fecha = event.day.date;
  //   const hoy = new Date();
  //   hoy.setHours(0, 0, 0, 0);
  //   fecha.setHours(0, 0, 0, 0);

  //   if (fecha < hoy) return;
  //   if(this.recursoSeleccionado === '') {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Oops...',
  //       text: 'Debes seleccionar un recurso',
  //     });
  //   }else {
  //     const request = {
  //       empresa: this.idEmpresa,
  //       FechaIni : this.formatearFechaLocal(fecha, '00:00:00'),
  //       fechaFin : this.formatearFechaLocal(fecha, '23:59:59'),
  //       recurso: this.recursoSeleccionado
  //     };
  //     this.agendaService.consultarAgendamientos(request)
  //       .subscribe({
  //         next: rest => {
  //           if(rest.exito) {
  //             this.horas = this.horas.map(h => ({
  //               ...h,
  //               disponible: !rest.datos.includes(h.hora)
  //             }));
  //           }
  //           this.openModal(fecha, this.horas, this.recursoSeleccionado, this.servicioSeleccionado);
  //         }
  //       })
  //     }
  // }

  // private openModal(fecha:any, horas: any , recurso: string, servicio: string) {
  //   this.dialog.open(HoraDialogComponent, {
  //     width: '500px',
  //     data: { fecha, horas, recurso, servicio}
  //   }).afterClosed().subscribe(horaSeleccionada => {
  //     if (horaSeleccionada) {
  //       this.procesarAgendamiento(fecha, horaSeleccionada);
  //     }
  //   });
  // }

  
  // procesarAgendamiento(fecha: Date, hora: string): void {
  //   alert(`Vas a agendar una cita para el ${fecha.toLocaleDateString('es-CO')} a las ${hora}`);
  // }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  // public consultarRecursosSede(event:any): void {    
  //   let recursosLS = localStorage.getItem('recursos');
  //   if (recursosLS) {
  //     const recursosArray = JSON.parse(recursosLS);
  //     this.recursosFiltrados = recursosArray.filter((sede: any) => sede.sede === event.id);
  //     this.selectRecurso = false;
  //   }
  // }

  public obtenerHorarios():void {
    const fecha = new Date();
    // this.cargandoCalendario = true;
    this.sharedServices.obtenerAgenda(this.idEmpresa)
    .subscribe({
      next: rest => {
        const respuesta = rest.datos;
        this.ordenarDataCalendario(respuesta);
        this.horas = respuesta.map((h: { valor: string; estado: boolean }) => {
          const [hour, minute] = h.valor.split(':');
          const date = new Date();
          date.setHours(Number(hour), Number(minute));

          const horaFormateada = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          return {
            hora: horaFormateada,
            disponible: h.estado
          };
        });    
        // this.cargandoCalendario = false;
      }
    })
  }

  private ordenarDataCalendario(respuesta:any): void {
    const primerHorario = respuesta[0];
    const ultimoHorario = respuesta[respuesta.length - 1];

    this.horaInicioServicios = parseInt(primerHorario.valor.split(':')[0], 10);
    this.horaFinServicios = parseInt(ultimoHorario.valor.split(':')[0], 10) + 1; // sumamos 1 para que incluya esa última hora en el calendario
  }



}
