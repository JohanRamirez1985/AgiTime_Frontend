import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../../interfaces/shared.interface';
import { SharedService } from '../../../services/shared.service';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../services/user.service';
import { Table } from '../../transversales/table/table';

@Component({
  selector: 'app-gestionar-porcentaje',
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
    MatTooltipModule,
    Table
  ],
  templateUrl: './gestionar-porcentaje.html',
  styleUrl: './gestionar-porcentaje.css'
})

export class GestionarPorcentaje {

  filtro = '';
  rolSeleccionado = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  isMobileView = false;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;

  columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'estado', label: 'Estado' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'documento', label: 'Identificacion' },
    { key: 'sede', label: 'Sede' },
  ];
  
  idEmpresa: string | null = null;
  user: any;
  acciones: any[] = [
    { 
      icon: 'edit', 
      label: 'Editar usuario', 
      action: (element: any) => this.editarElemento(element) 
    },
  ];



  constructor(
    private sharedService: SharedService,
    private userServie: UserService
  ) {

  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.consultarUsuarios();
  }






  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  editarElemento(recurso: any) {
    Swal.fire({
      title: `${recurso.nombre}`,
      html: `
        <input id="porcentaje" type="number" class="swal2-input" 
              placeholder="Porcentaje" 
              value="${recurso.porcentaje || ''}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const porcentaje = (document.getElementById('porcentaje') as HTMLInputElement).value;
        if (!porcentaje) {
          Swal.showValidationMessage('Debes ingresar un porcentaje');
        }
        return { ...recurso, porcentaje };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const actualizado = result.value.porcentaje;
        const request = {
          empresa: this.idEmpresa,
          Id: this.user.id,
          Porcentaje: actualizado
        };

        this.userServie.editarPorcentaje(request).subscribe({
          next: (rest: any) => {
            if (rest.exito) {
              Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: rest.mensaje || 'El porcentaje se actualizó correctamente',
                timer: 2500,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: rest.mensaje || 'No se pudo actualizar el porcentaje',
              });
            }
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un problema al actualizar el porcentaje',
            });
          }
        });
      }
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
          this.usuarios = res.datos.filter(r => r.recurso);
          this.usuariosFiltrados = this.usuarios;

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

          // this.dataSource.paginator = this.paginator;
        }

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  filtrarUsuarios(valor: string) {
    console.log('Buscando:', valor);
    const filtroLower = valor.toLowerCase().trim();
    this.usuariosFiltrados = this.usuarios.filter(user =>
      user.nombre.toLowerCase().includes(filtroLower)
    );
  }

  editarProducto(producto: any): void {
    console.log('Editar producto:', producto);
    // Aquí abrir modal o redirigir a formulario
  }

}
