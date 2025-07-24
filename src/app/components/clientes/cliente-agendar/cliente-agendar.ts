import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { es } from 'date-fns/locale';
import { CalendarEvent, CalendarModule, CalendarMonthModule, CalendarMonthViewDay, CalendarView, DateAdapter } from 'angular-calendar';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { AngularCalendarModule } from '../../../shared/angular-calendar/angular-calendar-module';
import { MatDialog } from '@angular/material/dialog';
import { HoraDialogComponent } from '../../../shared/angular-calendar/hora-dialog.component';
import { SharedService } from '../../../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { UserResponse, Usuario } from '../../../interfaces/shared.interface';
import { MatInputModule } from '@angular/material/input';
import { startOfDay as startOfDayFn, addDays } from 'date-fns';
import Swal from 'sweetalert2';


registerLocaleData(localeEs);

interface Recurso {
  id: string;
  nombre: string;
}

interface Servicio {
  id: string;
  nombre: string;
  duracionMinutos: number;
}

interface Disponibilidad {
  fecha: string;
  horasDisponibles: string[];
}

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
    AngularCalendarModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css'
})

export class ClienteAgendar {

  recursos: Usuario[] = [];
  filtroRecurso: string = '';
  recursoSeleccionado: string = '';
  sedeSeleccionada: string = '';
  servicioSeleccionado: string = '';
  serviciosDisponibles: { id: string; nombre: string; valor: number }[] = [];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  locale = es;
  idEmpresa: number = 0;
  recursosFiltrados: any[] = [];
  sedesFiltrados: any[] = [];
  mostrarCalendar: boolean = true;
  mostrarSede: boolean = false;
  selectRecurso: boolean = true;
  selectServicio: boolean = false;

  constructor(
    private dialog: MatDialog,
    private sharedServices: SharedService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const infoEmpresa = localStorage.getItem('empresa');
    if (infoEmpresa) {
      const empresa = JSON.parse(infoEmpresa);
      this.idEmpresa = empresa.id;
      this.sedesFiltrados = empresa.sedes;
      this.obtenerRecursos(this.idEmpresa);
      this.obtenerHorarios();
      this.obtenerServicios(this.idEmpresa);
    }  
  }
  
  public obtenerHorarios():void {
    const fecha = new Date();
    this.sharedServices.obtenerAgenda(this.idEmpresa)
    .subscribe({
      next: rest => {
        console.log();   
          this.dialog.open(HoraDialogComponent, {
          width: '500px',
          data: { fecha, rest }
        }).afterClosed().subscribe(horaSeleccionada => {
          if (horaSeleccionada) {
            this.procesarAgendamiento(fecha, horaSeleccionada);
          }
        });       
      }
    })
  }

  ordernarHorarios() {
    const horas = [
      { hora: '08:00 AM', disponible: true },
      { hora: '09:00 AM', disponible: false },
      { hora: '10:00 AM', disponible: true },
      { hora: '11:00 AM', disponible: true },
      { hora: '12:00 PM', disponible: false },
      { hora: '01:00 PM', disponible: false },
      { hora: '02:00 PM', disponible: false },
      { hora: '03:00 PM', disponible: false },
      { hora: '04:00 PM', disponible: false },
      { hora: '05:00 PM', disponible: false },
      { hora: '06:00 PM', disponible: false }
    ];
  }

  public consultarRecursosSede(event:any): void {    
    let recursosLS = localStorage.getItem('recursos');
    if (recursosLS) {
      const recursosArray = JSON.parse(recursosLS);
      this.recursosFiltrados = recursosArray.filter((sede: any) => sede.sede === event.id);
      this.selectRecurso = false;
    }
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp)
    .subscribe({
      next: rest => {
        this.serviciosDisponibles = [...rest.datos];        
      }
    })
  }

  private obtenerRecursos(emp: number): void {
    this.sharedServices.obtenerRecursosAgenda(emp)
    .subscribe({
      next: rest => {
        this.mostrarSede = true;
        // this.mostrarSede = rest.datos.mostarSede;
        this.selectRecurso = this.mostrarSede;
        this.recursosFiltrados = [...rest.datos.usuario]
        localStorage.setItem('recursos', JSON.stringify(this.recursosFiltrados))
      }
    })
  }

  consultarServicios() {
    
  }

  cargarDisponibilidad() {
    this.events =  [
    {
      start: startOfDayFn(new Date()),
      title: 'Reserva de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
        {
      start: startOfDayFn(new Date()),
      title: 'Reserva de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
        {
      start: startOfDayFn(new Date()),
      title: 'Reserva de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
        {
      start: startOfDayFn(new Date()),
      title: 'Reserva de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
        {
      start: startOfDayFn(new Date()),
      title: 'Reserva de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
    {
      start: addDays(new Date(), 2),
      title: 'Corte de cabello',
      color: { primary: '#e3bc08', secondary: '#FDF1BA' },
    }
  ];;
    // this.mostrarCalendar = true;
  }

  onDayClick(event: { day: CalendarMonthViewDay }): void {
    if(this.recursoSeleccionado === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes seleccionar un recurso',
      });
    }else {

    }
    // const fecha = event.day.date;

    // const horas = [
    //   { hora: '08:00 AM', disponible: true },
    //   { hora: '09:00 AM', disponible: false },
    //   { hora: '10:00 AM', disponible: true },
    //   { hora: '11:00 AM', disponible: true },
    //   { hora: '12:00 PM', disponible: false },
    //   { hora: '01:00 PM', disponible: false },
    //   { hora: '02:00 PM', disponible: false },
    //   { hora: '03:00 PM', disponible: false },
    //   { hora: '04:00 PM', disponible: false },
    //   { hora: '05:00 PM', disponible: false },
    //   { hora: '06:00 PM', disponible: false }
    // ];

    // this.dialog.open(HoraDialogComponent, {
    //   width: '500px',
    //   data: { fecha, horas }
    // }).afterClosed().subscribe(horaSeleccionada => {
    //   if (horaSeleccionada) {
    //     this.procesarAgendamiento(fecha, horaSeleccionada);
    //   }
    // });
  }

  procesarAgendamiento(fecha: Date, hora: string): void {
    alert(`Vas a agendar una cita para el ${fecha.toLocaleDateString('es-CO')} a las ${hora}`);
  }

}

function startOfDay(arg0: Date): Date {
  throw new Error('Function not implemented.');
}

