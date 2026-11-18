import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'seleccionar',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/clientes/crear-cliente/register').then(
        (m) => m.Register
      ),
  },
  {
    path: 'seleccionar',
    loadComponent: () =>
      import('./components/seleccion-tipo-usuario/seleccion-tipo-usuario').then(
        (m) => m.SeleccionTipoUsuario
      ),
  },
  {
    path: 'monitorAgenda/:empresaId',
    loadComponent: () =>
      import('./components/pantalla-info/pantalla-info').then(
        (m) => m.PantallaInfo
      ),
  },

  // ✅ Ruta protegida solo para administradores
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/dashboard-layout/dashboard-layout').then(
        (m) => m.DashboardLayout
      ),
    canActivate: [
      AuthGuard(
        ['Administrador', 'SuperAdmin', 'Empleado', 'Supervisor'],
        true
      ),
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./components/usuarios/gestionar-usuario/usuarios').then(
            (m) => m.Usuarios
          ),
      },
      {
        path: 'usuarios/crear',
        loadComponent: () =>
          import('./components/usuarios/crear-usuario/crear-usuario').then(
            (m) => m.CrearUsuario
          ),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import(
            './components/productos/inventario-productos/inventario-productos'
          ).then((m) => m.InventarioProductos),
      },
      {
        path: 'inventario/crear',
        loadComponent: () =>
          import('./components/productos/crear-producto/crear-producto').then(
            (m) => m.CrearProducto
          ),
      },
      {
        path: 'inventario/agregar',
        loadComponent: () =>
          import(
            './components/productos/agregar-producto/agergar-producto'
          ).then((m) => m.AgregarProducto),
      },
      {
        path: 'inventario/editar',
        loadComponent: () =>
          import('./components/productos/editar-producto/editar-producto').then(
            (m) => m.EditarProducto
          ),
      },
      {
        path: 'venta',
        loadComponent: () =>
          import('./components/ventas/venta-producto/venta-producto').then(
            (m) => m.VentaProducto
          ),
      },
      {
        path: 'ventas/gestionar',
        loadComponent: () =>
          import('./components/ventas/gestionar-ventas/gestionar-ventas').then(
            (m) => m.GestionarVentas
          ),
      },
      {
        path: 'recurso/dash',
        loadComponent: () =>
          import('./components/recursos/dashboard/dashboard').then(
            (m) => m.DashboardRecurso
          ),
      },
      {
        path: 'recurso/ord',
        loadComponent: () =>
          import('./components/agendamientoOrden/gestion-agendamiento-orden/gestion-agendamiento-orden').then(
            (m) => m.GestionAgendamientoOrden
          ),
      },
      {
        path: 'usuarioPorcentaje/gestionar',
        loadComponent: () =>
          import(
            './components/usuarios-porcentaje/gestionar-porcentaje/gestionar-porcentaje'
          ).then((m) => m.GestionarPorcentaje),
      },
      {
        path: 'clientesRecordatorio/recordatorio',
        loadComponent: () =>
          import(
            './components/clientes/cliente-recordatorio/cliente-recordatorio'
          ).then((m) => m.ClienteRecordatorio),
      },
      {
        path: 'clientesFidelidad/Fidelidad',
        loadComponent: () =>
          import(
            './components/clientes/cliente-fidelidad/cliente-fidelidad'
          ).then((m) => m.ClienteFidelidad),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import(
            './components/servicios/gestion-servicios/gestion-servicios'
          ).then((m) => m.GestionServicios),
      },
      {
        path: 'servicios/crear',
        loadComponent: () =>
          import('./components/servicios/crear-servicios/crear-servicios').then(
            (m) => m.CrearServicios
          ),
      },
      {
        path: 'servicios/editar',
        loadComponent: () =>
          import(
            './components/servicios/editar-servicios/editar-servicios'
          ).then((m) => m.EditarServicios),
      },
      {
        path: 'informes',
        loadComponent: () =>
          import('./components/informes/informes').then((m) => m.Informes),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./components/reportes/reportes').then((m) => m.Reportes),
      },
      {
        path: 'liquidacion',
        loadComponent: () =>
          import('./components/liquidar-citas/liquidar-citas').then((m) => m.LiquidarCitas),
      },
      {
        path: 'periodo-prueba',
        loadComponent: () =>
          import('./components/periodo-prueba/periodo-prueba').then((m) => m.PeriodoPrueba),
      },
      {
        path: 'agenda-prf',
        loadComponent: () =>
          import('./components/recursos/agenda-profesionales/agenda-profesionales').then((m) => m.AgendaProfesionales),
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./components/citas/citas').then((m) => m.Citas),
      }
    ],
  },

  {
    path: 'cliente',
    loadChildren: () =>
      import('./components/clientes/cliente-routing').then((m) => m.routes),
  },

  {
    path: 'politicasPrivacidad',
    loadComponent: () =>
      import('./politica-seguridad/politica-seguridad').then(
        (m) => m.PoliticaSeguridad
      ),
  },

  {
    path: '**',
    redirectTo: 'seleccionar',
  },
];
