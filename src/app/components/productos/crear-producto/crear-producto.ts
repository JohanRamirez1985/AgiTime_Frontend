import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field'; // opcional si no lo detecta
import { MatLabel } from '@angular/material/form-field';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './crear-producto.html',
  styleUrls: ['./crear-producto.css']
})
export class CrearProducto {

  productoForm!: FormGroup;
  loading: boolean = true;

  constructor(
    private inventarioService:inventarioProductosService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idEmpresa = infoEmpresa?.idEmpresa;
    const idUsuario = infoUsuario?.id;


    if (!idEmpresa) {
      Swal.fire({
            icon: 'error',
            title: 'Mensaje',
            text: 'Se produjo un error, Por favor contactar al administrador de la aplicación.',
          });
      return;
    }

    this.productoForm = this.fb.group({
      Nombre: ['', Validators.required],
      Codigo: ['', Validators.required],
      Precio: [null, [Validators.required, Validators.min(0)]],
      Cantidad: [null, [Validators.required, Validators.min(0)]],
      empresa: idEmpresa,
      UsuarioCreacion: idUsuario
    });
  }

  guardarProducto(): void {
    if (this.productoForm.valid) {
      const nuevoProducto = this.productoForm.value;
      this.inventarioService.crearProducto(nuevoProducto)
          .subscribe({
            next: rest => {
              this.loading = false;
              Swal.fire({
                icon: 'success',
                title: '¡Producto creado!',
                text: rest.mensaje || 'Producto creado exitosamente',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok'
              }).then(() => {
                this.cancelar();
              });        
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
  }

  cancelar(): void {
    this.router.navigate(['admin/inventario']);
  }
}
