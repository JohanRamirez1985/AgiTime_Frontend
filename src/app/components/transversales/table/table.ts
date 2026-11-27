
import {
  Component,
  Input,
  ViewChild,
  OnChanges,
  AfterViewInit,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Column {
  key: string;
  label: string;
}

export interface Action {
  label: string;
  icon: string;
  color?: string;
  tooltip?: string;
  action: (element: any) => void;
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

  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() showPaginator: boolean = true;

  dataSource = new MatTableDataSource<any>([]);

  displayedColumns: string[] = [];

  private paginatorInstance!: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator) {
    if (paginator) {
      this.paginatorInstance = paginator;
      this.dataSource.paginator = paginator;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    // Actualizar información
    this.dataSource.data = this.data ?? [];

    // Actualizar columnas
    this.displayedColumns = (this.columns ?? []).map(
      column => column.key
    );

    // Agregar columna de acciones
    if (this.actions?.length) {
      this.displayedColumns.push('acciones');
    }

    // Actualizar paginador si ya existe
    if (this.paginatorInstance) {
      this.dataSource.paginator = this.paginatorInstance;
    }
  }

  ngAfterViewInit(): void {
    if (this.paginatorInstance) {
      this.dataSource.paginator = this.paginatorInstance;
    }
  }

}