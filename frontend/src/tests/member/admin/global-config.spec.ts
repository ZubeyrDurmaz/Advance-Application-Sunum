import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalConfig } from '../../../app/features/member/admin/global-config/global-config';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GlobalConfig Component', () => {
  let component: GlobalConfig;
  let fixture: ComponentFixture<GlobalConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalConfig],
      providers: [
        provideRouter([]),
        ResponsiveService,
        {
          provide: CartService,
          useValue: {
            cartItems: signal([]),
            itemCount: computed(() => 0),
            total: computed(() => 0)
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null),
            isLoggedIn: () => false,
            initials: () => '',
            logout: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the global-config component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize saved signal as false', () => {
    expect(component.saved()).toBe(false);
  });

  it('should have platform config defined', () => {
    expect(component.platform).toBeDefined();
    expect(component.platform.name).toBe('CHRONOS');
    expect(component.platform.supportEmail).toBeDefined();
  });

  it('should have payments config defined', () => {
    expect(component.payments).toBeDefined();
    expect(component.payments.taxRate).toBeDefined();
    expect(typeof component.payments.stripeEnabled).toBe('boolean');
  });

  it('should have security config defined', () => {
    expect(component.security).toBeDefined();
    expect(component.security.sessionTimeout).toBeDefined();
    expect(component.security.maxLoginAttempts).toBeDefined();
  });

  it('should have notifications config defined', () => {
    expect(component.notifications).toBeDefined();
    expect(typeof component.notifications.systemAlerts).toBe('boolean');
  });

  describe('save()', () => {
    it('should set saved signal to true', () => {
      component.save();
      expect(component.saved()).toBe(true);
    });

    it('should reset saved signal to false after 3 seconds', async () => {
      vi.useFakeTimers();
      component.save();
      expect(component.saved()).toBe(true);
      vi.advanceTimersByTime(3000);
      expect(component.saved()).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should render config form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
