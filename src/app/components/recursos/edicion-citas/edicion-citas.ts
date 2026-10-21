import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgendamientoService } from '../../../services/agendamiento.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Modal } from '../../../shared/services/modal';

@Component({
  selector: 'app-edicion-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './edicion-citas.html',
  styleUrl: './edicion-citas.css'
})
export class EdicionCitas {
  empresa: any = ''
  idEmpresa: number = 0;
  data = inject(MAT_DIALOG_DATA);
  serviciosDisponibles: any[] = [];
  serviciosSeleccionados: any[] = [];
  horariosDisponibles: any[] = [];
  busqueda: string = '';
  serviciosFiltrados: any[] = [];
  loading: boolean = true;
  loadingHorarios: boolean = false;
  horas: any[] = [];
  horaSeleccionada: string = '';
  fechaSeleccionada: Date = new Date();
  dialogRef = inject(MatDialogRef<EdicionCitas>);
  empresaRecursoMultiple: boolean = false;
  user: any = '';

  constructor(
    private sharedServices: SharedService,
    public modalService: Modal,
    private agendamientoService: AgendamientoService
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    this.fechaSeleccionada = new Date(this.data.fechaInicio);
    this.horaSeleccionada = this.data.hora ? this.data.hora : this.data.fechaInicio.split('T')[1];
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = this.empresa.id;
    this.empresaRecursoMultiple = this.empresa.recursoMultiple;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios(this.empresa);
  }

  public ordenarFechaCita(): Date {
    const fecha = new Date(this.fechaSeleccionada);

    const horaTexto = this.horaSeleccionada;

    // Separar hora y periodo
    const [horaMin, periodo] = horaTexto.split(' ');
    let [horas, minutos] = horaMin.split(':').map(Number);

    // Convertir a formato 24 horas
    if (periodo === 'PM' && horas !== 12) {
      horas += 12;
    }

    if (periodo === 'AM' && horas === 12) {
      horas = 0;
    }

    // Asignar hora
    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
  }

