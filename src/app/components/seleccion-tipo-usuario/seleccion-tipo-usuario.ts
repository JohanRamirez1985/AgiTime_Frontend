import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { Empresa } from '../../interfaces/shared.interface';
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

  listado: { id: number, nombre:string}[] = [];

  constructor(private router: Router,
    private sharedService: SharedService
  ) {
    
  }

  ngOnInit() {
    this.obtenerEmpresas();
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

  public seleccionarTipo(tipo: 'empresa' | 'cliente'): void {
    this.tipoSeleccionado = tipo;
    this.filtro = '';
  }

  public listadoFiltrado() {
    return this.listado.filter(item =>
      item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  public irALogin(item: any):void {
    const tipo = this.tipoSeleccionado === 'empresa' ? 'em' : 'cl';
    const id = item.id;


    this.router.navigate(['/login'], {
      queryParams: { em: id, tipo: tipo }
    });
  }

  public cancelar(): void {
    this.tipoSeleccionado = null;
    this.filtro = '';
  }
}
