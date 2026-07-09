import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const blockedRoles = route.data?.['blockedRoles'] as string[] | undefined;
  if (blockedRoles?.some(role => auth.hasRole(role))) {
    router.navigate(['/dashboard']);
    return false;
  }

  const permissions = route.data?.['permissions'] as string[] | undefined;
  if (!permissions?.length || auth.hasAnyPermission(permissions)) return true;
  router.navigate(['/dashboard']);
  return false;
};
