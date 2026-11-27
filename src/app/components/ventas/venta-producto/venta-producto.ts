
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import { ProductosModal } from '../../productos/productos-modal/productos-modal';
import { SharedService } from '../../../services/shared.service';


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
    RouterLink,
    ZXingScannerModule
  ]
})

export class VentaProducto implements OnInit {

  // Datos de la venta
  numeroFactura: string = '';
  productoSeleccionado: any = null;
  cantidadProducto: number = 1;
  productoNombre: string = '';
  productosFiltrados: any[] = [];
  loading: boolean = false;
  productosDisponibles: any[] = [];
  productosPre: any[] = [];
  idEmpresa: any = null;
  idUsuario: any = null;
  usuariosSinComision: string = '';
  codigoBarras: string = '';
  camaraActiva: boolean = false;
  procesandoCodigo: boolean = false;
  activarCodigoBarras: boolean = false;
  formatosPermitidos = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR
  ];
  columnasTabla: string[] = [
    'nombre',
    'cantidad',
    'comision',
    'valor',
    'total',
    'descuento',
    'acciones'
  ];
  productosVenta = new MatTableDataSource<any>([]);
  esMovil: boolean = false;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private inventarioService: inventarioProductosService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private sharedServices: SharedService
  ) { }


  ngOnInit(): void {

    const infoEmpresa = JSON.parse(
      localStorage.getItem('infoEmp') || '{}'
    );

    const infoUsuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    this.idEmpresa = infoEmpresa?.idEmpresa;
    this.idUsuario = infoUsuario?.id;
    this.productosFiltrados = this.productosDisponibles;
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.esMovil = result.matches;
      });

    this.obtenerRangoParametrizado();
    this.consultarProductos();
  }

  private obtenerRangoParametrizado(): void {

    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          const comision = rest.datos.find(
            (t: any) => t.tipo === 'ComisionVenta'
          )?.valor;

          this.usuariosSinComision = comision || '';

          this.activarCodigoBarras = rest.datos.find(
            (t: any) => t.tipo === 'LectorCodigo'
          )?.valor ?? false;

        } else {
          this.usuariosSinComision = '';
        }
      },
      error: () => {
        this.usuariosSinComision = '';
      }
    });
  }

  public consultarProductos(): void {
    this.loading = true;
    if (!this.idEmpresa) {
      this.ventanaMensaje(
        'error',
        'Mensaje',
        'Se produjo un error. Por favor contactar al administrador de la aplicación.',
        false
      );
      this.loading = false;
      return;
    }

    const request = {
      emp: this.idEmpresa
    };

    this.inventarioService.consultarProductos(request).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.exito) {
          this.productosDisponibles = res.datos || [];
          this.productosFiltrados = this.productosDisponibles;
        } else {
          this.ventanaMensaje(
            'warning',
            'Mensaje',
            res.mensaje,
            false
          );
        }
      },
      error: (err) => {
        this.loading = false;
        this.ventanaMensaje(
          'error',
          'Error',
          err.mensaje || 'No fue posible consultar los productos.',
          false
        );
      }
    });
  }

  alternarCamara(): void {
    this.camaraActiva = !this.camaraActiva;
  }

  onCodeResult(codigo: string): void {
    if (!codigo || this.procesandoCodigo) {
      return;
    }
    this.camaraActiva = false;
    this.codigoBarras = codigo.trim();
    this.buscarPorCodigoBarras();
  }

  onCamerasNotFound(): void {
    this.camaraActiva = false;
    Swal.fire({
      icon: 'warning',
      title: 'Cámara no encontrada',
      text: 'No se encontró una cámara disponible en este dispositivo.'
    });
  }

  async buscarPorCodigoBarras(): Promise<void> {
    const codigo = this.codigoBarras.trim();
    if (!codigo || this.procesandoCodigo) {
      return;
    }

    this.procesandoCodigo = true;
    try {
      const producto = this.productosDisponibles.find((p: any) => {
        return String(p.codigoBarras ?? '').trim() === codigo;
      });

      if (!producto) {
        await Swal.fire({
          icon: 'warning',
          title: 'Producto no encontrado',
          text: `No existe un producto registrado con el código ${codigo}.`
        });

        return;

      }

      this.productoSeleccionado = producto;
      this.productoNombre = producto.nombre;
      this.cantidadProducto = 1;
      await this.agregarProducto();

    } finally {

      this.codigoBarras = '';
      this.procesandoCodigo = false;
      this.cdr.detectChanges();
    }

  }

  filtrarProductos(): void {

    const filtro = this.productoNombre.toLowerCase();
    if (filtro.length > 1) {
      this.productosFiltrados = this.productosDisponibles.filter(
        (p) => p.nombre.toLowerCase().includes(filtro)
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

  async agregarProducto(): Promise<void> {

    if (!this.productoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un producto',
        text: 'Debe seleccionar un producto antes de agregarlo.'
      });

      return;
    }

    if (!this.cantidadProducto || this.cantidadProducto <= 0) {

      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Ingrese una cantidad mayor a cero.'
      });

      return;

    }

    let descuento = 0;
    let porcentaje = 0;

    const respuesta = await Swal.fire({
      title: '¿Aplicar descuento?',
      text: '¿Desea aplicar un descuento a este producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });


    if (respuesta.isConfirmed) {

      const resultadoDescuento = await Swal.fire({
        title: 'Descuento',
        input: 'number',
        inputLabel: 'Ingrese el valor del descuento',
        inputPlaceholder: 'Ej: 5000',
        inputAttributes: {
          min: '0'
        },
        showCancelButton: true,
        confirmButtonText: 'Aplicar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (value === '' || Number(value) < 0) {
            return 'Ingrese un descuento válido.';
          }
          return null;
        }
      });


      if (resultadoDescuento.isConfirmed) {
        descuento = Number(resultadoDescuento.value) || 0;
        porcentaje =
          this.cantidadProducto *
          this.productoSeleccionado.porcentaje;

        if (porcentaje >= descuento) {
          porcentaje = porcentaje - descuento;
        } else {
          porcentaje = 0;
        }
      } else {
        return;
      }

    } else {
      porcentaje =
        this.cantidadProducto *
        this.productoSeleccionado.porcentaje;
    }


    if (
      this.productoSeleccionado &&
      this.cantidadProducto > 0 &&
      this.cantidadProducto <= this.productoSeleccionado.stock
    ) {

      const existe = this.productosPre.find(
        p => p.id === this.productoSeleccionado.id
      );

      const totalSinDescuento =
        this.cantidadProducto *
        this.productoSeleccionado.precioVenta;

      const totalConDescuento =
        totalSinDescuento - descuento;

      if (descuento >= totalSinDescuento) {
        await Swal.fire({
          icon: 'warning',
          title: 'Descuento inválido',
          text: `El descuento debe ser menor a $${totalSinDescuento.toLocaleString()}`
        });
        return;
      }

      if (
        this.usuariosSinComision
          .split(',')
          .map(Number)
          .includes(Number(this.idUsuario))
      ) {
        porcentaje = 0;
      }

      if (existe) {
        existe.cantidad += this.cantidadProducto;
        existe.total =
          (existe.cantidad * existe.precioVenta) - descuento;

        existe.descuento += descuento;
        existe.porcentaje += porcentaje;

      } else {

        this.productosPre.push({
          id: this.productoSeleccionado.id,
          producto: this.productoSeleccionado.id,
          nombre: this.productoSeleccionado.nombre,
          cantidad: this.cantidadProducto,
          porcentaje: porcentaje,
          precioVenta: this.productoSeleccionado.precioVenta,
          descuento: descuento,
          total: totalConDescuento
        });

      }


      // Limpiar selección
      this.productoNombre = '';
      this.productoSeleccionado = null;
      this.cantidadProducto = 1;
      this.productosVenta.data = [...this.productosPre];
      this.cdr.detectChanges();
    } else {
      this.ventanaMensaje(
        'warning',
        'Stock insuficiente',
        `Solo hay ${this.productoSeleccionado?.stock} unidades disponibles.`,
        false
      );
    }
  }

  eliminarProducto(producto: any): void {

    this.productosPre = this.productosPre.filter(
      (p) => p.id !== producto.id
    );

    this.productosVenta.data = [...this.productosPre];
    this.cdr.detectChanges();
  }

  public verProductos(): void {
    const esMovil = window.innerWidth < 768;
    this.dialog.open(ProductosModal, {
      width: esMovil ? '98vw' : '90%',
      maxWidth: esMovil ? '98vw' : '1200px',
      height: esMovil ? '90vh' : '80vh'
    });
  }

  guardarVenta(): void {

    if (this.productosVenta.data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Venta vacía',
        text: 'Agregue al menos un producto.'
      });
      return;
    }

    this.loading = true;

    const venta = {
      empresa: this.idEmpresa,
      factura: this.numeroFactura,
      fechaVenta: this.fechaActual(),
      usuarioVenta: this.idUsuario,
      Detalles: this.productosVenta.data
    };

    this.inventarioService.ventaProducto(venta).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.exito) {
          this.ventanaMensaje(
            'success',
            'Producto creado',
            res.mensaje,
            true
          );
        } else {
          this.ventanaMensaje(
            'warning',
            'Mensaje',
            res.mensaje,
            false
          );
        }
      },
      error: (err) => {
        this.loading = false;
        this.ventanaMensaje(
          'error',
          'Error',
          err.mensaje || 'No fue posible guardar la venta.',
          false
        );
      }
    });

  }

  ventanaMensaje(
    icon: string,
    title: string,
    text: string,
    validador: boolean
  ): void {
    Swal.fire({
      icon: icon as SweetAlertIcon,
      title: title,
      text: text,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok'
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
    this.codigoBarras = '';
    this.camaraActiva = false;
    this.productosFiltrados = [];
    this.productosPre = [];
    this.productosVenta.data = [];
    this.cdr.detectChanges();
  }
}