import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  if (auth.isLoggedIn()) return true;

  tokenStorage.storeRedirectUrl(state.url);
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (role: string): CanActivateFn =>
  (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const tokenStorage = inject(TokenStorageService);

    if (!auth.isLoggedIn()) {
      tokenStorage.storeRedirectUrl(state.url);
      router.navigate(['/login']);
      return false;
    }

    const userRole = auth.getCurrentUser()?.role?.toUpperCase();
    if (userRole === role.toUpperCase()) return true;

    const dashboards: Record<string, string> = {
      INDIVIDUAL: '/dashboard',
      CORPORATE: '/corporate',
      ADMIN: '/admin'
    };
    router.navigate([dashboards[userRole!] || '/']);
    return false;
  };
