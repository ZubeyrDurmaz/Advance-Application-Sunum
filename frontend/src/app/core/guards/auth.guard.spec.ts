import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

describe('AuthGuard — Requirements 10.1-10.5', () => {
  let authService: { isLoggedIn: ReturnType<typeof vi.fn>; getCurrentUser: ReturnType<typeof vi.fn> };
  let tokenStorage: { storeRedirectUrl: ReturnType<typeof vi.fn>; clearRedirectUrl: ReturnType<typeof vi.fn>; getRedirectUrl: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
  const mockRoute = {} as ActivatedRouteSnapshot;

  function makeState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  function runGuard(url = '/dashboard') {
    return TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, makeState(url))
    );
  }

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn(), getCurrentUser: vi.fn() };
    tokenStorage = {
      storeRedirectUrl: vi.fn(),
      clearRedirectUrl: vi.fn(),
      getRedirectUrl: vi.fn()
    };
    router = { navigate: vi.fn(), navigateByUrl: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow navigation when user is logged in — Requirement 10.3', () => {
      authService.isLoggedIn.mockReturnValue(true);
      expect(runGuard()).toBe(true);
    });

    it('should redirect to /login when not logged in — Requirement 10.4', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(runGuard()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should store attempted URL when redirecting — Requirement 10.4', () => {
      authService.isLoggedIn.mockReturnValue(false);
      runGuard('/orders');
      expect(tokenStorage.storeRedirectUrl).toHaveBeenCalledWith('/orders');
    });

    it('should not store URL when user is authenticated', () => {
      authService.isLoggedIn.mockReturnValue(true);
      runGuard('/dashboard');
      expect(tokenStorage.storeRedirectUrl).not.toHaveBeenCalled();
    });
  });

  describe('roleGuard', () => {
    function runRoleGuard(role: string, url = '/dashboard') {
      return TestBed.runInInjectionContext(() =>
        roleGuard(role)(mockRoute, makeState(url))
      );
    }

    it('should allow navigation when user has matching role', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ role: 'INDIVIDUAL' });
      expect(runRoleGuard('INDIVIDUAL')).toBe(true);
    });

    it('should redirect to /login when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(runRoleGuard('ADMIN')).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should redirect INDIVIDUAL to /dashboard when accessing CORPORATE route', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ role: 'INDIVIDUAL' });
      expect(runRoleGuard('CORPORATE')).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should redirect CORPORATE to /corporate when accessing ADMIN route', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ role: 'CORPORATE' });
      expect(runRoleGuard('ADMIN')).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/corporate']);
    });

    it('should store redirect URL when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      runRoleGuard('ADMIN', '/admin/users');
      expect(tokenStorage.storeRedirectUrl).toHaveBeenCalledWith('/admin/users');
    });
  });
});
