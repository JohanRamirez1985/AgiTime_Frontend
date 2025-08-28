import { Component, Input, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

/** 🔹 Interfaz para las columnas */
export interface Column {
  key: string;   // clave en el objeto de data (ej: 'nombre', 'correo')
  label: string; // encabezado mostrado en la tabla
}

/** 🔹 Interfaz para las acciones */
export interface Action {
  label: string;                  // texto visible o tooltip
  icon: string;                   // icono de Angular Material (ej: 'edit', 'delete')
  color?: string;                 // color del icono (primary, accent, warn)
  tooltip?: string;               // texto que aparece en el hover
  action: (element: any) => void; // función a ejecutar sobre el elemento
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './table.html',
  styleUrls: ['./table.css']
})
export class Table implements OnChanges, AfterViewInit {

  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() actions: Action[] = [];
  @Input() loading: boolean = false;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** 🔹 Se ejecuta cuando cambian inputs */
  ngOnChanges() {
    // Actualizamos los datos
    this.dataSource.data = this.data;

    // Columnas dinámicas
    this.displayedColumns = this.columns.map(c => c.key);

    // Agregamos la columna de acciones si existen
    if (this.actions && this.actions.length) {
      this.displayedColumns.push('acciones');
    }
  }

  /** 🔹 Después de inicializar las vistas, conectamos el paginador */
  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}