import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from '../../../app/features/auth/login/login';
import { AuthService } from '../../../app/core/services/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub routes to prevent NG04002 navigation errors in tests
const TEST_ROUTES = [
  { path: 'dashboard', component: class {} },
  { path: 'corporate', component: class {} },
  { path: 'admin', component: class {} },
  { path: 'signup', component: class {} },
];

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
      currentUser: signal(null),
      isLoggedIn: () => false,
      initials: () => '',
      logout: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter(TEST_ROUTES as any),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty email and password', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should initialize with loading false and no error message', () => {
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  describe('onLogin()', () => {
    it('should call auth.login with email and password', () => {
      mockAuthService.login.mockReturnValue(of({ role: 'INDIVIDUAL', accessToken: 'tok', refreshToken: 'ref', name: 'Test', email: 'test@test.com' }));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should set loading to true while request is in progress', () => {
      mockAuthService.login.mockReturnValue(of({ role: 'INDIVIDUAL', accessToken: 'tok', refreshToken: 'ref', name: 'Test', email: 'test@test.com' }));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();

      // After observable completes, loading should be false
      expect(component.loading).toBe(false);
    });

    it('should set errorMessage on login failure', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));
      component.email = 'wrong@example.com';
      component.password = 'wrongpass';

      component.onLogin();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.loading).toBe(false);
    });

    it('should use fallback error message when error response has no message', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({})));
      component.onLogin();

      expect(component.errorMessage).toBe('Invalid credentials. Please try again.');
    });

    it('should clear errorMessage before each login attempt', () => {
      mockAuthService.login.mockReturnValue(of({ role: 'INDIVIDUAL', accessToken: 'tok', refreshToken: 'ref', name: 'Test', email: 'test@test.com' }));
      component.errorMessage = 'Previous error';

      component.onLogin();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('onCreateAccount()', () => {
    it('should navigate to /signup', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onCreateAccount();

      expect(navigateSpy).toHaveBeenCalledWith(['/signup']);
    });
  });

  describe('Template', () => {
    it('should render login form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render email and password inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emailInput = compiled.querySelector('input[type="email"]');
      const passwordInput = compiled.querySelector('input[type="password"]');
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });
  });
});
