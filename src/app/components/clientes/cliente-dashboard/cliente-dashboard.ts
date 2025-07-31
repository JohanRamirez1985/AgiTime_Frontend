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
  imports: [CommonModule,
    MatTooltipModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css'
})

export class ClienteDashboard {

  nombreEmpresa: string = '';
  recursos: any[] = [];
  idEmpresa: number = 0;
  img: string = '';
  sedes: any[] = [];
  imgRecurso: string = 'assets/img/';
  loading: boolean = true;


  constructor(private router: Router,
    private sharenServices: SharedService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {

  }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idEmpresa = +params['em']
    })
    // this.obtenerSedes();
    this.obtenerRecursos();
  }

  private obtenerSedes(): void {
    this.sharenServices.obtenerSedesUsuarios(this.idEmpresa.toString())
      .subscribe({
        next: rest => {
          if (rest.exito) {
            this.sedes = rest.datos;
            this.encontrarSedesAsociadas();
          }
        }
      })


  }

  private obtenerEmpresas() {
    this.sharenServices.obtenerEmpresasApp()
      .subscribe({
        next: rest => {
          const empresa = rest.datos.find(em => em.id === this.idEmpresa);
          this.nombreEmpresa = empresa?.nombre ?? '';
          this.img = 'assets/img/' + empresa?.logo;
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
  }

  private obtenerRecursos(): void {
    this.sharenServices.obtenerRecursosAgenda(this.idEmpresa)
      .subscribe({
        next: rest => {
          if (rest.exito) {
            this.recursos = rest.datos.usuario.filter((u: any) => u.recurso === true);
            this.obtenerSedes();
          }
        }
      })
  }

  private encontrarSedesAsociadas(): void {
    for (let i = 0; i < this.recursos.length; i++) {
      let sede = '';
      sede = this.sedes.find(sede => sede.id === this.recursos[i].sede).nombre ?? '';
      this.recursos[i].nombreSede = 'Sede - ' + sede;
    }
    this.obtenerEmpresas();
  }

  irAReservar(usuario: any) {
    const user = {
      nombre: usuario.nombre,
      sede: usuario.nombreSede,
      id: usuario.id,
      emp: this.idEmpresa
    }
    localStorage.setItem('recurso', JSON.stringify(user));
    this.router.navigate(['/cliente/reservar']);
  }

  irAHistorial() {
    this.router.navigate(['/cliente/historial']);
  }

  cerrarSesion() {
    const infoEmpStr = localStorage.getItem('infoEmp');
    localStorage.clear();
    const idEmpresa = infoEmpStr ? JSON.parse(infoEmpStr).idEmpresa : null;
    const currentUrl = infoEmpStr ? JSON.parse(infoEmpStr).tipo : null;
    this.router.navigate(['/login'], {
      queryParams: { em: idEmpresa, tipo: currentUrl }
    });
  }

}
