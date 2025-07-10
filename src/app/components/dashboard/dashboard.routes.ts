import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth-guard';
import { AdminLayout } from '../../layout/admin-layout/admin-layout';
import { Dashboard } from './dashboard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      }
    ]
  }
];
