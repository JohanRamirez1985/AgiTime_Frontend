import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorMessageComponent } from '../../shared/error-message/error-message.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginResponse } from '../../interfaces/shared.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../services/shared.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ErrorMessageComponent,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
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
  idEmpresa: any;
  tipo: string = ''
  uniqueId = Math.floor(Math.random() * 100000);
  hidePassword = true;
  empresaLogo: string = '';
  version: string = '';




  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedServices: SharedService,
  ) {
    this.idEmpresa = this.route.snapshot.queryParamMap.get('em');
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';
    this.version = environment.version;
    this.consultarEmpresa();
  }

  public consultarEmpresa() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        const empresa: any = rest.datos.find(e => e.id === parseInt(this.idEmpresa));
        this.empresaLogo = 'assets/img/' + empresa.logo || '';
      },
    });
  }

  public login(): void {
    this.loading = true;
    this.apiErrorMessage = '';

    this.authService.login(
      { Login: this.email, Password: this.password, empresa: this.idEmpresa || '' },
      (this.tipo || '').toLowerCase() === 'cl'
    ).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        this.btnLogin = true;
        if (res.exito) {
          localStorage.setItem('usuario', JSON.stringify(res.datos.usuario));
          localStorage.setItem('empresa', JSON.stringify(res.datos.empresa));
          localStorage.setItem('funcionalidades', JSON.stringify(res.datos.funcionalidades));
          localStorage.setItem('token', res.token);
          localStorage.setItem('infoEmp', JSON.stringify({
            idEmpresa: this.idEmpresa,
            tipo: this.tipo
          }));
          this.redireccion();
        } else {
          this.apiErrorMessage = res.mensaje || '';
          this.showModal = true;
        }

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

  private redireccion(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '');
    if (this.tipo === 'cl') {
      this.router.navigate(['/cliente']);
    } else if (usuario.rol === 3) {
      this.router.navigate(['admin/recurso/dash'])
    }
    else {
      this.router.navigate(['/admin/dashboard'])
    }
  }
}
