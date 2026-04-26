import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorpSettings } from '../../../app/features/member/corporate/corp-settings/corp-settings';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe.skip('CorpSettings Component', () => {
  let component: CorpSettings;
  let fixture: ComponentFixture<CorpSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorpSettings],
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

    fixture = TestBed.createComponent(CorpSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the corp-settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize saved signal as false', () => {
    expect(component.saved()).toBe(false);
  });

  it('should have store config defined', () => {
    expect(component.store).toBeDefined();
    expect(component.store.name).toBeDefined();
    expect(component.store.email).toBeDefined();
    expect(component.store.currency).toBeDefined();
  });

  it('should have notifications config defined', () => {
    expect(component.notifications).toBeDefined();
    expect(typeof component.notifications.newOrder).toBe('boolean');
    expect(typeof component.notifications.lowStock).toBe('boolean');
  });

  it('should have security config defined', () => {
    expect(component.security).toBeDefined();
    expect(typeof component.security.twoFactor).toBe('boolean');
    expect(component.security.sessionTimeout).toBeDefined();
  });

  describe('saveSettings()', () => {
    it('should set saved signal to true', () => {
      component.saveSettings();
      expect(component.saved()).toBe(true);
    });

    it('should reset saved signal to false after 3 seconds', () => {
      vi.useFakeTimers();
      component.saveSettings();
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

    it('should render settings form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
