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
import { DashboardRecurso } from '../recursos/dashboard/dashboard';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InformesService } from '../../services/informes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  idEmpresa: string | null = null;
  recursos: any[] = [];
  fechaSeleccionada: Date = new Date();
  totalCitasNoConfirmadas: number = 0;
  totalCitasConfirmadas: number = 0;
  loading: boolean = true;

  constructor(
    private sharedServices: SharedService,
    private informeService: InformesService
  ) {}

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.obtenerDataLocalStorage();
    this.consultarDash();
  }

  public consultarDash(): void {
    this.loading = true;
    const fecha = new Date(this.fechaSeleccionada);
    fecha.setHours(0, 0, 0, 0);

    const request = {
      emp: this.idEmpresa,
      fecha: fecha.toISOString(),
    };

    this.informeService.infoDashboard(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.recursos = rest.datos;
        } else {
        }
        this.loading = false;
      },
    });
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
}
