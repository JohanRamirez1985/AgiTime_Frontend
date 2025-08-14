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
import Swal from 'sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule
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
    rol: '',
    recurso: false
  };

  tipoDocumentos: TipoDocumento[] = [];
  listaGeneros: TipoDocumento[] = [];
  listaRoles: TipoDocumento[] = [];
  listaSedes: TipoDocumento[] = [];
  idEmpresa: string | null = null;
  sedes = [];
  roles = [];
  uniqueId = Math.floor(Math.random() * 100000);
  btnGuardar: boolean = false;

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
    this.obtenerDataLocalStorage();
  }

  private obtenerDataLocalStorage(): void {
    const config = [
      {
        key: 'tiposDoc',
        fetch: obtenerTiposDocumentos,
        set: (datos: any) => { this.tipoDocumentos = datos; }
      },
      {
        key: 'generos',
        fetch: obtenerGeneros,
        set: (datos: any) => { this.listaGeneros = datos; }
      },
      {
        key: 'roles',
        fetch: obtenerRoles,
        set: (datos: any) => { this.listaRoles = datos; }
      },
      {
        key: 'sedes',
        fetch: obtenerSedes,
        set: (datos: any) => { this.listaSedes = datos; }
      }
    ];

    config.forEach(c => {
      const almacenado = localStorage.getItem(c.key);

      if (almacenado) {
        c.set(JSON.parse(almacenado));
      } else {
        c.fetch(this.sharedServices, this.idEmpresa!, datos => {
          c.set(datos);
          localStorage.setItem(c.key, JSON.stringify(datos));
        });
      }
    });
  }

  public cancelar():void {
    this.router.navigate(['/admin/usuarios']);
  }

  public esFormularioValido(): boolean {
    return !!this.usuario.sede && !!this.usuario.rol 
      && !!this.usuario.correo && !!this.usuario.nombre 
      && !!this.usuario.telefono && !!this.usuario.tipoDocumento
      && !!this.usuario.documento && !!this.usuario.fechaNacimiento
      && !!this.usuario.password && !!this.usuario.genero;
  }

  registrarUsuario() {
    this.btnGuardar = true;
    const request = this.createJson();
    this.userService.crearUsuario(request).subscribe({
      next: res => {
        if (res.exito) {
          Swal.fire({
            icon: 'success',
            title: '¡Usuario creado!',
            text: res.mensaje || 'Usuario creado exitosamente',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ir al listado'
          }).then(() => {
            this.router.navigate(['/admin/usuarios']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: res.mensaje || 'Error al crear el usuario',
          });
        }
        this.btnGuardar = false;
      },
      error: err => {
        this.btnGuardar = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudo conectar con el backend',
        });
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
      rol: Number(this.usuario.rol),
      recurso: this.usuario.recurso,
      fechaCreacion: new Date()
    };

    return json
  }
}
