import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { obtenerGeneros, obtenerRoles, obtenerSedes, obtenerTiposDocumentos } from '../../../shared/libs/request-generales';
import { TipoDocumento, UsuarioRegistro } from '../../../interfaces/shared.interface';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,     // ✅ Asegúrate que esté incluido
    MatIconModule
  ],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css'
})

export class CrearUsuario {
  usuario = {
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    tipoDocumento: '',
    sede: '',
    documento: '',
    estado: 'Activo',
    empresa: '',
    rol: ''
  };

  tipoDocumentos: TipoDocumento[] = [];
  listaGeneros: TipoDocumento[] = [];
  listaRoles: TipoDocumento[] = [];
  listaSedes: TipoDocumento[] = [];
  idEmpresa: string | null = null;

  sedes = ['Bogotá', 'Medellín', 'Cali'];
  roles = ['Administrador', 'Cliente'];

  constructor(private router: Router,
    private sharedServices : SharedService,
    private userService : UserService,
    private snackBar: MatSnackBar
  ) {
    
  }

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    if (this.idEmpresa) {
      obtenerTiposDocumentos(this.sharedServices, this.idEmpresa, datos => {
        this.tipoDocumentos = datos;
      });
      obtenerGeneros(this.sharedServices, this.idEmpresa, datos => {
        this.listaGeneros = datos;
      });
      obtenerRoles(this.sharedServices, this.idEmpresa, datos => {
        this.listaRoles = datos;
      });
      obtenerSedes(this.sharedServices, this.idEmpresa, datos => {
        this.listaSedes = datos;
      });
    }
  }

  public cancelar():void {
    this.router.navigate(['/admin/usuarios']);
  }

  registrarUsuario() {
    const request = this.createJson();
    this.userService.crearUsuario(request).subscribe({
      next: res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje || 'Usuario creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });

          setTimeout(() => {
            this.router.navigate(['/admin/usuarios']);
          }, 3000);
        } else {
          this.snackBar.open(res.mensaje || 'Ocurrió un error al crear el usuario', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-error']
          });
        }
      },
      error: err => {
        this.snackBar.open('Error de conexión con el servidor', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
        console.error(err);
      }
    });
  }

  createJson():UsuarioRegistro {
    
    const json: UsuarioRegistro = {
      nombre: this.usuario.nombre,
      correo: this.usuario.correo,
      password: this.usuario.password,
      telefono: this.usuario.telefono,
      fechaNacimiento: this.usuario.fechaNacimiento,
      genero: Number(this.usuario.genero),
      tipoDocumento: Number(this.usuario.tipoDocumento),
      sede: Number(this.usuario.sede),
      documento: this.usuario.documento,
      empresa: Number(this.idEmpresa),
      rol: Number(this.usuario.rol)
    };

    return json
  }
}
