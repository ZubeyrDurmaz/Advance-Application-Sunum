import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformAnalytics } from '../../../app/features/member/admin/platform-analytics/platform-analytics';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('PlatformAnalytics Component', () => {
  let component: PlatformAnalytics;
  let fixture: ComponentFixture<PlatformAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformAnalytics],
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

    fixture = TestBed.createComponent(PlatformAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the platform-analytics component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize activeYear as 2024', () => {
    expect(component.activeYear()).toBe('2024');
  });

  it('should have years array defined', () => {
    expect(component.years).toBeDefined();
    expect(component.years).toContain('2024');
    expect(component.years).toContain('2023');
    expect(component.years).toContain('2022');
  });

  it('should have kpis defined', () => {
    expect(component.kpis).toBeDefined();
    expect(component.kpis.length).toBeGreaterThan(0);
  });

  it('should have userBreakdown defined', () => {
    expect(component.userBreakdown).toBeDefined();
    expect(component.userBreakdown.length).toBeGreaterThan(0);
  });

  it('should have topStores defined', () => {
    expect(component.topStores).toBeDefined();
    expect(component.topStores.length).toBeGreaterThan(0);
  });

  it('should have monthly data for all years', () => {
    expect(component.monthlyData['2024']).toBeDefined();
    expect(component.monthlyData['2023']).toBeDefined();
    expect(component.monthlyData['2022']).toBeDefined();
  });

  describe('currentMonths getter', () => {
    it('should return 2024 data by default', () => {
      expect(component.currentMonths).toBe(component.monthlyData['2024']);
    });

    it('should return correct data after year change', () => {
      component.setYear('2023');
      expect(component.currentMonths).toBe(component.monthlyData['2023']);
    });
  });

  describe('setYear()', () => {
    it('should update activeYear signal', () => {
      component.setYear('2022');
      expect(component.activeYear()).toBe('2022');
    });

    it('should switch between years correctly', () => {
      component.setYear('2023');
      expect(component.activeYear()).toBe('2023');
      component.setYear('2024');
      expect(component.activeYear()).toBe('2024');
    });
  });

  describe('KPI structure', () => {
    it('should have correct KPI structure', () => {
      const kpi = component.kpis[0];
      expect(kpi.label).toBeDefined();
      expect(kpi.value).toBeDefined();
      expect(kpi.change).toBeDefined();
      expect(typeof kpi.up).toBe('boolean');
    });
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });
  });
});
