import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';

import { SharedService } from '../../../services/shared.service';
import { Usuario } from '../../../interfaces/shared.interface';
import { RouterModule } from '@angular/router';
import { Table } from '../../transversales/table/table';

interface tableUser {
  nombre: string;
  rol: string;
  estado: string;
  acciones: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    RouterModule,
    Table
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  filtro = '';
  rolSeleccionado = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  isMobileView = false;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading: boolean = true;
  idEmpresa: number = 0;
  usuario:any = {};
  columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'documento', label: 'Identificacion' },
    { key: 'sede', label: 'Sede' },
    { key: 'recurso', label: 'Recurso' },
  ];
  acciones: any[] = [
    {
      icon: 'edit',
      label: 'Editar usuario',
      action: (element: any) => this.editarProducto(element)
    },
  ];

  constructor(private sharedService: SharedService) {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    this.idEmpresa = info?.idEmpresa;
    this.consultarUsuarios();
  }


  ngOnInit() {
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
  }

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  filtrarUsuarios(valor: string) {
    const filtroLower = valor.toLowerCase().trim();
    this.usuariosFiltrados = this.usuarios.filter((user) =>
      user.nombre.toLowerCase().includes(filtroLower)
    );
  }

  public consultarUsuarios(): void {
    this.sharedService.obtenerUsuarios(this.idEmpresa).subscribe({
      next: (res) => {
        if (res.exito) {
          this.usuarios = res.datos;
          this.usuariosFiltrados = this.usuarios;

          this.dataSource.data = this.usuarios.filter((u) => {
            const texto = this.filtro.toLowerCase();
            const nombreCorreo =
              u.nombre.toLowerCase().includes(texto) ||
              u.correo.toLowerCase().includes(texto);

            const rolMatch = this.rolSeleccionado
              ? u.rol === this.rolSeleccionado
              : true;

            const fecha = new Date(u.fechaCreacion);
            const desde = this.fechaInicio ? new Date(this.fechaInicio) : null;
            const hasta = this.fechaFin ? new Date(this.fechaFin) : null;

            const fechaMatch =
              (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

            return nombreCorreo && rolMatch && fechaMatch;
          });

        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al obtener usuarios:', err);
      },
    });
  }

  onPageChange(event: PageEvent) {
    const paginaActual = event.pageIndex + 1; // Angular empieza en 0
    const tamañoPagina = event.pageSize;

    console.log('Página actual:', paginaActual);
    console.log('Tamaño de página:', tamañoPagina);

    // Llama al backend con paginación, si lo tienes preparado
    // this.consultarUsuarios(paginaActual, tamañoPagina);
  }

  editarProducto(producto: any): void {
    console.log('Editar producto:', producto);
    // Aquí abrir modal o redirigir a formulario
  }

  crearUsuario(): void {
    console.log('Crear usuario');
  }
}
