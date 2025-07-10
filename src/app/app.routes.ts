import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
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
      import('./components/register/register').then(m => m.Register)
  },
  {
    path: 'seleccionar',
    loadComponent: () =>
      import('./components/seleccion-tipo-usuario/seleccion-tipo-usuario').then(m => m.SeleccionTipoUsuario)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./components/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
