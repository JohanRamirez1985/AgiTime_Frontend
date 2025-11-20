import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InformesService } from '../../services/informes.service';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RolesContent } from '../../shared/libs/roles';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
})
export class Informes {
  form: FormGroup;
  tipoReporte: 'diario' | 'semanal' | null = null;
  idEmpresa: string | null = null;
  permitirSeleccion: boolean = true;
  loading: boolean = true;
  btnGenerarReporte: boolean = false;
  usuario: any;

  private intervalId: any;

  constructor(private fb: FormBuilder, private informeServie: InformesService) {
    this.form = this.fb.group({
      tipo: [null, Validators.required],
      fecha: [null],
      fechaInicio: [null],
      fechaFin: [null],
    });
  }

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuario = infoUser;
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.validarRol(infoUser);
    this.startBtnValidation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startBtnValidation() {
    this.intervalId = setInterval(() => {
      if (this.usuario?.rol === RolesContent.Empleado) {
        const tipo = this.form.get('tipo')?.value;
        const fecha = this.form.get('fecha')?.value;
        this.btnGenerarReporte = !!(tipo && fecha);
      } else {
        if (this.tipoReporte === 'diario') {
          const tipo = this.form.get('tipo')?.value;
          const fecha = this.form.get('fecha')?.value;
          this.btnGenerarReporte = !!(tipo && fecha);
        } else {
          const tipo = this.form.get('tipo')?.value;
          const fechaIni = this.form.get('fechaInicio')?.value;
          const fechaFin = this.form.get('fechaFin')?.value;
          this.btnGenerarReporte = !!(tipo && fechaIni && fechaFin);
        }
      }
    }, 1000);
  }

  private validarRol(usuario: any) {
    if (usuario.rol === RolesContent.Empleado) {
      this.permitirSeleccion = false;
      this.tipoReporte = 'diario';
      this.form.get('fecha')?.setValue(new Date());
      this.form.get('tipo')?.setValue(this.tipoReporte);
      this.btnGenerarReporte = true;
    }
    this.loading = false;
  }

  onTipoChange(tipo: 'diario' | 'semanal') {
    this.tipoReporte = tipo;
    this.form.patchValue({ fecha: null, fechaInicio: null, fechaFin: null });
  }

  generarReporte() {
    if (this.form.valid) {
      const tipoDiario = this.tipoReporte === 'diario';
      const request = this.createJson(tipoDiario);

      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espera unos segundos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.informeServie.generarInforme(request, tipoDiario).subscribe({
        next: (blob: Blob) => {
          Swal.close(); // cerrar loading

          if (blob && blob.size > 0) {
            // Crear URL temporal del archivo
            const fileURL = URL.createObjectURL(blob);

            // Abrir en una nueva pestaña
            if (blob.size != 80) {
              window.open(fileURL);
              Swal.fire({
                icon: 'success',
                title: 'Reporte generado',
                text: 'El reporte se ha abierto en una nueva pestaña.',
                confirmButtonColor: '#3085d6',
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No se generó ningún archivo para este rango.',
                confirmButtonColor: '#0d47a1',
              });
            }
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Sin datos',
              text: 'No se generó ningún archivo para este rango.',
              confirmButtonColor: '#0d47a1',
            });
          }
        },
        error: (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err.error?.mensaje || 'Error inesperado al generar el reporte.',
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  private createJson(diario: boolean) {
    if (diario) {
      const fecha = new Date(this.form.value.fecha);
      fecha.setHours(0, 0, 0, 0);

      const fechaString = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}T00:00:00`;

      return {
        emp: this.idEmpresa,
        fecha: fechaString,
        ...(this.usuario?.rol === 3 && { usuario: this.usuario.id }),
      };
    } else {
      const inicio = new Date(this.form.value.fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const inicioString = `${inicio.getFullYear()}-${String(
        inicio.getMonth() + 1
      ).padStart(2, '0')}-${String(inicio.getDate()).padStart(
        2,
        '0'
      )}T00:00:00`;

      const fin = new Date(this.form.value.fechaFin);
      fin.setHours(23, 59, 59, 999);
      const finString = `${fin.getFullYear()}-${String(
        fin.getMonth() + 1
      ).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}T23:59:59`;

      return {
        emp: this.idEmpresa,
        fechaInicio: inicioString,
        fechaFin: finString,
      };
    }
  }
}
