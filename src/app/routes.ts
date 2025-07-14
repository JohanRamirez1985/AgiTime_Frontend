import { Routes } from '@angular/router';
import { SeleccionTipoUsuario } from './components/seleccion-tipo-usuario/seleccion-tipo-usuario';
import { Login } from './components/login/login';
import { Register } from './components/clientes/crear-cliente/register';

export const routes: Routes = [
  {
    path: '',
    component: SeleccionTipoUsuario
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
