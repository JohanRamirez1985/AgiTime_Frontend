import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './agregar-producto.html',
  styleUrl: './agregar-producto.css'
})
export class AgregarProducto {
  productoForm!: FormGroup;
  loading: boolean = true;
  viewDate: Date = new Date();
  producto: any;

  constructor(
    private inventarioService: inventarioProductosService,
    private fb: FormBuilder,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.producto = navigation?.extras?.state?.['data'];
  }

  ngOnInit(): void {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idEmpresa = infoEmpresa?.idEmpresa;
    const idUsuario = infoUsuario?.id;
    const now = new Date(this.viewDate);
    const fechaLocal = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');


    if (!idEmpresa) {
      this.ventanaMensaje('error', 'Mensaje', 'Se produjo un error, Por favor contactar al administrador de la aplicación.', false);
      return;
    }

    this.productoForm = this.fb.group({
      Cantidad: [null, [Validators.required, Validators.min(0)]],
      PrecioCosto: [null, [Validators.required, Validators.min(0)]],
      empresa: idEmpresa,
      UsuarioCreacion: idUsuario,
      FechaCreacion: fechaLocal,
      Id: this.producto.id
    });

    this.loading = false;
  }

  guardar(): void {
    if (this.productoForm.valid) {
      this.loading = true;
      const nuevoProducto = this.productoForm.value;
      this.inventarioService.agregarProducto(nuevoProducto)
        .subscribe({
          next: res => {
            this.loading = false;
            if (res.exito) {
              this.ventanaMensaje('success', 'Inventario actualizado', res.mensaje, true);
            } else {
              this.ventanaMensaje('warning', 'Mensaje', res.mensaje, false);
            }

          },
          error: err => {
            this.loading = false;
            this.ventanaMensaje('error', 'Error', err.mensaje, false);
          }
        })
    }
  }

  ventanaMensaje(icon: string, title: string, text: string, validador: boolean) {
    Swal.fire({
      icon: icon as SweetAlertIcon,
      title: title,
      text: text,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok'
    }).then(() => {
      validador ? this.cancelar() : null;
    });
  }

  cancelar(): void {
    this.router.navigate(['admin/inventario']);
  }
}
