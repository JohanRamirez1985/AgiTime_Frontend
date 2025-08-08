import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SharedService } from '../../services/shared.service';
import { obtenerGeneros, obtenerRoles, obtenerSedes, obtenerTiposDocumentos } from '../../shared/libs/request-generales';
import { DashboardRecurso } from '../recursos/dashboard/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard {
  idEmpresa: string | null = null;


  constructor( private sharedServices : SharedService ) {}


  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.obtenerDataLocalStorage();
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
