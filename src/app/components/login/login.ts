import { ChangeDetectorRef, Component } from '@angular/core';
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
import { Modal } from '../../shared/services/modal';
import { MatDialog } from '@angular/material/dialog';
import { ModalActualizando } from '../../shared/modal-actualizando/modal-actualizando';

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
  loadingInicial: boolean = true;




  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedServices: SharedService,
    private modalService: Modal,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    this.idEmpresa = this.route.snapshot.queryParamMap.get('em');
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';
    this.version = environment.version;
    this.consultarEmpresa();
    this.validarVersionApp();
  }

  public consultarEmpresa() {
    this.sharedServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        const empresa: any = rest.datos.find(e => e.id === parseInt(this.idEmpresa));
        this.empresaLogo = 'assets/img/' + empresa.logo || '';
      },
    });
  }

  public validarVersionApp() {
    this.sharedServices.parametrosGenerales().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const parametroVersion: any = rest.datos.find(
            (v: any) => v.tipo === 'version'
          );
          const version = parametroVersion.valor || '';
          this.modalActualizacion(version)
        }
      },
    })
  }

  private async modalActualizacion(versionBd: string) {

    // Version correcta
    if (versionBd === this.version) {
      this.loadingInicial = false;
      this.cdr.detectChanges();
      return;
    }

    // Mostrar modal
    this.dialog.open(ModalActualizando, {
      disableClose: true,
      panelClass: 'update-dialog',
      backdropClass: 'update-backdrop'
    });

    try {
      // Limpiar caches del navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }

      // Limpiar storages opcional
      sessionStorage.clear();
      // Esperar un poco para UX
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      console.error('Error actualizando app', error);
      // fallback
      window.location.reload();
    }
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
          this.modalService.error(res.mensaje || '')
        }

      },
      error: err => {
        this.loading = false;
        this.btnLogin = true;
        if (err.status === 401) {
          this.modalService.error('Correo o contraseña incorrectos');
        } else {
          this.modalService.error('Ocurrió un error inesperado. Intenta de nuevo.');
        }
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
