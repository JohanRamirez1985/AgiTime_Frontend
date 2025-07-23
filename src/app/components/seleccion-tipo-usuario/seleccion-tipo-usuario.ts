import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-seleccion-tipo-usuario',
  standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule
  ],
  templateUrl: './seleccion-tipo-usuario.html',
  styleUrls: ['./seleccion-tipo-usuario.css']
})

export class SeleccionTipoUsuario {
  tipoSeleccionado: 'empresa' | 'cliente' | null = null;
  filtro: string = '';
  mostrarListado: boolean = false;
  listado: { id: number, nombre:string}[] = [];
  idEmpresaSeleccionada: number | null = null;

  constructor(private router: Router,
    private sharedService: SharedService,
    private route : ActivatedRoute
  ) {
    
  }

  ngOnInit() {
    this.obtenerEmpresas();
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('em');
      this.idEmpresaSeleccionada = id ? +id : null;
    }); 
  }

  private obtenerEmpresas():void {
    this.sharedService.obtenerEmpresasApp()
    .subscribe({
      next: res => {
        const empresas = res.datos;
        for (let i = 0; i < empresas.length; i++) {
          this.listado.push({
            id : empresas[i].id,
            nombre: empresas[i].nombre
          })          
        }
        this.listado = res.datos
      }
    })
  }

  public buscarNombre(): void {
    if(this.filtro.length >= 4) this.mostrarListado = true;
    else this.mostrarListado = false;    
  }

  public seleccionarTipo(tipo: 'empresa' | 'cliente'): void {
    this.tipoSeleccionado = tipo;
    this.filtro = '';
    const tipo2 = this.tipoSeleccionado === 'empresa' ? 'em' : 'cl';


    this.router.navigate(['/login'], {
      queryParams: { em: this.idEmpresaSeleccionada, tipo: tipo2 }
    });
  }

  public listadoFiltrado() {
    return this.listado.filter(item =>
      item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  public seleccionarEmpresa(item: any):void {
    this.idEmpresaSeleccionada = item.id;
    this.router.navigate(['/seleccionar'], { queryParams: { em: this.idEmpresaSeleccionada } });
  }

  public cancelar(): void {
    this.tipoSeleccionado = null;
    this.filtro = '';
  }
}
