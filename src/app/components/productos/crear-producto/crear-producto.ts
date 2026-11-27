
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

import { inventarioProductosService } from '../../../services/inventario-productos.service';

import Swal, { SweetAlertIcon } from 'sweetalert2';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-crear-producto',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ZXingScannerModule,
  ],

  templateUrl: './crear-producto.html',
  styleUrls: ['./crear-producto.css'],
})
export class CrearProducto implements OnInit {

  productoForm!: FormGroup;
  loading = true;
  viewDate: Date = new Date();
  camaraActiva = false;
  camarasDisponibles: MediaDeviceInfo[] = [];
  camaraSeleccionada?: MediaDeviceInfo;
  procesandoCodigo = false;
  idEmpresa: Number = 0;
  formatosPermitidos = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.ITF,
  ];
  activarCodigoBarras: boolean = false;

  constructor(
    private inventarioService: inventarioProductosService,
    private fb: FormBuilder,
    private router: Router,
    private sharedServices: SharedService
  ) {}

  ngOnInit(): void {

    const infoEmpresa = JSON.parse(
      localStorage.getItem('infoEmp') || '{}'
    );

    const infoUsuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    const idEmpresa = infoEmpresa?.idEmpresa;
    const idUsuario = infoUsuario?.id;
    this.idEmpresa = idEmpresa;

    const now = new Date(this.viewDate);

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

    if (!idEmpresa) {

      this.loading = false;

      this.ventanaMensaje(
        'error',
        'Mensaje',
        'Se produjo un error, por favor contactar al administrador de la aplicación.',
        false
      );

      return;
    }

    // Inicializar formulario
    this.productoForm = this.fb.group({

      Nombre: ['', Validators.required],

      Codigo: [''],

      PrecioVenta: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      Porcentaje: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      PrecioCosto: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      Cantidad: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      empresa: idEmpresa,
      UsuarioCreacion: idUsuario,
      FechaCreacion: fechaLocal,
    });
    this.obtenerRangoParametrizado();
    this.loading = false;
  }

  private obtenerRangoParametrizado(): void {

    this.sharedServices.parametros(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {

          this.activarCodigoBarras = rest.datos.find(
            (t: any) => t.tipo === 'LectorCodigo'
          )?.valor ?? false;

        } 
      }
    });
  }

  capturarCodigoPistola(event: Event): void {

    // Evita que Enter envíe el formulario
    event.preventDefault();

    const controlCodigo = this.productoForm.get('Codigo');

    const codigo = String(controlCodigo?.value || '').trim();

    if (!codigo) {
      return;
    }

    controlCodigo?.setValue(codigo);

    controlCodigo?.markAsDirty();

    controlCodigo?.markAsTouched();

    console.log('Código leído por pistola:', codigo);
  }

  // ==========================================
  // ABRIR Y CERRAR CÁMARA
  // ==========================================

  alternarCamara(): void {

    if (this.camaraActiva) {

      this.camaraActiva = false;

      this.procesandoCodigo = false;

      return;
    }

    this.camaraActiva = true;

    this.camarasDisponibles = [];

    this.camaraSeleccionada = undefined;
  }

  // ==========================================
  // DETECTAR CÁMARAS DISPONIBLES
  // ==========================================

  onCamerasFound(camaras: MediaDeviceInfo[]): void {

    this.camarasDisponibles = camaras;

    console.log('Cámaras disponibles:', camaras);

    if (camaras.length === 0) {
      return;
    }

    // Intentar seleccionar una cámara trasera
    const trasera = camaras.find(camara =>
      /back|rear|environment|trasera|posterior/i.test(camara.label)
    );

    this.camaraSeleccionada = trasera || camaras[0];
  }

  // ==========================================
  // CAMBIAR CÁMARA MANUALMENTE
  // ==========================================

  cambiarCamara(event: Event): void {

    const deviceId = (event.target as HTMLSelectElement).value;

    const camara = this.camarasDisponibles.find(
      c => c.deviceId === deviceId
    );

    if (camara) {
      this.camaraSeleccionada = camara;
    }
  }

  // ==========================================
  // RECIBIR CÓDIGO LEÍDO POR LA CÁMARA
  // ==========================================

  onCodeResult(codigo: string): void {

    if (!codigo || this.procesandoCodigo) {
      return;
    }

    this.procesandoCodigo = true;

    const codigoLimpio = codigo.trim();

    // Colocar el código en el formulario
    this.productoForm.get('Codigo')?.setValue(codigoLimpio);

    this.productoForm.get('Codigo')?.markAsDirty();

    this.productoForm.get('Codigo')?.markAsTouched();

    console.log('Código leído por cámara:', codigoLimpio);

    // Cerrar cámara después de leer
    this.camaraActiva = false;

    this.procesandoCodigo = false;

    Swal.fire({
      icon: 'success',
      title: 'Código leído',
      text: `Código: ${codigoLimpio}`,
      timer: 1200,
      showConfirmButton: false,
    });
  }

  // ==========================================
  // CUANDO NO SE ENCUENTRAN CÁMARAS
  // ==========================================

  onCamerasNotFound(): void {

    this.camaraActiva = false;

    Swal.fire({
      icon: 'warning',
      title: 'Cámara no encontrada',
      text: 'No fue posible encontrar una cámara disponible en este dispositivo.',
      confirmButtonText: 'Aceptar',
    });
  }

  // ==========================================
  // GUARDAR PRODUCTO
  // ==========================================

  guardarProducto(): void {

    if (this.productoForm.invalid || this.loading) {

      this.productoForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const nuevoProducto = this.productoForm.getRawValue();

    this.inventarioService.crearProducto(nuevoProducto).subscribe({

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
          err?.error?.mensaje ||
          err?.mensaje ||
          'Ocurrió un error al guardar el producto.',
          false
        );

      },

    });
  }

  // ==========================================
  // MENSAJES
  // ==========================================

  ventanaMensaje(
    icon: SweetAlertIcon,
    title: string,
    text: string,
    validador: boolean
  ): void {

    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok',
    }).then(() => {

      if (validador) {
        this.cancelar();
      }

    });
  }

  // ==========================================
  // CANCELAR
  // ==========================================

  cancelar(): void {

    this.camaraActiva = false;

    this.router.navigate(['admin/inventario']);
  }

}