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
import { Router, RouterModule } from '@angular/router';

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
    login: '',
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

  generos = ['Masculino', 'Femenino', 'Otro'];
  tiposDocumento = ['CC', 'TI', 'CE'];
  sedes = ['Bogotá', 'Medellín', 'Cali'];
  roles = ['Administrador', 'Cliente'];

  constructor(private router: Router) {}

  registrarUsuario() {
    console.log(this.usuario);
    // Aquí puedes llamar al servicio que envía el JSON al backend
  }
}
