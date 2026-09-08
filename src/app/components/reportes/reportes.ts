import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InformesService } from '../../services/informes.service';
import { SharedService } from '../../services/shared.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Table } from '../transversales/table/table';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reportes',
  standalone: true,
  providers: [DatePipe],
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
    MatTableModule,
    Table

  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {

  form: FormGroup;
  idEmpresa: string | null = null;
  usuario: any;
  tipos: any[] = [];
  tipoReporte: any = null;
  columnas: any[] = [];
  datos: any[] = [];
  columnasMostrar: string[] = [];
  loading: boolean = true;
  loadingReporte: boolean = false;
  acciones: any[] = [];


  constructor(
    private fb: FormBuilder,
    private informeServie: InformesService,
    private sharedService: SharedService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      tipo: [
        null,
        Validators.required
      ]
    });
  }

  ngOnInit(): void {
    const info = JSON.parse(
      localStorage.getItem('infoEmp') || '{}'
    );

    const infoUser = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    this.usuario = infoUser;
    this.idEmpresa = info?.idEmpresa;
    this.obtenerTipos();
  }

  public exportarExcel(): void {

    const json = {
      empresa: this.idEmpresa,
      id: this.tipoReporte
    };

    Swal.fire({
      title: 'Generando reporte',
      text: 'Por favor espera mientras se genera el archivo Excel...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.informeServie.exportarReporte(json)
      .subscribe({
        next: (rest: Blob) => {
          const tipoReporte = this.tipos.find(t => t.id === this.tipoReporte);
          const fecha = new Date();
          const fechaFormateada =
            `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}` +
            `_${String(fecha.getHours()).padStart(2, '0')}-${String(fecha.getMinutes()).padStart(2, '0')}`;          
          const url = window.URL.createObjectURL(rest);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${tipoReporte?.nombre} - ${fechaFormateada}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            icon: 'success',
            title: 'Reporte generado',
            text: 'El reporte se descargó correctamente.',
            confirmButtonText: 'Aceptar'
          });

        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No fue posible generar el reporte.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  private obtenerTipos(): void {
    this.loading = true;
    this.sharedService
      .tipoReportes(this.idEmpresa)
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.tipos = rest.datos || [];
          } else {
            this.tipos = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.tipos = [];
          this.loading = false;
        }
      });
  }

  onTipoChange(tipo: any): void {
    this.tipoReporte = tipo;
    this.columnas = [];
    this.datos = [];
    this.columnasMostrar = [];
    this.loadingReporte = true;

    const json = {
      empresa: this.idEmpresa,
      id: tipo
    };

    this.informeServie
      .generarReporte(json)
      .subscribe({
        next: (rest) => {
          this.columnas = rest.columnas.map((c: any) => ({
            key: c,
            label: c
          }));


          this.datos = rest.datos.map((fila: any) => ({
            ...fila,
            UltimaVisita: this.datePipe.transform(
              fila.UltimaVisita,
              'dd/MM/yyyy hh:mm a'
            )
          }));

          this.columnasMostrar = [...this.columnas];
          this.loadingReporte = false;
        },
        error: (err) => {
          this.columnas = [];
          this.datos = [];
          this.columnasMostrar = [];
          this.loadingReporte = false;
        }
      });
  }
}