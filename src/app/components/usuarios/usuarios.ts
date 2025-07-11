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
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';

import { SharedService } from '../../services/shared.service';
import { Usuario } from '../../interfaces/shared.interface';
import { RouterModule } from '@angular/router';

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
    RouterModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})

export class Usuarios implements AfterViewInit {
  filtro = '';
  rolSeleccionado = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private sharedService: SharedService) {
    this.consultarUsuarios();  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    // Aquí sí entra el evento cuando usas flechas
    this.paginator.page.subscribe(event => {
      this.onPageChange(event);  // ✅ Llama tu función de cambio de página
    });
  }

  public consultarUsuarios(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      console.warn('No se encontró ID de empresa en el localStorage');
      return;
    }

    this.loading = true;

    this.sharedService.obtenerUsuarios(idEmpresa).subscribe({
      next: res => {
        if (res.exito) {
          this.usuarios = res.datos;

          this.dataSource.data = this.usuarios.filter(u => {
            const texto = this.filtro.toLowerCase();
            const nombreCorreo = u.nombre.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto);

            const rolMatch = this.rolSeleccionado ? u.rol === this.rolSeleccionado : true;

            const fecha = new Date(u.fechaCreacion);
            const desde = this.fechaInicio ? new Date(this.fechaInicio) : null;
            const hasta = this.fechaFin ? new Date(this.fechaFin) : null;

            const fechaMatch =
              (!desde || fecha >= desde) &&
              (!hasta || fecha <= hasta);

            return nombreCorreo && rolMatch && fechaMatch;
          });

          this.dataSource.paginator = this.paginator;
        }

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error al obtener usuarios:', err);
      }
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


  crearUsuario(): void {
    console.log('Crear usuario');
  }
}
