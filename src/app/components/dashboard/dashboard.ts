import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SharedService } from '../../services/shared.service';
import {
  obtenerGeneros,
  obtenerRoles,
  obtenerSedes,
  obtenerTiposDocumentos,
} from '../../shared/libs/request-generales';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InformesService } from '../../services/informes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Modal } from '../../shared/services/modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  idEmpresa: string | null = null;
  recursos: any[] = [];
  fechaInicial: Date = (() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 7);
    return fecha;
  })();
  fechaFinal: Date = new Date();
  totalCitasNoConfirmadas: number = 0;
  totalCitasConfirmadas: number = 0;
  loading: boolean = true;
  btnConsultar: boolean = true;
  ocupado: number = 0;
  totalIngresos: number = 0;
  servicioMasVendido: string = '';
  private intervalId: any;
  chartIngresos: any = {
    series: [
      {
        name: 'Ingresos',
        data: [100, 250, 500, 700, 850, 1000]
      }
    ],

    chart: {
      type: 'area',
      height: 350,

      zoom: {
        enabled: false
      },

      toolbar: {
        show: false
      }
    },

    stroke: {
      curve: 'smooth'
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: [
        'Lun',
        'Mar',
        'Mie',
        'Jue',
        'Vie',
        'Sab'
      ]
    },

    tooltip: {
      theme: 'light'
    }
  };

  chartServicios: any = {
    series: [44, 25, 18, 13],

    chart: {
      type: 'donut',
      height: 350
    },

    labels: [
      'Barbería',
      'Uñas',
      'Cejas',
      'Masajes'
    ]
  };

  constructor(
    private sharedServices: SharedService,
    private informeService: InformesService,
    private modalService: Modal
  ) { }

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.startBtnValidation();
    this.obtenerDataLocalStorage();
    this.consultarDash();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public consultarDash(): void {
    this.loading = true;
    const fechaIni = new Date(this.fechaInicial);
    fechaIni.setHours(0, 0, 0, 0);

    const fechaFin = new Date(this.fechaFinal);
    fechaFin.setHours(23, 59, 59, 999);

    const request = {
      emp: this.idEmpresa,
      fechaIni: this.formatearFecha(fechaIni),
      fechaFin: this.formatearFecha(fechaFin)
    };

    this.informeService.infoDashboard(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.recursos = rest.datos.infoCitas;
          this.ocupado = rest.datos.porcentajeCitas;
          this.totalIngresos = rest.datos.totalIngresos;
          const servicios = rest.datos.porcentajeServicios;
          this.servicioMasVendido = servicios[0].servicio;
          const topServicios = servicios.slice(0, 6);
          const valorSemana = rest.datos.valorDiario;

          this.totalCitasConfirmadas = this.recursos.reduce(
            (total, recurso) => total + (recurso.totalCitasConfirmadas || 0),
            0
          );

          this.totalCitasNoConfirmadas = this.recursos.reduce(
            (total, recurso) => total + (recurso.totalCitasNoConfirmadas || 0),
            0
          );

          this.chartIngresos = {
            ...this.chartIngresos,

            series: [
              {
                name: 'Ingresos',
                data: valorSemana.map((x: any) => x.totalDia)
              }
            ],

            xaxis: {
              categories: valorSemana.map((x: any) =>
                this.traducirDia(x.dia)
              )
            }
          };

          this.chartServicios.labels =
            topServicios.map((x: any) => x.servicio);

          this.chartServicios.series =
            topServicios.map((x: any) => x.cantidad);
        } else {
          this.totalIngresos = 0;
          this.chartServicios.labels = [];
          this.chartServicios.series = [];
          this.chartIngresos.labels = [];
          this.chartIngresos.series = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.statusText);
        this.totalIngresos = 0;
        this.chartServicios.labels = [];
        this.chartServicios.series = [];
        this.chartIngresos.labels = [];
        this.chartIngresos.series = [];
        this.loading = false;
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    const h = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const s = String(fecha.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }

  private obtenerDataLocalStorage(): void {
    if (!this.idEmpresa) return;

    const configuraciones = [
      { key: 'generos', fetch: obtenerGeneros },
      { key: 'tiposDoc', fetch: obtenerTiposDocumentos },
      { key: 'roles', fetch: obtenerRoles },
      { key: 'sedes', fetch: obtenerSedes },
    ];

    configuraciones.forEach((config) => {
      if (!localStorage.getItem(config.key)) {
        config.fetch(this.sharedServices, this.idEmpresa!, (datos) => {
          localStorage.setItem(config.key, JSON.stringify(datos));
        });
      }
    });
  }

  private startBtnValidation() {
    this.intervalId = setInterval(() => {
      this.btnConsultar = !(this.fechaInicial && this.fechaFinal);
    }, 1000);
  }

  private traducirDia(dia: string): string {

    const dias: any = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom'
    };

    return dias[dia.toLowerCase()] || dia;
  }
}