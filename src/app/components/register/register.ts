import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  registrar() {
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

    // Aquí iría la llamada real al backend (servicio)
    console.log('Enviando registro:', {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    });

    this.successMessage = '¡Registro exitoso!';
    // Resetear campos si deseas
    this.nombre = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
