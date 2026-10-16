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
  selector: 'app-cliente-recordatorio',
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
  templateUrl: './cliente-recordatorio.html',
  styleUrl: './cliente-recordatorio.css'
})
export class ClienteRecordatorio {
  filtro = '';
  dias: number | null = 15;
  btnConsultar = false;
  rolSeleccionado = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  isMobileView = false;
  clienteRecordatorio: ClienteRegistro[] = [];
  clienteRecordatorioFiltrados: ClienteRegistro[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  private intervalId: any;

  columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'ultimaFechaAsistio', label: 'Fecha ultima visita' }
  ];
  
  idEmpresa: string | null = null;
  user: any;
  acciones: any[] = [
    { 
      icon: 'edit', 
      label: 'Envio Mensaje', 
      action: (element: any) => this.envioMensaje(element) 
    },
  ];
  
  constructor(
    private clienteServie: ClienteService
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
    this.startBtnValidation();
  }
  
  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  envioMensaje(recurso: any) {
    /*Swal.fire({
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
    });*/
  }

  private startBtnValidation() {
    this.intervalId = setInterval(() => {
      this.btnConsultar = !(this.dias);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  validarDias(): void {
  this.btnConsultar =
    this.dias === null ||
    !Number.isInteger(Number(this.dias)) ||
    Number(this.dias) < 1;
}
  
  public consultar(): void {
    this.consultarClientes();
  }

  public consultarClientes(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      console.warn('No se encontró ID de empresa en el localStorage');
      return;
    }

    this.loading = true;

    this.clienteServie.obtenerClienteRecordatorio(idEmpresa,Number(this.dias)).subscribe({
      next: res => {
        if (res.exito) {
          this.clienteRecordatorio = res.datos;
          this.clienteRecordatorioFiltrados = this.clienteRecordatorio;

          /*this.dataSource.data = this.clienteRecordatorio.filter(u => {
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
          });*/

          // this.dataSource.paginator = this.paginator;
        }

        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error al obtener cliente:', err);
      }
    });
  }

  filtrarCliente(valor: string) {
    console.log('Buscando:', valor);
    const filtroLower = valor.toLowerCase().trim();
    this.clienteRecordatorioFiltrados = this.clienteRecordatorio.filter(user =>
      user.nombre.toLowerCase().includes(filtroLower)
    );
  }
}
