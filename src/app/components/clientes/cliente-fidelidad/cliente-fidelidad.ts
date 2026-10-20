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
import { ClienteRegistro } from '../../../interfaces/shared.interface';
import { SharedService } from '../../../services/shared.service';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClienteService } from '../../../services/cliente.service';
import { Table } from '../../transversales/table/table';

@Component({
  selector: 'app-cliente-fidelidad',
  imports: [CommonModule,
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
  templateUrl: './cliente-fidelidad.html',
  styleUrl: './cliente-fidelidad.css'
})
export class ClienteFidelidad {

  filtro = '';
  isMobileView = false;
  clientes: ClienteRegistro[] = [];
  clientesFiltrados: ClienteRegistro[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;

  columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'cantidad', label: 'Fidelidad' },
  ];
  
  idEmpresa: string | null = null;
  user: any;
  acciones: any[] = [
    { 
      icon: 'edit', 
      label: 'Editar cantidad de la fidelidad', 
      action: (element: any) => this.editarElemento(element) 
    },
  ];

  constructor(
    private sharedService: SharedService,
    private clienteServie: ClienteService,
  ) {

  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.consultarClientes();
  }

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  editarElemento(cliente: any) {
    Swal.fire({
      title: `${cliente.nombre}`,
      html: `
        <input id="cantidad" type="number" class="swal2-input" 
              placeholder="fidelidad" 
              value="${cliente.cantidad || ''}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const cantidad = (document.getElementById('cantidad') as HTMLInputElement).value;
        if (!cantidad) {
          Swal.showValidationMessage('Debes ingresar un valor de la fidelidad');
        }
        return { ...cliente, cantidad };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const actualizado = result.value.cantidad;
        const request = {
          empresa: Number(this.idEmpresa),
          Id: cliente.id,
          cantidad: actualizado,
          nombre: '',
          correo: '',
          telefono: '',
          fechaNacimiento: new Date().toISOString(),
          FechaCreacion: new Date().toISOString(),
        };

        this.clienteServie.editarFidelidad(request).subscribe({
          next: (rest: any) => {
            if (rest.exito) {
              Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: rest.mensaje || 'La fidelidad se actualizó correctamente',
                timer: 2500,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: rest.mensaje || 'No se pudo actualizar la fidelidad',
              });
            }
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un problema al actualizar la fidelidad',
            });
          }
        });
      }
    });
  }

  public consultarClientes(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      console.warn('No se encontró ID de empresa en el localStorage');
      return;
    }

    this.loading = true;

    this.clienteServie.obtenerClienteFidelidad(idEmpresa).subscribe({
      next: res => {
        this.clientes = [];
        this.clientesFiltrados = [];
        this.dataSource.data = [];
        if (res.exito && res.datos) {
          this.clientes = res.datos.sort((a: any, b: any) => b.cantidad - a.cantidad);
          this.clientesFiltrados = this.clientes;
          this.dataSource.data = res.datos;
        }

        this.loading = false;
      },
      error: err => {
        this.clientes = [];
        this.clientesFiltrados = [];
        this.dataSource.data = [];
        this.loading = false;
        console.error('Error al obtener los clientes:', err);
      }
    });
  }

  filtrarCliente(valor: string) {
    console.log('Buscando:', valor);
    const filtroLower = valor.toLowerCase().trim();
    this.clientesFiltrados = this.clientes.filter(cli =>
      cli.nombre.toLowerCase().includes(filtroLower)
    );
  }
}