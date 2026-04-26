import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Analytics } from '../../../app/features/member/corporate/analytics/analytics';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('Analytics Component', () => {
  let component: Analytics;
  let fixture: ComponentFixture<Analytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Analytics],
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

    fixture = TestBed.createComponent(Analytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the analytics component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize activeYear as 2024', () => {
    expect(component.activeYear()).toBe('2024');
  });

  it('should have years array defined', () => {
    expect(component.years).toContain('2024');
    expect(component.years).toContain('2023');
    expect(component.years).toContain('2022');
  });

  it('should have topProducts defined', () => {
    expect(component.topProducts).toBeDefined();
    expect(component.topProducts.length).toBeGreaterThan(0);
  });

  it('should have categories defined', () => {
    expect(component.categories).toBeDefined();
    expect(component.categories.length).toBeGreaterThan(0);
  });

  it('should have kpis defined', () => {
    expect(component.kpis).toBeDefined();
    expect(component.kpis.length).toBeGreaterThan(0);
  });

  it('should have monthly sales data for all years', () => {
    expect(component.monthlySales['2024']).toBeDefined();
    expect(component.monthlySales['2023']).toBeDefined();
    expect(component.monthlySales['2022']).toBeDefined();
  });

  describe('currentMonths getter', () => {
    it('should return 2024 data by default', () => {
      expect(component.currentMonths).toBe(component.monthlySales['2024']);
    });

    it('should return correct data after year change', () => {
      component.setYear('2022');
      expect(component.currentMonths).toBe(component.monthlySales['2022']);
    });
  });

  describe('setYear()', () => {
    it('should update activeYear signal', () => {
      component.setYear('2023');
      expect(component.activeYear()).toBe('2023');
    });
  });

  describe('formatPrice()', () => {
    it('should format number with locale formatting', () => {
      const result = component.formatPrice(1068000);
      // Locale-agnostic: verify the number digits are present
      expect(result).toContain('1');
      expect(result).toContain('068');
    });

    it('should format zero', () => {
      const result = component.formatPrice(0);
      expect(result).toBeDefined();
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
