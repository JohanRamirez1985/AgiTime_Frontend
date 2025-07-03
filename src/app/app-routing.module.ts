import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login'

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección por defecto
  { path: 'login', component: Login },
  // Aquí agregarás más rutas luego, por ejemplo:
  // { path: 'dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
