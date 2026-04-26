import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signup } from '../../../app/features/auth/signup/signup';
import { AuthService } from '../../../app/core/services/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub routes to prevent NG04002 navigation errors in tests
const TEST_ROUTES = [
  { path: 'dashboard', component: class {} },
];

describe('Signup Component', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      signup: vi.fn(),
      currentUser: signal(null),
      isLoggedIn: () => false,
      initials: () => '',
      logout: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter(TEST_ROUTES as any),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the signup component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields', () => {
    expect(component.firstName).toBe('');
    expect(component.lastName).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should initialize with termsAccepted false', () => {
    expect(component.termsAccepted).toBe(false);
  });

  it('should initialize with loading false and no error', () => {
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should initialize with showPassword false', () => {
    expect(component.showPassword).toBe(false);
  });

  describe('onSignup()', () => {
    it('should not call auth.signup if terms are not accepted', () => {
      component.termsAccepted = false;
      component.onSignup();
      expect(mockAuthService.signup).not.toHaveBeenCalled();
    });

    it('should call auth.signup with full name, email and password when terms accepted', () => {
      mockAuthService.signup.mockReturnValue(of({ role: 'INDIVIDUAL', accessToken: 'tok', refreshToken: 'ref', name: 'John Doe', email: 'john@test.com' }));
      component.firstName = 'John';
      component.lastName = 'Doe';
      component.email = 'john@example.com';
      component.password = 'password123';
      component.termsAccepted = true;

      component.onSignup();

      expect(mockAuthService.signup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
    });

    it('should set errorMessage on signup failure', () => {
      mockAuthService.signup.mockReturnValue(throwError(() => ({ error: { error: 'Email already exists' } })));
      component.firstName = 'John';
      component.lastName = 'Doe';
      component.email = 'existing@example.com';
      component.password = 'password123';
      component.termsAccepted = true;

      component.onSignup();

      expect(component.errorMessage).toBe('Email already exists');
      expect(component.loading).toBe(false);
    });

    it('should use fallback error message when error has no message', () => {
      mockAuthService.signup.mockReturnValue(throwError(() => ({})));
      component.termsAccepted = true;

      component.onSignup();

      expect(component.errorMessage).toBe('Registration failed. Please try again.');
    });

    it('should trim full name correctly', () => {
      mockAuthService.signup.mockReturnValue(of({ role: 'INDIVIDUAL', accessToken: 'tok', refreshToken: 'ref', name: 'Jane', email: 'jane@test.com' }));
      component.firstName = 'Jane';
      component.lastName = '';
      component.email = 'jane@example.com';
      component.password = 'pass';
      component.termsAccepted = true;

      component.onSignup();

      expect(mockAuthService.signup).toHaveBeenCalledWith('Jane', 'jane@example.com', 'pass');
    });
  });

  describe('Template', () => {
    it('should render signup form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render email and password inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emailInput = compiled.querySelector('input[type="email"]');
      expect(emailInput).toBeTruthy();
    });
  });
});
