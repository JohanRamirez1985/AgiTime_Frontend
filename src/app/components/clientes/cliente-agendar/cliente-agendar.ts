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
  servicioSeleccionado: string = '';
  serviciosDisponibles: { id: string; nombre: string }[] = [];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  locale = es;
  idEmpresa: number = 0;
  recursosFiltrados: Usuario[] = [];
  mostrarCalendar: boolean = false;

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
      this.obtenerUsuarios();
    }
  }

  private obtenerUsuarios(): void {
    this.sharedServices.obtenerUsuarios(this.idEmpresa).subscribe({
      next: (rest: UserResponse) => {
        this.recursos = rest.datos;
        this.recursosFiltrados = [...this.recursos];
      }
    });
  }

  filtrarRecursos(): void {
    const filtro = this.filtroRecurso?.toLowerCase() || '';
    this.recursosFiltrados = this.recursos.filter(r =>
      r.nombre.toLowerCase().includes(filtro)
    );
  }

  consultarServicios() {
    if(this.recursoSeleccionado !== '') {
      this.serviciosDisponibles = [
        {
          id: '0',
          nombre: 'corte cabello'
        },
        {
          id: '1',
          nombre: 'corte barba'
        },
               {
          id: '2',
          nombre: 'cejas'
        }
      ]
    }
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
    this.mostrarCalendar = true;
  }

  onDayClick(event: { day: CalendarMonthViewDay }): void {
    const fecha = event.day.date;

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

    this.dialog.open(HoraDialogComponent, {
      width: '500px',
      data: { fecha, horas }
    }).afterClosed().subscribe(horaSeleccionada => {
      if (horaSeleccionada) {
        this.procesarAgendamiento(fecha, horaSeleccionada);
      }
    });
  }

  procesarAgendamiento(fecha: Date, hora: string): void {
    alert(`Vas a agendar una cita para el ${fecha.toLocaleDateString('es-CO')} a las ${hora}`);
  }




}
function startOfDay(arg0: Date): Date {
  throw new Error('Function not implemented.');
}

