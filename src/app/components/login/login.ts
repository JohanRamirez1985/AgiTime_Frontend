import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorMessageComponent } from '../../shared/error-message/error-message.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorMessageComponent, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login {
  email = '';
  password = '';
  btnLogin: boolean = false;
  apiErrorMessage: string = '';
  showModal = false;
  loading = false;
  idEmpresa: string | null = null;
  tipo: string = ''



  constructor(private authService: AuthService,
    private route: ActivatedRoute
  ) {
      this.idEmpresa = this.route.snapshot.queryParamMap.get('em');
      this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';
  }
  
  public login():void {
    this.loading = true;
    this.apiErrorMessage = '';

    this.authService.login({ Login: this.email, Password: this.password, empresa: this.idEmpresa || '' }, this.tipo.toLowerCase() === 'cl')
      .subscribe({
        next: res => {
          console.log('Login exitoso', res);
          this.loading = false;
          this.btnLogin = true;
          // Redirigir o guardar token
        },
        error: err => {
          console.error('Error en login', err);
          this.loading = false;
          this.btnLogin = true;

          if (err.status === 401) {
            this.apiErrorMessage = 'Correo o contraseña incorrectos';
          } else {
            this.apiErrorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
          }
          this.showModal = true;
        }
      });
  }


}
