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
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 20, 50];
  @Input() showPaginator = true;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** 🔹 Se ejecuta cuando cambian inputs */
  ngOnChanges() {

    this.dataSource.data = this.data ?? [];

    this.displayedColumns = this.columns.map(c => c.key);

    if (this.actions?.length) {
      this.displayedColumns.push('acciones');
    }

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

  }

  /** 🔹 Después de inicializar las vistas, conectamos el paginador */
  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}