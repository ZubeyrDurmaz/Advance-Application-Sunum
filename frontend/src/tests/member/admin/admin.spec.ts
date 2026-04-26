import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from '../../../app/features/member/admin/admin';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('Admin Component', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
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

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin component', () => {
    expect(component).toBeTruthy();
  });

  it('should have systemStats defined', () => {
    expect(component.systemStats).toBeDefined();
    expect(component.systemStats.length).toBeGreaterThan(0);
  });

  it('should have recentActivity defined', () => {
    expect(component.recentActivity).toBeDefined();
    expect(component.recentActivity.length).toBeGreaterThan(0);
  });

  it('should have correct systemStats structure', () => {
    const stat = component.systemStats[0];
    expect(stat.label).toBeDefined();
    expect(stat.value).toBeDefined();
    expect(stat.icon).toBeDefined();
    expect(typeof stat.up).toBe('boolean');
  });

  it('should have correct recentActivity structure', () => {
    const activity = component.recentActivity[0];
    expect(activity.action).toBeDefined();
    expect(activity.user).toBeDefined();
    expect(activity.time).toBeDefined();
    expect(activity.type).toBeDefined();
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should render admin dashboard content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
