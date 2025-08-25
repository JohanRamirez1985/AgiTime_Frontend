import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SharedService } from '../../services/shared.service';
import { obtenerGeneros, obtenerRoles, obtenerSedes, obtenerTiposDocumentos } from '../../shared/libs/request-generales';
import { DashboardRecurso } from '../recursos/dashboard/dashboard';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard {
  idEmpresa: string | null = null;
   recursos = [
    { nombre: 'Juan Pérez', totalServicios: 1200000 },
    { nombre: 'María López', totalServicios: 850000 },
    { nombre: 'Carlos Gómez', totalServicios: 450000 },
    { nombre: 'Ana Torres', totalServicios: 670000 },
  ];
  fechaSeleccionada: Date = new Date();


  constructor( private sharedServices : SharedService ) {}


  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.obtenerDataLocalStorage();
  }

  public consultar(): void {

  }

  private obtenerDataLocalStorage(): void {
    if (!this.idEmpresa) return;

    const configuraciones = [
      { key: 'generos',     fetch: obtenerGeneros },
      { key: 'tiposDoc',    fetch: obtenerTiposDocumentos },
      { key: 'roles',       fetch: obtenerRoles },
      { key: 'sedes',       fetch: obtenerSedes },
    ];

    configuraciones.forEach(config => {
      if (!localStorage.getItem(config.key)) {
        config.fetch(this.sharedServices, this.idEmpresa!, datos => {
          localStorage.setItem(config.key, JSON.stringify(datos));
        });
      }
    });
  }
}
