import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ChangeDetectorRef, Component, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

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
    MatCardModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './cliente-agendar.html',
  styleUrl: './cliente-agendar.css'
})
export class ClienteAgendar {
  viewDate: Date = new Date();
  nombreDelRecurso: string = '';
  serviciosFiltrados: any[] = [];
  serviciosSeleccionados: any[] = [];
  idEmpresa: number = 0;
  horaInicioServicios: number = 0;
  horaFinServicios: number = 0;
  horas: {hora: string, disponible: boolean}[] = [];
  recursoInfo: { emp: number, id:number, nombre:string, sede: string, img: string} = {
    emp: 0,
    id: 0,
    nombre: '',
    sede: '',
    img: ''
  };
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  mostrarDisponibilidad: boolean = false;
  costo: number = 0;
  idRecurso: number = 0;
  fotoRecuerso: string = '';
  loading: boolean = true;
  mostrarDetalle: boolean = false;
  mostrarServicios: boolean = false;


  detallesRecurso: string[] = ['Disponible de 8:00 a.m.', 'corte + barba + ceja $30000', 'Recurso: Sala 3'];

  

    constructor(
    private sharedServices: SharedService,
    private agendaService: AgendamientoService,
    private cdr: ChangeDetectorRef,
    private router: Router
   
  ) {}

   ngOnInit() {
    this.recursoInfo = JSON.parse(localStorage.getItem('recurso') || '{"emp":0,"id":0,"nombre":"","sede":"", "img":""}');
    this.idRecurso = this.recursoInfo.id;
    this.nombreDelRecurso = this.recursoInfo.nombre;
    this.idEmpresa = this.recursoInfo.emp;
    this.fotoRecuerso = this.recursoInfo.img;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios();
  }

  reservarServicios(): void {
  this.detallesRecurso = this.serviciosSeleccionados.map(s =>   `${s.nombre} - ${new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(s.valor)}`);
  this.loading = false;
  this.mostrarDetalle = true;
  this.mostrarServicios = false;
  this.mostrarDisponibilidad = true;
}

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

toggleSeleccionServicio(servicio: any): void {
  if (this.estaSeleccionado(servicio)) {
    this.serviciosSeleccionados = this.serviciosSeleccionados.filter(s => s.id !== servicio.id);
  } else {
    this.serviciosSeleccionados.push(servicio);
  }
}

  public seleccionarHora(hora: any): void {

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

    const valor = this.serviciosSeleccionados.map(s => s.valor);
  
    this.costo = valor.reduce((a, b) => a + b, 0);
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
        <input type="text" id="correo" class="swal2-input" placeholder="Correo">
      `,
      confirmButtonText: 'Reservar',
      showCancelButton: true,
      customClass: {
        popup: 'swal-reserva-responsive'
      },
      preConfirm: () => {
        const celular = (document.getElementById('celular') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const correo = (document.getElementById('correo') as HTMLInputElement).value;

        // Validar celular: mínimo 7 dígitos, solo números
        if (!celular || !/^\d{7,}$/.test(celular)) {
          Swal.showValidationMessage('Ingresa un número de celular válido (mínimo 7 dígitos)');
          return false;
        }

        // Validar nombre: no vacío, solo letras y espacios (opcionalmente tildes)
        if (!nombre || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
          Swal.showValidationMessage('Ingresa un nombre válido (solo letras y espacios)');
          return false;
        }

        // Validar correo: formato estándar de email
        if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
          Swal.showValidationMessage('Ingresa un correo electrónico válido');
          return false;
        }

        return { celular, nombre, fecha: this.viewDate, hora: hora.hora, correo };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const datosReserva = result.value;
        this.loading = true;
        this.mostrarDisponibilidad = false;
        this.reservarCita(datosReserva, hora.hora);
      }
    });
    
  }

  volver(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresa } 
    });
  }

  private reservarCita(datos: { celular: string, nombre: string ,fecha: string, hora: string, correo: string }, hora: string) {
    const request = this.createJson(hora, datos);
    this.agendaService.registrarCita(request)
    .subscribe({
      next: rest => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cita creada!',
          text: rest.mensaje || 'La cita fue creado exitosamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.volver();
        });        
      },
      error: err => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: err.mensaje || 'Error de servidor',
        });
      }
    })    
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


  private createJson(hora : string, datos: { celular: string, nombre: string, fecha: string, hora: string, correo: string }) {
    const fechaBase = this.viewDate.toISOString().split('T')[0];
    const tiempoTotalServicio = this.serviciosSeleccionados.map(s => s.tiempo).reduce((a, b) => a + b, 0);
    const serviciosSeleccionados = this.serviciosSeleccionados.map(s => ({ servicio: s.id }));

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
                "FechaIni": fechaFinal,
                "recurso": this.idRecurso,
                "Valor": this.costo,
                "UsuarioCreacion": "Cliente",
                "Hora": tiempoTotalServicio,
                "empresa": this.idEmpresa,
                "servicios": serviciosSeleccionados,
                "clienteInfo": {
                  "Nombre": datos.nombre,
                  "Telefono": datos.celular,
                  "Correo": datos.correo
                }
          };
      
        return json
    } 
    else {
      return
    }
  }

  public nextPeriod(): void {
    this.viewDate = new Date(this.viewDate);
    this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.loading = true;
    this.cdr.detectChanges();
    this.obtenerHorarios();
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
      this.cdr.detectChanges();
      this.obtenerHorarios();
    }
  }

  public today(): void {
    this.viewDate = new Date();
    this.loading = false;
    this.obtenerHorarios();
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
            this.horas = this.horas.filter(h => h.disponible);
          }
          this.horasAM = this.horas.filter(h => h.hora.includes('AM'));
          this.horasPM = this.horas.filter(h => h.hora.includes('PM'));
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp)
    .subscribe({
      next: rest => {
        this.serviciosFiltrados = [...rest.datos];  
        this.loading = false;   
        this.mostrarServicios = true;   
      }
    })
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }


  public obtenerHorarios():void {
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
        this.seleccionarRecurso(this.viewDate);
      }
    })
  }

}