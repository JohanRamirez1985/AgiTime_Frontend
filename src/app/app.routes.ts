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
    canActivate: [AuthGuard(['Administrador', 'SuperAdmin', 'Empleado'], true)],
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
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./components/productos/inventario-productos/inventario-productos').then(m => m.InventarioProductos)
      },
      {
      path: 'inventario/crear',
        loadComponent: () =>
          import('./components/productos/crear-producto/crear-producto').then(m => m.CrearProducto)
      },
      {
      path: 'inventario/agregar',
        loadComponent: () =>
          import('./components/productos/agregar-producto/agergar-producto').then(m => m.AgregarProducto)
      },
      {
      path: 'inventario/editar',
        loadComponent: () =>
          import('./components/productos/editar-producto/editar-producto').then(m => m.EditarProducto)
      },
      {
        path: 'venta',
        loadComponent: () =>
          import('./components/productos/venta-producto/venta-producto').then(m => m.VentaProducto)
      },
      {
      path: 'recurso/dash',
        loadComponent: () =>
          import('./components/recursos/dashboard/dashboard').then(m => m.DashboardRecurso),
      },
    ]
  },

  {
    path: 'cliente',
    // canActivate: [AuthGuard(['Cliente'])],
    loadChildren: () =>
      import('./components/clientes/cliente-routing').then(m => m.routes)
  },

  {
    path: 'politicasPrivacidad',
    loadComponent: () =>
      import('./politica-seguridad/politica-seguridad').then(m => m.PoliticaSeguridad)
  },
  
  {
    path: '**',
    redirectTo: 'seleccionar'
  }
];
