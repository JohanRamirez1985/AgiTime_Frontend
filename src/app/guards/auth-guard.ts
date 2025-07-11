import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const rol = JSON.parse(localStorage.getItem('usuario') || '{}').nombreRol;


  if (token && rol === 'admin') return true;

  router.navigate(['/']);
  return false;
};
