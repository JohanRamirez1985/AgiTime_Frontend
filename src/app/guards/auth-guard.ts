import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export function AuthGuard(rolesPermitidos: string[], role: boolean): CanActivateFn {
  return () => {
    const token = localStorage.getItem('token');
    const router = inject(Router);

    if (role) {          
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const rol = usuario.nombreRol;
      
      if (token && rolesPermitidos.includes(rol)) {
        return true;
      }
    }else {
        if (token) {
        return true;
      }
    }



    router.navigate(['/']);
    return false;
  };
}