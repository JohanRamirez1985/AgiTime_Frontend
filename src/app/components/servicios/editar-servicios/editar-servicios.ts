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
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import { SharedService } from '../../../services/shared.service';
import { obtenerSedes } from '../../../shared/libs/request-generales';

@Component({
  selector: 'app-editar-servicios',
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
  templateUrl: './editar-servicios.html',
  styleUrl: './editar-servicios.css',
})
export class EditarServicios {
  servicioForm!: FormGroup;
  loading: boolean = false;
  servicio: any;
  sedes: { id: number; nombre: string }[] = [];
  estados: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'Activo' },
    { id: 2, nombre: 'Inactivo' },
  ];
  idEmpresa: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private sharedService: SharedService
  ) {
    const infoEmpresa = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    this.idEmpresa = infoEmpresa?.idEmpresa;
    this.servicio = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    obtenerSedes(this.sharedService, this.idEmpresa, (datos) => {
      this.sedes = datos;
    });
  }

  ngOnInit(): void {
    this.servicioForm = this.fb.group({
      nombre: [this.servicio ? this.servicio.nombre : '', Validators.required],
      valor: [this.servicio ? this.servicio.valor : '', Validators.required],
      tiempo: [this.servicio ? this.servicio.tiempo : '', Validators.required],
      sede: [this.servicio ? this.servicio.sede : '', Validators.required],
      esPago: [this.servicio ? this.servicio.esPago : '', Validators.required],
      orden: [this.servicio ? this.servicio.orden : '', Validators.required],
      estado: [this.servicio ? this.servicio.estado : '', Validators.required],
    });
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

  guardar(): void {
    if (this.servicioForm.valid) {
      this.loading = true;
      const nuevoServicio = this.servicioForm.value;
      if (
        nuevoServicio.nombre != this.servicio.nombre ||
        nuevoServicio.valor != this.servicio.valor ||
        nuevoServicio.tiempo != this.servicio.tiempo ||
        nuevoServicio.sede != this.servicio.sede ||
        nuevoServicio.esPago != this.servicio.esPago ||
        nuevoServicio.estado != this.servicio.estado ||
        nuevoServicio.orden != this.servicio.orden
      ) {
        nuevoServicio.emp = this.idEmpresa;
        const request = {
          Nombre: nuevoServicio.nombre,
          Valor: nuevoServicio.valor,
          Tiempo: nuevoServicio.tiempo,
          Sede: nuevoServicio.sede,
          EsPago: nuevoServicio.esPago,
          Orden: nuevoServicio.orden,
          empresa: this.idEmpresa,
          Id: this.servicio.id,
          Estado: nuevoServicio.estado,
        };

        this.userService.editarServicios(request).subscribe({
          next: (rest: any) => {
            if (rest.exito) {
              this.ventanaMensaje(
                'success',
                'Servicio actualizado',
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
      } else {
        this.loading = false;
        this.ventanaMensaje(
          'warning',
          'Mensaje',
          'No se encontraron cambios para guardar.',
          false
        );
      }
    }
  }

  cancelar(): void {
    this.router.navigate(['admin/servicios']);
  }
}
