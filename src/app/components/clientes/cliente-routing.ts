import { Routes } from '@angular/router';
import { ClienteDashboard } from './cliente-dashboard/cliente-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: ClienteDashboard
  },
  {
    path: 'reservar',
    loadComponent: () =>
      import('./cliente-agendar/cliente-agendar').then(m => m.ClienteAgendar)
  },
  {
    path: 'misCitas',
    loadComponent: () =>
      import('./cliente-mis-citas/cliente-mis-citas').then(m => m.ClienteMisCitas)
  }
];
