import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { ClienteRegistro, ClienteRegistroResponse, TipoDocumento } from '../../../interfaces/shared.interface'
import { obtenerGeneros, obtenerTiposDocumentos } from '../../../shared/libs/request-generales';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ClienteService } from '../../../services/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {  
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  idDocumento: string = '';
  tipoDocumento: string = '';
  fechaNacimiento: string = '';
  genero: string = '';
  cellphone: string = '';
  tipoGenero: string = '';
  idEmpresa: string | null = null;
  tipo: string | null = null;
  tipoDocumentos: TipoDocumento[] = [];
  listaGeneros: TipoDocumento[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService,
              private clientService : ClienteService 
             ) {}


  ngOnInit(): void {
    this.idEmpresa = this.route.snapshot.queryParamMap.get('em');
    this.tipo = this.route.snapshot.queryParamMap.get('tipo');

    // Validar que solo los clientes puedan registrar
    if (this.tipo !== 'cl') {
      this.router.navigate(['/']); // redirige al inicio
    }

    if (this.idEmpresa) {
      obtenerTiposDocumentos(this.sharedService, this.idEmpresa, datos => {
        this.tipoDocumentos = datos;
      });
      obtenerGeneros(this.sharedService, this.idEmpresa, datos => {
        this.listaGeneros = datos;
      });
    }
  }

  public registrar():void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const request = this.createJson();

    this.clientService.crearCliente(request)
    .subscribe({
      next: (rest : ClienteRegistroResponse) => {
        if (rest.exito) {
          Swal.fire({
            icon: 'success',
            title: '¡Usuario creado!',
            text: rest.mensaje || 'Cliente creado exitosamente',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: rest.mensaje || 'Error al crear el cliente',
          });
        }
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudo conectar con el backend',
        });
      }
    })
  }

  private createJson():ClienteRegistro {
    
    const json: ClienteRegistro = {
      nombre: this.nombre,
      correo: this.email,
      password: this.password,
      tipoDocumento: parseInt(this.tipoDocumento),
      documento: this.idDocumento,
      genero: parseInt(this.genero),
      fechaNacimiento: this.fechaNacimiento,
      telefono: this.cellphone,
      empresa: Number(this.idEmpresa),
    };

    return json
  }
}
