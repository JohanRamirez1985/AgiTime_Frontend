import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export function AuthGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = usuario.nombreRol;

    if (token && rolesPermitidos.includes(rol)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
}