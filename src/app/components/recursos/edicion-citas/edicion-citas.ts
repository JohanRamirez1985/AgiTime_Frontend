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

  constructor(
    private sharedServices: SharedService,
    private agendamientoService: AgendamientoService
  ) { }

  ngOnInit() {
    this.fechaSeleccionada = new Date(this.data.fechaInicio);
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = this.empresa.id;
    this.obtenerServicios(this.idEmpresa);
    this.obtenerHorarios(this.empresa);
  }

  public modificarCita() {
    this.loading = true;
    this.dialogRef.close({
      actualizado: true
    });
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
          this.serviciosDisponibles = rest.datos;
          this.serviciosFiltrados = this.serviciosDisponibles;
          this.ordenarSeleccionados();
        }
      },
    });
  }

  private ordenarSeleccionados() {
    const serviciosSeleccionados = this.data.nombre
      .split(',')
      .map((s: string) => s.trim());

    this.serviciosSeleccionados = this.serviciosDisponibles
      .filter((servicio: any) =>
        serviciosSeleccionados.includes(servicio.nombre)
      )
      .map((servicio: any) => ({
        nombre: servicio.nombre,
        tiempo: servicio.tiempo,
        valor: servicio.valor,
        recurso: servicio.recurso
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
  }

  public eliminarServicio(s: any) {
    this.serviciosFiltrados.push(s);
    this.serviciosSeleccionados = this.serviciosSeleccionados.filter(
      (servicio: any) => servicio.id !== s.id
    );
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
}
