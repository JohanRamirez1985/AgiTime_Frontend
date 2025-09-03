import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { obtenerSedes } from '../../../shared/libs/request-generales';
import { SharedService } from '../../../services/shared.service';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-crear-servicios',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
  ],
  templateUrl: './crear-servicios.html',
  styleUrl: './crear-servicios.css',
})
export class CrearServicios {
  servicioForm!: FormGroup;
  loading: boolean = false;
  viewDate: Date = new Date();
  sedes: { id: number; nombre: string }[] = [];
  estados: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'Activo' },
    { id: 2, nombre: 'Inactivo' },
  ];
  idEmpresa: string = '';

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private userService: UserService
  ) {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    this.idEmpresa = infoEmpresa?.idEmpresa;
    obtenerSedes(this.sharedService, this.idEmpresa, (datos) => {
      this.sedes = datos;
    });
  }

  ngOnInit(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      valor: ['', Validators.required],
      tiempo: ['', Validators.required],
      sede: ['', Validators.required],
      esPago: ['', Validators.required],
      orden: ['', Validators.required],
    });
  }

  guardarServicio(): void {
    if (this.servicioForm.valid) {
      this.loading = true;
      const nuevoServicio = this.servicioForm.value;

      const request = {
        Nombre: nuevoServicio.nombre,
        Valor: nuevoServicio.valor,
        Tiempo: nuevoServicio.tiempo,
        Sede: nuevoServicio.sede,
        EsPago: nuevoServicio.esPago,
        Orden: nuevoServicio.orden,
        empresa: this.idEmpresa,
      };

      this.userService.crearServicios(request).subscribe({
        next: (rest: any) => {
          if (rest.exito) {
            this.ventanaMensaje(
              'success',
              'Servicio creado',
              rest.mensaje,
              true
            );
          } else {
            this.ventanaMensaje('warning', 'Mensaje', rest.mensaje, false);
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.ventanaMensaje('error', 'Error', err.mensaje, false);
        },
      });
    }
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
      validador ? this.cancelar() : null;
    });
  }

  cancelar(): void {
    this.router.navigate(['admin/servicios']);
  }
}
