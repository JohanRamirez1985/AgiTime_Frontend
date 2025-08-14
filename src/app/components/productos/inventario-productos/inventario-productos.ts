import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

// Modelo de producto (ajusta según tu API)
interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
}

@Component({
  selector: 'app-inventario-productos',
  standalone: true,
  imports: [NgIf,NgFor,MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    CommonModule],
  templateUrl: './inventario-productos.html',
  styleUrls: ['./inventario-productos.css']
})
export class InventarioProductos implements OnInit {

  // Variables para la tabla
  displayedColumns: string[] = ['nombre', 'categoria', 'precio', 'acciones'];
  dataSource = new MatTableDataSource<Producto>([]);

  // Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Responsive
  isMobileView = false;

  ngOnInit(): void {
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());

    // Cargar datos de prueba o desde API
    this.dataSource.data = [
      { id: 1, nombre: 'Producto A', categoria: 'Categoría 1', precio: 12000 },
      { id: 2, nombre: 'Producto B', categoria: 'Categoría 2', precio: 25000 },
      { id: 3, nombre: 'Producto C', categoria: 'Categoría 1', precio: 18000 }
    ];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

}
