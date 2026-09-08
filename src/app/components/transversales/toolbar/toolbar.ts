import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-toolbar',
  standalone: true,

  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatDividerModule,
    MatListModule,
    MatSidenavModule
  ],

  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar implements OnInit {

  usuarioLogueado: any;
  img: string = '';
  nombreEmpresa: string = '';
  isMobileView = false;

  menuItems = [

    {
      codigo: 'das',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },

    {
      codigo: 'ser',
      label: 'Servicios',
      icon: 'build',
      route: '/admin/servicios'
    },

    {
      codigo: 'age',
      label: 'Agendamientos',
      icon: 'event',
      route: '/admin/recurso/dash'
    },

    {
      codigo: 'ord',
      label: 'Ordenes Agendamientos',
      icon: 'event_note',
      route: '/admin/recurso/ord'
    },

    {
      codigo: 'usu',
      label: 'Usuarios',
      icon: 'group',
      route: '/admin/usuarios'
    },

    {
      codigo: 'edu',
      label: 'Usuarios por porcentaje',
      icon: 'percent',
      route: '/admin/usuarioPorcentaje/gestionar'
    },

    {
      codigo: 'pro',
      label: 'Inventario',
      icon: 'inventory_2',
      route: '/admin/inventario'
    },

    {
      codigo: 'ven',
      label: 'Ventas',
      icon: 'point_of_sale',
      route: '/admin/venta'
    },

    {
      codigo: 'inf',
      label: 'Informes',
      icon: 'analytics',
      route: '/admin/informes'
    },

    {
      codigo: 'rep',
      label: 'Reportes',
      icon: 'bar_chart',
      route: '/admin/reportes'
    },

    {
      codigo: 'liq',
      label: 'Liquidación',
      icon: 'payments',
      route: '/admin/liquidacion'
    },

    {
      codigo: 'ibp',
      label: 'Período de prueba',
      icon: 'person_search',
      route: '/admin/periodo-prueba'
    }

  ];

  constructor(
    private router: Router
  ) { }



  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarEmpresa();
    this.detectarPantalla();
  }

  private cargarUsuario(): void {

    const usuario = localStorage.getItem('usuario');

    if (usuario) {
      try {
        this.usuarioLogueado = JSON.parse(usuario);
      } catch (error) {
        console.error(
          'Error al leer usuario:',
          error
        );
      }
    }

  }

  private cargarEmpresa(): void {

    const infoempresa = localStorage.getItem('empresa');

    if (infoempresa) {
      try {
        const empresa = JSON.parse(infoempresa);
        this.img = 'assets/img/' + empresa?.logo;
        this.nombreEmpresa = empresa?.nombre || '';
      } catch (error) {
        console.error(
          'Error al leer empresa:',
          error
        );
      }
    }
  }

  private detectarPantalla(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  toggleMenu(sidenav: MatSidenav): void {

    sidenav.toggle();

  }

  cerrarSesion(): void {

    const infoEmpStr = localStorage.getItem('infoEmp');

    localStorage.clear();

    const idEmpresa = infoEmpStr
      ? JSON.parse(infoEmpStr).idEmpresa
      : null;

    const currentUrl =
      this.router.url === 'cliente'
        ? 'cl'
        : 'em';

    this.router.navigate(
      ['/login'],
      {
        queryParams: {
          em: idEmpresa,
          tipo: currentUrl
        }
      }
    );

  }

  validate(codigo: string): boolean {

    const funcionalidades = JSON.parse(
      localStorage.getItem('funcionalidades') || '[]'
    );

    const codigos = funcionalidades.map(
      (f: any) => f.codigo
    );

    return codigos.includes(codigo);

  }

}