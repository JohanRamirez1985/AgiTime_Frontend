import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { inventarioProductosService } from '../../../services/inventario-productos.service';

@Component({
  selector: 'app-productos-modal',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './productos-modal.html',
  styleUrl: './productos-modal.css'
})
export class ProductosModal
  implements OnInit, AfterViewInit {

  columnas: string[] = [
    'nombre',
    'precioVenta',
    'comision',
    'stock'
  ];
  idEmpresa: any = null;
  idUsuario: any = null;

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private productoService: inventarioProductosService
  ) { }

  ngOnInit(): void {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.idEmpresa = infoEmpresa?.idEmpresa;
    this.idUsuario = infoUsuario?.id;
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProductos(): void {
    const request = {
      emp: this.idEmpresa,
    };
    this.productoService.consultarProductos(request).subscribe(resp => {

      this.dataSource.data = resp.datos;

    });
  }

  aplicarFiltro(event: Event): void {

    const filtro = (event.target as HTMLInputElement)
      .value;

    this.dataSource.filter =
      filtro.trim().toLowerCase();
  }
}
