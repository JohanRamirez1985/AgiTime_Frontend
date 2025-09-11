import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css',
})
export class ClienteDashboard {
  nombreEmpresa: string = '';
  recursos: any[] = [];
  recursosList: any[] = [];
  idEmpresa: number = 0;
  img: string = '';
  sedes: any[] = [];
  imgRecurso: string = 'assets/img/';
  loading: boolean = true;
  inactiva: boolean = false;
  mensajeError: string = '';
  mostrarSede: boolean = false;
  sedeSeleccionada: string = '';
  btnRefresh: boolean = false;

  constructor(
    private router: Router,
    private sharenServices: SharedService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.idEmpresa = +params['em'];
    });
    this.obtenerSedes();
  }

  public misCitas(): void {
    this.router.navigate(['/cliente/misCitas'], {
      queryParams: {
        emp: this.idEmpresa,
      },
    });
  }

  private obtenerSedes(): void {
    this.sharenServices
      .obtenerSedesUsuarios(this.idEmpresa.toString())
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.sedes = rest.datos;
            this.mostrarSede = this.sedes.length === 1;
            this.btnRefresh = !this.mostrarSede;
            this.obtenerRecursos();
            this.encontrarSedesAsociadas();
          }
        },
      });
  }

  public irALogin() {
    this.router.navigate(['/login'], {
      queryParams: { em: this.idEmpresa, tipo: 'em' },
    });
  }

  private obtenerEmpresas() {
    this.sharenServices.obtenerEmpresasApp().subscribe({
      next: (rest) => {
        if (rest.exito) {
          const empresa = rest.datos.find((em) => em.id === this.idEmpresa);
          this.nombreEmpresa = empresa?.nombre ?? '';
          this.img = 'assets/img/' + empresa?.logo;
          this.loading = false;
          localStorage.setItem('empresa', JSON.stringify(empresa));
          this.cdr.detectChanges();
        } else {
          this.inactiva = true;
        }
      },
    });
  }

  private obtenerRecursos(): void {
    this.sharenServices.obtenerRecursosAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.recursos = rest.datos.usuario.filter(
            (u: any) => u.recurso === true
          );
          if (this.mostrarSede) {
            this.sedeSeleccionada = this.sedes[0].nombre;
            this.recursosList = this.recursos.filter(
              (r) => r.sede === this.sedes[0].id
            );
          }
          this.cdr.detectChanges();
        } else {
          this.inactiva = true;
          this.mensajeError = rest.mensaje;
        }
      },
    });
  }

  public cambiarSede(): void {
    this.mostrarSede = false;
    this.cdr.detectChanges();
  }

  public seleccionarSede(sede: any) {
    this.recursosList = this.recursos.filter((r) => r.sede === sede.id);
    this.sedeSeleccionada = sede.nombre;
    this.mostrarSede = true;
    this.btnRefresh = this.mostrarSede;
    this.cdr.detectChanges();
  }

  private encontrarSedesAsociadas(): void {
    for (let i = 0; i < this.recursos.length; i++) {
      let sede = '';
      sede =
        this.sedes.find((sede) => sede.id === this.recursos[i].sede).nombre ??
        '';
      this.recursos[i].nombreSede = 'Sede - ' + sede;
    }
    this.obtenerEmpresas();
  }

  irAReservar(usuario: any) {
    localStorage.setItem('recurso', JSON.stringify(usuario));
    this.router.navigate(['/cliente/reservar'], {
      queryParams: { emp: this.idEmpresa, rcr: usuario.id },
    });
    this.cdr.detectChanges();
  }

  irAHistorial() {
    this.router.navigate(['/cliente/historial']);
  }
}
