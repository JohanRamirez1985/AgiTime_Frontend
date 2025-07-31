import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [  CommonModule,
    MatTooltipModule,
    MatIconModule ,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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


  constructor(private router: Router,
    private sharenServices : SharedService,
    private route: ActivatedRoute
  ) {
   
  }
  

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idEmpresa = +params['em']
    })
    this.obtenerSedes();
    this.obtenerRecursos();
    this.obtenerEmpresas();
  }

  private obtenerSedes():void {
    this.sharenServices.obtenerSedesUsuarios(this.idEmpresa.toString())
    .subscribe({
      next: rest => {
        if(rest.exito) {
          this.sedes = rest.datos;
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
        this.img = 'assets/img/' +  empresa?.logo;
      }
    })
  }

  private obtenerRecursos(): void {
    this.sharenServices.obtenerRecursosAgenda(this.idEmpresa)
    .subscribe({
      next : rest => {
        if (rest.exito) {
          this.recursos = rest.datos.usuario.filter((u: any) => u.recurso === true);
          this.encontrarSedesAsociadas();
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
