import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ChangeDetectorRef, Component, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { AngularCalendarModule } from '../../../shared/angular-calendar/angular-calendar-module';
import { Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../../services/shared.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
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
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  cargandoCalendario: boolean = true;
  mostrarDisponibilidad: boolean = false;
  costo: number = 0;


  events: CalendarEvent[] = [];

    constructor(
    private dialog: MatDialog,
    private sharedServices: SharedService,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private router: Router
   
  ) {}

   ngOnInit() {
    this.recursoInfo = JSON.parse(localStorage.getItem('recurso') || '{"emp":0,"id":0,"nombre":"","sede":""}');
    this.nombreDelRecurso = this.recursoInfo.nombre;
    this.idEmpresa = this.recursoInfo.emp;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios();
  }

  public seleccionarHora(hora: any): void {
    // Validar si la hora ya pasó
    if (!this.estaDisponible(hora.hora)) {
      Swal.fire({
        icon: 'warning',
        title: 'Hora inválida',
        text: 'No puedes agendar en horarios pasados',
      });
      return;
    }

    const fechaFormateada = this.viewDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.costo = this.serviciosSeleccionados.reduce((a, b) => a + b, 0);
    const costoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(this.costo);


    Swal.fire({
      title: 'Confirmar reserva',
      html: `
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${hora.hora}</p>
        <p><strong>Costo:</strong> ${costoFormateado}</p>
        <input type="text" id="celular" class="swal2-input" placeholder="Celular">
        <input type="text" id="nombre" class="swal2-input" placeholder="Nombres">
      `,
      confirmButtonText: 'Reservar',
      showCancelButton: true,
      preConfirm: () => {
        const celular = (document.getElementById('celular') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        if (!celular || !/^\d{7,}$/.test(celular)) {
          Swal.showValidationMessage('Ingresa un número de celular válido');
          return false;
        }

        return { celular, nombre, fecha: this.viewDate, hora: hora.hora };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const datosReserva = result.value;
        console.log('Datos de reserva:', datosReserva);

        this.reservarCita(datosReserva, hora.hora);
      }
    });
    
  }

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa } 
    }); // o la ruta a la que quieras volver
  }

  private reservarCita(datos: { celular: string, fecha: string, hora: string }, hora: string) {
    const request = this.createJson(hora);
    // this.agendaService.registrarCita(request)
    // .subscribe({
    //   next: rest => {
    //     Swal.fire({
    //       icon: 'success',
    //       title: '¡Cita creada!',
    //       text: rest.mensaje || 'La cita fue creado exitosamente',
    //       confirmButtonColor: '#3085d6',
    //       confirmButtonText: 'Ok'
    //     }).then(() => {
    //       // this.dialogRef.close();
    //     });        
    //   },
    //   error: err => {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Error de servidor',
    //       text: err.mensaje || 'Error de servidor',
    //     });
    //   }
    // })
    
  }

  private estaDisponible(hora: string): boolean {
    const hoy = new Date();

    const [time, period] = hora.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const horaCita = new Date(hoy);
    horaCita.setHours(hours, minutes, 0, 0);

    return horaCita > hoy;
  }


  private createJson(hora : string) {
    const fechaBase = this.viewDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

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

        const json = {
            // Hora: this.duracion.value,
            // FechaIni: fechaFinal,
            // recurso: this.recurso,
            // Cliente: this.cliente,
            // Servicio: this.servicio.id,
            // UsuarioCreacion: 'Cliente',
            // empresa: this.idEmpresa
          };
      
        return json
    } 
    else {
      return
    }
  }

  // seleccionarHora(hora: string) {
  //   this.seleccionHora = true;
  //   this.horaSeleccionada = hora;
  // }

  public nextPeriod(): void {
    this.viewDate = new Date(this.viewDate);
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.cargandoCalendario = true;
    this.horas.forEach(hora => hora.disponible = true);
    this.seleccionarRecurso(this.viewDate);
  }

  public today(): void {
    this.viewDate = new Date();
    this.cargandoCalendario = true;
    this.horas.forEach(hora => hora.disponible = true);
    this.seleccionarRecurso(this.viewDate);
  }

  public seleccionarRecurso(fecha: Date): void {
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
            for (let i = 0; i < this.horas.length; i++) {
              let disponible = true;
              disponible = rest.datos.find((h : any) => h === this.horas[i].hora);
              if(disponible) {
                this.horas[i].disponible = false;
              }
            }
          }
          this.cargandoCalendario = false;
          this.cdr.detectChanges();
        }
      })
  }

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
    this.sharedServices.obtenerAgenda(this.idEmpresa)
    .subscribe({
      next: rest => {
        const respuesta = rest.datos;
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
        this.horasAM = this.horas.filter(h => h.hora.includes('AM'));
        this.horasPM = this.horas.filter(h => h.hora.includes('PM'));
        this.seleccionarRecurso(fecha);
      }
    })
  }

}