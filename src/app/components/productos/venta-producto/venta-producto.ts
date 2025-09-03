import { Component, OnInit } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-venta-producto',
  templateUrl: './venta-producto.html',
  styleUrl: './venta-producto.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
})
export class VentaProducto {
  numeroFactura: string = '';
  productoSeleccionado: any = null;
  cantidadProducto: number = 1;
  productoNombre: string = '';
  productosFiltrados: any[] = [];
  loading: boolean = true;
  productosDisponibles: any[] = [];
  productosPre: any[] = [];
  idEmpresa: any = null;
  idUsuario: any = null;

  columnasTabla: string[] = [
    'nombre',
    'cantidad',
    'valor',
    'total',
    'acciones',
  ];
  productosVenta = new MatTableDataSource<any>([]);
  esMovil: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private inventarioService: inventarioProductosService
  ) {}

  ngOnInit(): void {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.idEmpresa = infoEmpresa?.idEmpresa;
    this.idUsuario = infoUsuario?.id;
    this.productosFiltrados = this.productosDisponibles;
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.esMovil = result.matches;
      });
    this.consultarProductos();
  }

  public consultarProductos(): void {
    this.loading = true;
    if (!this.idEmpresa) {
      this.ventanaMensaje(
        'error',
        'Mensaje',
        'Se produjo un error, Por favor contactar al administrador de la aplicación.',
        false
      );
      this.loading = false;
      return;
    }

    const request = {
      emp: this.idEmpresa,
    };
    this.inventarioService.consultarProductos(request).subscribe({
      next: (res) => {
        if (res.exito) {
          this.loading = false;
          this.productosDisponibles = res.datos;
        } else {
          this.ventanaMensaje('warning', 'Mensaje', res.mensaje, false);
        }
      },
      error: (err) => {
        this.loading = false;
        this.ventanaMensaje('error', 'Error', err.mensaje, false);
      },
    });
  }

  filtrarProductos(): void {
    const filtro = this.productoNombre.toLowerCase();
    if (filtro.length > 1) {
      this.productosFiltrados = this.productosDisponibles.filter((p) =>
        p.nombre.toLowerCase().includes(filtro)
      );
    } else {
      this.productosFiltrados = [];
    }
  }

  seleccionarProducto(nombre: string): void {
    const seleccionado = this.productosDisponibles.find(
      (p) => p.nombre === nombre
    );
    this.productoSeleccionado = seleccionado;
  }

  guardarVenta(): void {
    // if (this.numeroFactura && this.numeroFactura.trim() !== '') {
    this.loading = true;
    const venta = {
      empresa: this.idEmpresa,
      factura: this.numeroFactura,
      fechaVenta: this.fechaActual(),
      usuarioVenta: this.idUsuario,
      Detalles: this.productosVenta.data,
    };
    this.inventarioService.ventaProducto(venta).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.exito) {
          this.ventanaMensaje('success', 'Producto creado', res.mensaje, true);
        } else {
          this.ventanaMensaje('warning', 'Mensaje', res.mensaje, false);
        }
      },
      error: (err) => {
        this.loading = false;
        this.ventanaMensaje('error', 'Error', err.mensaje, false);
      },
    });
    // } else {
    //   this.ventanaMensaje(
    //     'warning',
    //     'Mensaje',
    //     'El campo número de factura es obligatorio',
    //     false
    //   );
    // }
  }

  agregarProducto(): void {
    if (
      this.productoSeleccionado &&
      this.cantidadProducto > 0 &&
      this.cantidadProducto <= this.productoSeleccionado.stock
    ) {
      const existe = this.productosPre.find(
        (p) => p.id === this.productoSeleccionado.id
      );
      if (existe) {
        existe.cantidad += this.cantidadProducto;
        existe.total = existe.cantidad * existe.valor;
      } else {
        this.productosPre.push({
          id: this.productoSeleccionado.id,
          producto: this.productoSeleccionado.id,
          nombre: this.productoSeleccionado.nombre,
          cantidad: this.cantidadProducto,
          valor: this.productoSeleccionado.precio,
          total: this.cantidadProducto * this.productoSeleccionado.precio,
        });
      }
      this.productoNombre = '';
      this.productoSeleccionado = null;
      this.cantidadProducto = 1;
      this.productosVenta.data = [...this.productosPre];
    } else {
      this.ventanaMensaje(
        'warning',
        'Stock insuficiente',
        `Solo hay ${this.productoSeleccionado.stock} unidades disponibles.`,
        true
      );
    }
  }

  eliminarProducto(producto: any): void {
    this.productosPre = this.productosPre.filter((p) => p.id !== producto.id);
    this.productosVenta.data = [...this.productosPre];
  }

  ventanaMensaje(
    icon: string,
    title: string,
    text: string,
    validador: boolean
  ) {
    Swal.fire({
      icon: icon as SweetAlertIcon,
      title: title,
      text: text,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok',
    }).then(() => {
      validador ? this.limpiar() : null;
    });
  }

  fechaActual(): string {
    const now = new Date();
    const fechaLocal =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      'T' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    return fechaLocal;
  }

  limpiar(): void {
    this.numeroFactura = '';
    this.productoSeleccionado = null;
    this.cantidadProducto = 1;
    this.productoNombre = '';
    this.productosFiltrados = [];
    this.productosPre = [];
    this.productosVenta.data = [];
  }
}
