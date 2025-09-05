import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  usuarioLogueado: any;
  img: string = '';
  nombreEmpresa: string = '';

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.usuarioLogueado = JSON.parse(usuario);
    }
    const infoempresa = localStorage.getItem('empresa');
    if (infoempresa) {
      const empresa = JSON.parse(infoempresa);
      this.img = 'assets/img/' + empresa?.logo;
      this.nombreEmpresa = empresa.nombre;
    }
  }

  cerrarSesion() {
    const infoEmpStr = localStorage.getItem('infoEmp');
    localStorage.clear();
    const idEmpresa = infoEmpStr ? JSON.parse(infoEmpStr).idEmpresa : null;
    const currentUrl = this.router.url === 'cliente' ? 'cl' : 'em';
    this.router.navigate(['/login'], {
      queryParams: { em: idEmpresa, tipo: currentUrl },
    });
  }

  validate(codigo: string): boolean {
    const funcionalidades = JSON.parse(
      localStorage.getItem('funcionalidades') || '[]'
    );
    const codigos = funcionalidades.map((f: any) => f.codigo);
    return codigos.includes(codigo);
  }
}
