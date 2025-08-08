import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';
import { Toolbar } from '../../transversales/toolbar/toolbar';

@Component({
  selector: 'app-dashboardR',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    // ClienteAgendar
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardRecurso {
  citasHoy: any[] = [];
  totalServicios: number = 0;
  loading: boolean = true;
  user: any = '';
  empresa: any = '';
  day: Date = new Date();
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];
  horas: {hora: string, disponible: boolean}[] = [];
  idEmpresa: number = 0;
  mostrarAgenda: boolean = false;
  serviciosFiltrados: any[] = [];
  serviciosSeleccionados: any[] = [];

  constructor(private router: Router,
    private agendamientoServices: AgendamientoService,
    private sharedServices: SharedService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.consultarCitas(this.user, this.empresa, this.day);
    this.idEmpresa = this.empresa.id;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios();
  }

  reservarServicios(): void {

  }

  toggleSeleccionServicio(servicio: any): void {
    if (this.estaSeleccionado(servicio)) {
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(s => s.id !== servicio.id);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp)
    .subscribe({
      next: rest => {
        this.serviciosFiltrados = [...rest.datos];  
        this.loading = false;   
      }
    })
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
        this.seleccionarRecurso(this.day);
      }
    })
  }

  public seleccionarRecurso(fecha: Date): void {
    const request = {
      empresa: this.idEmpresa,
      FechaIni : this.formatearFechaLocal(fecha, '00:00:00'),
      fechaFin : this.formatearFechaLocal(fecha, '23:59:59'),
      recurso: this.user.id
    };
    
    this.agendamientoServices.consultarAgendamientos(request)
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
          this.verificarHoras();         
        }
      })
  }

  private esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
          fecha.getMonth() === hoy.getMonth() &&
          fecha.getFullYear() === hoy.getFullYear();
  }

  private verificarHoras(): void {
    const ahora = new Date();
    const fechaSeleccionada = this.day;

    const esHoy = this.esHoy(fechaSeleccionada);

    const horasFuturas = this.horas
      .map(h => ({ ...h, fecha: this.convertirHoraAFecha(h.hora, fechaSeleccionada) }))
      .filter(h =>
        esHoy
          ? h.fecha >= ahora
          : true
      );

    // Ordenar
    horasFuturas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    // Separar
    this.horasAM = horasFuturas.filter(h => h.hora.includes('AM'));
    this.horasPM = horasFuturas.filter(h => h.hora.includes('PM'));
    this.loading = false;
    this.cdr.detectChanges();
  }

  private convertirHoraAFecha = (horaStr: string, fechaBase: Date): Date => {
    const [tiempo, ampm] = horaStr.split(' ');
    let [hora, minutos] = tiempo.split(':').map(Number);

    if (ampm === 'PM' && hora !== 12) hora += 12;
    if (ampm === 'AM' && hora === 12) hora = 0;

    return new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      hora,
      minutos
    );
  };

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  private consultarCitas(user: any, empresa: any, fecha: Date): void {
    this.loading = true;
    const request = {
      empresa: empresa.id,
      FechaIni: this.formatearFechaLocal(fecha, '00:00:00'),
      FechaFin: this.formatearFechaLocal(fecha, '23:59:00'),
      recurso: user.id
    }
  
    this.agendamientoServices.consultarCitasRecurso(request)
    .subscribe({
      next: rest => {
        if(rest.exito) {
          this.citasHoy = rest.datos;
          const citasConTotales = this.citasHoy.map(cita => {
            const totalServicios = cita.servicios.reduce((acum: any, servicio: any) => acum + servicio.valor, 0);
            return {
              ...cita,
              totalServicios
            };
          });
          this.citasHoy = citasConTotales;          
        }else {
          this.citasHoy = [];
        } 
        this.loading = false;      
        this.cdr.detectChanges();  
      }
    })
  }

  public confirmarCita(cita: any) {
    Swal.fire({
      title: 'Confirmar Asistecia',
      html: `<p>¿El cliente <strong> ${cita.nombreCliente} </strong>  asistio a la cita?</p>`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive'
      }
    }).then((result) => {
      this.loading = true;
      const now = new Date(this.day);
      const fechaLocal = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      const request = {
        empresa: JSON.parse(localStorage.getItem('empresa') || '{}').id,
        Id: cita.id,
        Asistencia: result.isConfirmed
      }

      this.agendamientoServices.ConfirmarAsitenciaCita(request)
      .subscribe({
        next: rest => {
          this.consultarCitas(this.user, this.empresa, new Date(fechaLocal));
        }
      })
    })
  }

  abrirAgendar() {
    this.router.navigate(['/cliente/agendar']);
  }

  cancelarCita(cita: any) {
    const horaCita = new Date(cita.fechaInicio).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    
    Swal.fire({
      title: '¿Cancelar cita?',
      html: `<p>¿Estás seguro de cancelar la cita programada para las <strong> ${horaCita} </strong> de <strong> hoy </strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',
      customClass: {
        popup: 'swal-reserva-responsive'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const now = new Date(this.day);
        const fechaLocal = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + 'T' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

        const request = {
          empresa: JSON.parse(localStorage.getItem('empresa') || '{}').id,
          Id: cita.id,
          fechaCancelacion: fechaLocal,
          usuarioCancelacion: 'Usuario'
        }
        this.agendamientoServices.cancelarCita(request)
        .subscribe({
          next : rest => {
            if(rest.exito) {
              this.consultarCitas(this.user, this.empresa, new Date(fechaLocal));
            }            
          }
        })
        
      }
    })
  }

  public previus(cita: boolean): void {
    const nuevaFecha = new Date(this.day);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    if(cita) {
      this.day = nuevaFecha;
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    }else {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      nuevaFecha.setHours(0, 0, 0, 0);

      if (nuevaFecha < hoy) {
          Swal.fire({
            icon: 'error',
            title: 'Dia no habil',
            text: 'No puedes consultar dias anteriores',
          });
        }else {
          this.day = nuevaFecha;
          this.loading = true;
          this.obtenerHorarios();
        }
    }
    this.cdr.detectChanges();
  }

  public nextPeriod(cita: boolean): void {
    const nuevaFecha = new Date(this.day);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    this.day = nuevaFecha;
    this.day = nuevaFecha;
    if(cita) {
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    }else {
      this.loading = true;
      this.obtenerHorarios();
    }
    this.cdr.detectChanges();
  }

  public today(cita: boolean): void {
    const nuevaFecha = new Date();
    this.day = nuevaFecha;
    this.day = nuevaFecha;
    if(cita) {
      this.consultarCitas(this.user, this.empresa, nuevaFecha);
    }else {
      this.loading = true;
      this.obtenerHorarios();
    }
    this.cdr.detectChanges();
  }

  public seleccionarHora(hora: any): void {
    this.loading = true;
    const request = this.createJson(hora.hora);
    this.agendamientoServices.registrarCita(request)
    .subscribe({
      next: rest => {
        if(rest.exito) {
          Swal.fire({
            icon: 'success',
            title: '¡Cita creada!',
            text: rest.mensaje || 'La cita fue creado exitosamente',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok'
          }).then(() => {
            this.serviciosSeleccionados = [];
            this.mostrarAgenda = false;
            this.obtenerHorarios();
          });     
        }else {
          Swal.fire({
            icon: 'error',
            text: rest.mensaje || 'Error de servidor',
          });
        }
        this.loading = false;
   
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

  private createJson(hora: string) {
    const match = hora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const fechaBase = this.day.toISOString().split('T')[0];

    if(match) {
      let horas = parseInt(match[1], 10);
      const minutos = match[2];
      const periodo = match[3].toUpperCase();

      // Convertir a formato 24 horas
      if (periodo === 'PM' && horas < 12) {
          horas += 12;
        } else if (periodo === 'AM' && horas === 12) {
          horas = 0;
        }
      const horasStr = horas.toString().padStart(2, '0');
      const fechaFinal = `${fechaBase}T${horasStr}:${minutos}:00`;
      const now = new Date(this.day);
      const fechaLocal = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      const valor = this.serviciosSeleccionados.map(s => s.valor);
      const tiempoTotalServicio = this.serviciosSeleccionados.map(s => s.tiempo).reduce((a, b) => a + b, 0);
      const serviciosSeleccionados = this.serviciosSeleccionados.map(s => ({ servicio: s.id }));

      const costo = valor.reduce((a, b) => a + b, 0);


      const json = {
            "FechaIni": fechaFinal,
            "recurso": this.user.id,
            "Valor": costo,
            "UsuarioCreacion": "Usuario",
            "Hora": tiempoTotalServicio === 0  ? 30 : tiempoTotalServicio,
            "empresa": this.idEmpresa,
            "servicios": serviciosSeleccionados,
            "clienteInfo": null,
            "fechaCreacion": fechaLocal
      };      
        return json
    }else {
      return
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const index = event.index;
    this.day = new Date();
    this.mostrarAgenda = false;
    if (index === 0) {
      this.consultarCitas(this.user, this.empresa, this.day);
    }
    if (index === 1) {
      this.loading = true;
      this.obtenerHorarios();
    }
  }
}