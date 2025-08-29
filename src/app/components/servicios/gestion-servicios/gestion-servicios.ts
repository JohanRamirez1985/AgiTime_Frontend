import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Table } from '../../transversales/table/table';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-servicios',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    Table,
  ],
  templateUrl: './gestion-servicios.html',
  styleUrl: './gestion-servicios.css',
})
export class GestionServicios {
  inactiva: boolean = false;
  mensajeError: string = '';
  filtro = '';
  isMobileView = false;
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  loading = false;
  user: any;
  idEmpresa: string | null = null;
  columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'valor', label: 'Valor' },
    { key: 'tiempo', label: 'Tiempo' },
    { key: 'nombreSede', label: 'Sede' },
    { key: 'estado', label: 'Estado' },
    { key: 'esPago', label: 'Es pago' },
    { key: 'orden', label: 'Orden' },
  ];

  acciones: any[] = [
    {
      icon: 'edit',
      label: 'Editar usuario',
      action: (element: any) => this.editarElemento(element),
    },
  ];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.consultarServicios();
  }

  public crearServicio(): void {}

  public filtrarServicio(valor: string) {}

  public consultarServicios(): void {
    this.loading = true;
    const request = {
      emp: this.idEmpresa,
    };
    this.userService.obtenerServicios(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.servicios = rest.datos.map((item: any) => {
            return {
              ...item,
              esPago: item.esPago ? 'Si' : 'No',
            };
          });
          this.serviciosFiltrados = this.servicios;
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: rest.mensaje,
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.mensaje,
        });
      },
    });
  }

  private checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  public editarElemento(recurso: any) {
    this.router.navigate(['/admin/servicios/editar'], {
      state: { data: recurso },
    });
  }
}
