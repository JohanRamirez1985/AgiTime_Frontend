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
import { CalendarConfigModule } from './calendar-config.module';

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
    CalendarConfigModule
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

  constructor() {
   
    
  }

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
    const fechaSeleccionada = event.day.date;
    alert(`Elegiste el ${fechaSeleccionada.toLocaleDateString()}`);
  }


}
