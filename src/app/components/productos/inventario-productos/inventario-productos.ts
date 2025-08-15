import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import { inventarioProductos } from '../../../interfaces/shared.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventario-productos',
  standalone: true,
  imports: [MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    CommonModule],
  templateUrl: './inventario-productos.html',
  styleUrls: ['./inventario-productos.css']
})
export class InventarioProductos {

  inventario: inventarioProductos[] = [];
  loading: boolean = true;
  inactiva: boolean = false;
  mensajeError: string = '';

  // Variables para la tabla
  displayedColumns: string[] = ['nombre', 'codigo', 'precio', 'stock'/*, 'acciones'*/];
  dataSource = new MatTableDataSource<any>([]);

  // Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Responsive
  isMobileView = false;

  constructor(
    private inventarioService:inventarioProductosService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.consultarProductos();
  }

  public consultarProductos(): void{
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      Swal.fire({
            icon: 'error',
            title: 'Mensaje',
            text: 'Se produjo un error, Por favor contactar al administrador de la aplicación.',
          });
      return;
    }

    const request = {
      emp:idEmpresa
    };
    this.loading = true;
    this.inventarioService.consultarProductos(request).subscribe({
      next: res => {
        if (res.exito){
          this.inventario = res.datos;
          //this.dataSource.data = res.datos;
        }else {
          Swal.fire({
            icon: 'warning',
            title: 'Mensaje',
            text: res.mensaje,
          });
        }
      },
        error: err => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.mensaje,
          });
        }
    })
  }
  
  crearProducto(): void {
    this.router.navigate(['admin/inventario/crear']);
  }

  editarProducto(producto: any): void {
    console.log('Editar producto:', producto);
    // Aquí abrir modal o redirigir a formulario
  }

  onPageChange(event: any): void {
    console.log('Cambio de página:', event);
    // Aquí manejar paginación con backend si aplica
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

}
