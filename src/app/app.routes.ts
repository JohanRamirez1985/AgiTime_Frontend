import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'seleccionar',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/clientes/crear-cliente/register').then(m => m.Register)
  },
  {
    path: 'seleccionar',
    loadComponent: () =>
      import('./components/seleccion-tipo-usuario/seleccion-tipo-usuario').then(m => m.SeleccionTipoUsuario)
  },

  // ✅ Ruta protegida solo para administradores
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    canActivate: [AuthGuard('admin')],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./components/usuarios/gestionar-usuario/usuarios').then(m => m.Usuarios)
      },
      {
      path: 'usuarios/crear',
        loadComponent: () =>
          import('./components/usuarios/crear-usuario/crear-usuario').then(m => m.CrearUsuario)
      }
    ]
  },

  {
    path: 'cliente',
    // canActivate: [AuthGuard('cliente')],
    loadChildren: () =>
      import('./components/clientes/cliente-routing').then(m => m.routes)
  },


  {
    path: '**',
    redirectTo: 'seleccionar'
  }
];
