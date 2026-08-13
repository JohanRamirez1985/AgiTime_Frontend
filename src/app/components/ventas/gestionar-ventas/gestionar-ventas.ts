import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import { Column, Table } from '../../transversales/table/table';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditarVenta } from '../modal-editar-venta/modal-editar-venta';
import { Modal } from '../../../shared/services/modal';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-gestionar-ventas',
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
    Table,
    MatTooltipModule,
    MatDividerModule
  ],
  standalone: true,
  templateUrl: './gestionar-ventas.html',
  styleUrl: './gestionar-ventas.css'
})
export class GestionarVentas {

  isMobileView: boolean = false;
  consultaRealizada: boolean = false;
  idEmpresa: number = 0;
  rol: number = 0;
  idUser: number = 0;
  filtro: string = '';
  ventasFiltradas: any[] = [];
  ventas: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading: boolean = true;
  fechaInicial: Date | null = null;
  fechaFinal: Date | null = null;
  displayedColumns: Column[] = [];

  acciones: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;



  constructor(
    private gestionService: inventarioProductosService,
    private dialog: MatDialog,
    private modalService: Modal,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.inicializarVariables()
    this.inicializarVariablesTable();
  }

  private inicializarVariables(): void {
    this.fechaFinal = new Date();
    this.fechaInicial = new Date();
    this.fechaInicial.setDate(this.fechaInicial.getDate() - 7);
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;
    this.idEmpresa = idEmpresa;
    const infoUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = infoUser?.rol;
    const idUser = infoUser?.id;
    this.rol = rol;
    this.idUser = idUser;
  }

  private inicializarVariablesTable(): void {
    this.displayedColumns = [
      { key: 'producto', label: 'Producto' },
      { key: 'vendedor', label: 'Vendedor' },
      { key: 'fechaVenta', label: 'Fecha Venta' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'venta', label: 'Venta' },
      { key: 'descuento', label: 'Descuento' },
      { key: 'comision', label: 'Comisión' },
    ];

    if (this.rol !== 3) {
      this.displayedColumns.push(
        { key: 'costo', label: 'Costo' },
        { key: 'ganancia', label: 'Ganancia' }
      );

      this.acciones.push(
        {
          icon: 'edit',
          label: 'Editar venta',
          action: (element: any) => this.editarVenta(element),
        },
        {
          icon: 'delete',
          label: 'Eliminar venta',
          color: 'warn',
          action: (element: any) => this.eliminarVenta(element),
        }
      )

    }
  }

  async eliminarVenta(element: any): Promise<void> {
    await Swal.fire({
      title: '¿Eliminar venta?',
      html: `
      ¿Está seguro de eliminar la venta del día
      <strong>${element.fechaVenta}</strong>?
      <br><br>
      <small style="color:#d33">
        Esta acción no se puede deshacer.
      </small>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#a0aab4ff',

      // 🔹 Muestra el loading
      showLoaderOnConfirm: true,

      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {

          await firstValueFrom(
            this.gestionService.eliminarVenta(this.idEmpresa, element.id)
          );

        } catch (error) {

          Swal.showValidationMessage(
            'Ocurrió un error al eliminar la venta.'
          );

        }
      }
    }).then((result) => {

      if (result.isConfirmed) {

        Swal.fire({
          icon: 'success',
          title: 'Venta eliminada',
          text: 'La venta fue eliminada correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        this.consultarVentas();
      }

    });

  }

  public volver(): void {
    this.router.navigate(['/admin/venta']);
  }

  public editarVenta(element: any): void {
    const dialogRef = this.dialog.open(ModalEditarVenta, {
      width: '500px',
      disableClose: true,
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        // Actualizar la tabla
        this.consultarVentas();
      }

    });
  }

  public consultarVentas(): void {
    this.loading = true;
    const request: any = {
      emp: this.idEmpresa,
      fechaInicio: this.formatearFecha(this.fechaInicial!, false),
      fechaFin: this.formatearFecha(this.fechaFinal!, true)
    };

    if (this.rol === 3) {
      request.usuario = this.idUser;
    }

    this.gestionService.consultarVentas(request).subscribe({
      next: (resp) => {
        if (resp.exito) {

          this.ventasFiltradas = resp.datos.map((venta: any) => ({
            ...venta,
            fechaVenta: this.formatearFechaData(venta.fechaVenta)
          }));

        } else {
          this.ventasFiltradas = [];
        }

        this.loading = false;
        this.consultaRealizada = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.consultaRealizada = true;
        this.modalService.error(err.statusText)
        this.cdr.detectChanges();
      }
    });
  }

  private formatearFechaData(fecha: string): string {
    if (!fecha) return '';

    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatearFecha(fecha: Date, fin: boolean): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T${fin ? '23:59:59' : '00:00:00'}`;
  }

  public puedeConsultar(): boolean {
    const tieneNombre = this.filtro?.trim().length > 0;
    const tieneRangoFechas = !!this.fechaInicial && !!this.fechaFinal;

    return tieneNombre || tieneRangoFechas;
  }

  public filtrarVentas(valor: string) {
    const filtroLower = valor.toLowerCase().trim();
    this.ventasFiltradas = this.ventas.filter((user) =>
      user.nombre.toLowerCase().includes(filtroLower)
    );
  }

  ngOnInit() {
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.consultarVentas();
  }

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }
}