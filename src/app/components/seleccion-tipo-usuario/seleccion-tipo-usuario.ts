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
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { ValidarVersion } from '../../shared/validar-version/validar-version';

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
    MatListModule,
    MatIconModule,
    ValidarVersion
  ],
  templateUrl: './seleccion-tipo-usuario.html',
  styleUrls: ['./seleccion-tipo-usuario.css']
})

export class SeleccionTipoUsuario {
  tipoSeleccionado: 'empresa' | 'cliente' | null = null;
  filtro: string = '';
  mostrarListado: boolean = false;
  listado: { id: number, nombre: string }[] = [];
  idEmpresaSeleccionada: number | null = null;
  inactiva: boolean = false;
  mensajeError: string = '';
  version: string = '';

  constructor(private router: Router,
    private sharedService: SharedService,
    private route: ActivatedRoute
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.obtenerEmpresas();
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('em');
      this.idEmpresaSeleccionada = id ? +id : null;
    });
  }

  private obtenerEmpresas(): void {
    this.sharedService.obtenerEmpresasApp()
      .subscribe({
        next: res => {
          if (res.exito) {
            const empresas = res.datos;
            for (let i = 0; i < empresas.length; i++) {
              this.listado.push({
                id: empresas[i].id,
                nombre: empresas[i].nombre
              })
            }
            this.listado = res.datos
          } else {
            this.inactiva = true;
            this.mensajeError = res.mensaje;
          }
        }
      })
  }

  public buscarNombre(): void {
    if (this.filtro.length >= 4) this.mostrarListado = true;
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

  public irCliente(): void {
    this.router.navigate(['/cliente'], {
      queryParams: { em: this.idEmpresaSeleccionada }
    });
  }

  public listadoFiltrado() {
    return this.listado.filter(item =>
      item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  public seleccionarEmpresa(item: any): void {
    this.idEmpresaSeleccionada = item.id;
    this.router.navigate(['/seleccionar'], { queryParams: { em: this.idEmpresaSeleccionada } });
  }

  public cancelar(): void {
    this.tipoSeleccionado = null;
    this.filtro = '';
  }
}
