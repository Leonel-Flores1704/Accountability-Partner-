import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    router.navigateByUrl('/dashboard', { replaceUrl: true });
    return false;
  }

  return true;
};