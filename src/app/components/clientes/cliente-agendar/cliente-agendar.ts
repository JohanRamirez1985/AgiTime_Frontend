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
    AngularCalendarModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css'
})

export class ClienteAgendar {

  recursos = [
    { id: 'peluquero1', nombre: 'Camilo Rojas' },
    { id: 'peluquero2', nombre: 'María Fernanda' }
  ];

  serviciosPorRecurso: Record<string, { id: string; nombre: string }[]> = {
    peluquero1: [
      { id: 'corte', nombre: 'Corte de cabello' },
      { id: 'barba', nombre: 'Perfilado de barba' }
    ],
    peluquero2: [
      { id: 'corte', nombre: 'Corte de cabello' },
      { id: 'color', nombre: 'Tinte' }
    ]
  };

  recursoSeleccionado: string = '';
  servicioSeleccionado: string = '';
  serviciosDisponibles: { id: string; nombre: string }[] = [];

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  locale = es;

  constructor(private dialog: MatDialog) {}


  ngOnInit() {
     console.log();
    // this.onSeleccionRecurso()
  }

  onSeleccionRecurso() {
    this.servicioSeleccionado = '';
    this.events = [];
    this.serviciosDisponibles = this.serviciosPorRecurso[this.recursoSeleccionado] || [];
  }

  cargarDisponibilidad() {
    if (!this.recursoSeleccionado || !this.servicioSeleccionado) return;

    this.events = [
      {
        start: new Date('2025-07-16'),
        title: 'Disponible',
        color: { primary: '#28a745', secondary: '#d4edda' },
        allDay: true
      },
      {
        start: new Date('2025-07-17'),
        title: 'Ocupado',
        color: { primary: '#dc3545', secondary: '#f8d7da' },
        allDay: true
      }
    ];
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
        console.log('⏰ Hora seleccionada:', horaSeleccionada);
        console.log('📅 Fecha seleccionada:', fecha);

        // ✅ Continúa con tu lógica de agendamiento
        this.procesarAgendamiento(fecha, horaSeleccionada);
      }
    });
  }

  procesarAgendamiento(fecha: Date, hora: string): void {
    // Aquí puedes mostrar una confirmación, redirigir, guardar en backend, etc.
    alert(`Vas a agendar una cita para el ${fecha.toLocaleDateString('es-CO')} a las ${hora}`);

    // Ejemplo de lógica adicional:
    // this.citaService.agendar({ fecha, hora, recurso, servicio }).subscribe(...)
  }





}