  public modificarCita() {
    this.loading = true;

    let alterno = this.serviciosSeleccionados
      .filter(s => s.alterno)
      .sort((a, b) => b.tiempo - a.tiempo);
    let noAlterno = this.serviciosSeleccionados
      .filter(s => !s.alterno)
      .sort((a, b) => b.tiempo - a.tiempo);


    let resultadoAlterno = alterno.map(a => ({
      FechaIni: this.formatearFecha(this.ordenarFechaCita()),
      recurso: a.recurso,
      Valor: a.valor,
      Hora: a.tiempo,
      servicios: [
        {
          servicio: a.id
        }
      ]
    }));
    let baseFecha = this.formatearFecha(this.ordenarFechaCita());
    let horaAlterno = 0;

    if (alterno.length > 0) {
      baseFecha = resultadoAlterno[0].FechaIni;
      horaAlterno = alterno[0].tiempo
    }

    let base = new Date(baseFecha);

    if (isNaN(base.getTime())) {
      throw new Error("baseFecha inválida: " + baseFecha);
    }

    // arrancan después del tiempo de alternos
    base.setMinutes(base.getMinutes() + horaAlterno);

    let resultadoNoAlterno = noAlterno.map(a => {
      const fechaInicio = new Date(base);

      const item = {
        FechaIni: this.formatearFecha(fechaInicio),
        recurso: a.recurso,
        Valor: a.valor,
        Hora: a.tiempo,
        servicios: [
          {
            servicio: a.id
          }
        ]
      };

      base.setMinutes(base.getMinutes() + a.tiempo);

      return item;
    });

    resultadoNoAlterno.forEach(element => {
      resultadoAlterno.push(element)
    });

    let request = {};

    if (this.empresaRecursoMultiple)
    {
      request = {
        FechaIni: this.formatearFecha(this.ordenarFechaCita()),
        empresa: this.idEmpresa,
        UsuarioCreacion: 'Usuario',
        fechaCreacion: this.formatearFecha(new Date()),
        citas: resultadoAlterno,
        Id: this.data.id,
        clienteInfo: {
          Telefono: this.data.telefonoCliente,
        },
      };
    }
    else
    {
      request = {
        FechaIni: this.formatearFecha(this.ordenarFechaCita()),
        empresa: this.idEmpresa,
        UsuarioCreacion: 'Usuario',
        fechaCreacion: this.formatearFecha(new Date()),
        citas: resultadoAlterno,
        Id: this.data.padre,
        clienteInfo: {
          Telefono: this.data.telefono,
        },
      };
    }

    this.agendamientoService.modificarCita(request)
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.modalService.success(
              rest.mensaje || 'Cita actualizada exitosamente!',
              () => { }
            );
          } else {
            this.modalService.error(rest.mensaje);
          }
          this.loading = false;
          this.dialogRef.close({
            actualizado: true
          });
        }, error: (err) => {
          this.modalService.error(err.mensaje);
          this.loading = false;
        }
      })
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
    this.data.hora = hora;
  }

  private obtenerHorarios(id: number) {
    this.sharedServices.obtenerAgenda(this.idEmpresa).subscribe({
      next: (rest) => {

        this.horas = rest.datos.map((hora: any) => {

          const [hh, mm] = hora.valor.split(':');

          let horas = parseInt(hh, 10);
          const ampm = horas >= 12 ? 'PM' : 'AM';

          horas = horas % 12;
          horas = horas ? horas : 12;

          return {
            ...hora,
            valorFormateado:
              `${String(horas).padStart(2, '0')}:${mm} ${ampm}`
          };
        });
      }
    })
  }

  filtrarServicios() {
    const texto = this.busqueda.toLowerCase();

    this.serviciosFiltrados = this.serviciosDisponibles.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto)
    );

  }

  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest) => {
        if (rest.exito) {
          if(this.empresaRecursoMultiple)
            this.serviciosDisponibles = rest.datos.filter((servicio: any) => servicio.recurso === this.user.id);
          else
            this.serviciosDisponibles = rest.datos;
          this.serviciosFiltrados = this.serviciosDisponibles;
          this.ordenarSeleccionados();
        }
      },
    });
  }

  private ordenarSeleccionados() {
    let serviciosSeleccionados: string[] = [];
    if(this.empresaRecursoMultiple)
    {
      serviciosSeleccionados = this.data.servicios.map(
        (s: any) => s.nombre
      );
    }
    else
    {
      serviciosSeleccionados = this.data.nombre
      .split(',')
      .map((s: string) => s.trim());
    }

    this.serviciosSeleccionados = this.serviciosDisponibles
      .filter((servicio: any) =>
        serviciosSeleccionados.includes(servicio.nombre)
      )
      .map((servicio: any) => ({
        nombre: servicio.nombre,
        tiempo: servicio.tiempo,
        valor: servicio.valor,
        recurso: servicio.recurso,
        id: servicio.id,
        alterno: servicio.alterno
      }));

    this.loading = false;
  }

  public cambioDia() {
    this.horariosDisponibles = [];
  }

  public agregarServicio(s: any) {
    this.serviciosSeleccionados.push(s);
    this.serviciosFiltrados = this.serviciosFiltrados.filter(
      (servicio: any) => servicio.id !== s.id
    );
    this.horariosDisponibles = [];
  }

  public eliminarServicio(s: any) {
    if(s.id === 52 || s.id === 51) {
      s.valor = 0;
    }
    this.serviciosFiltrados.push(s);
    this.serviciosSeleccionados = this.serviciosSeleccionados.filter(
      (servicio: any) => servicio.id !== s.id
    );
    this.horariosDisponibles = [];
  }

  public verHorariosDisponibles() {
    this.loadingHorarios = true;
    const request = {
      empresa: this.idEmpresa,
      FechaIni: this.formatearFechaLocal(this.fechaSeleccionada, '00:00:00'),
      fechaFin: this.formatearFechaLocal(this.fechaSeleccionada, '23:59:59'),
      profesional: [...new Set(
        this.serviciosSeleccionados
          .filter(s => s.recurso != null)
          .map(s => s.recurso)
      )].join(',')
    }
    this.agendamientoService.consultarAgendamientosEmpleado(request)
      .subscribe({
        next: (rest) => {
          this.horariosDisponibles = this.horas.filter(
            (hora: any) =>
              !rest.horasOcupadas.includes(hora.valorFormateado)
          );
          this.loadingHorarios = false;
        }
      })
  }

  formatearFechaLocal(fecha: Date, hora: string): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}`;
  }

  formatearFecha = (fecha: Date) => {
    return fecha.getFullYear() + '-' +
      String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
      String(fecha.getDate()).padStart(2, '0') + 'T' +
      String(fecha.getHours()).padStart(2, '0') + ':' +
      String(fecha.getMinutes()).padStart(2, '0') + ':' +
      String(fecha.getSeconds()).padStart(2, '0');
  };
}
