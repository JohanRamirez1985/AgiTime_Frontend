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
  ],
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
})
export class Informes {
  form: FormGroup;
  tipoReporte: 'diario' | 'semanal' | null = null;
  idEmpresa: string | null = null;

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
    const id = info?.idEmpresa;
    this.idEmpresa = id;
  }

  onTipoChange(tipo: 'diario' | 'semanal') {
    this.tipoReporte = tipo;
    this.form.patchValue({ fecha: null, fechaInicio: null, fechaFin: null });
  }

  generarReporte() {
    if (this.form.valid) {
      const tipoDiario = this.tipoReporte === 'diario';
      const request = this.createJson(tipoDiario);

      // Mostrar loading
      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espera unos segundos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.informeServie.generarInforme(request, tipoDiario).subscribe({
        next: (blob) => {
          Swal.close(); // cerrar loading

          if (blob.exito) {
            const fileURL = URL.createObjectURL(blob);
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
              text: blob.mensaje,
              confirmButtonColor: '#0d47a1',
            });
          }
        },
        error: (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error.mensaje,
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  private createJson(diario: boolean) {
    if (diario) {
      const request = {
        emp: this.idEmpresa,
        fecha: this.form.value.fecha.toISOString(),
      };
      return request;
    } else {
      const request = {
        emp: this.idEmpresa,
        fechaInicio: this.form.value.fechaInicio.toISOString(),
        fechaFin: this.form.value.fechaFin.toISOString(),
      };
      return request;
    }
  }
}
