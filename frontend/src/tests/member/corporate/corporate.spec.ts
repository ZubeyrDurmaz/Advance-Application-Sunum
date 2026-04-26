import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Corporate } from '../../../app/features/member/corporate/corporate';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('Corporate Component', () => {
  let component: Corporate;
  let fixture: ComponentFixture<Corporate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Corporate],
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

    fixture = TestBed.createComponent(Corporate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the corporate component', () => {
    expect(component).toBeTruthy();
  });

  it('should have corporateLinks defined', () => {
    expect(component.corporateLinks).toBeDefined();
    expect(component.corporateLinks.length).toBeGreaterThan(0);
  });

  it('should have correct corporate navigation links', () => {
    const routes = component.corporateLinks.map(l => l.route);
    expect(routes).toContain('/corporate');
    expect(routes).toContain('/corporate/inventory');
    expect(routes).toContain('/corporate/orders');
    expect(routes).toContain('/corporate/analytics');
  });

  it('should have monthlySales data defined', () => {
    expect(component.monthlySales).toBeDefined();
    expect(component.monthlySales.length).toBe(12);
  });

  it('should have topProducts defined', () => {
    expect(component.topProducts).toBeDefined();
    expect(component.topProducts.length).toBeGreaterThan(0);
  });

  it('should have recentOrders defined', () => {
    expect(component.recentOrders).toBeDefined();
    expect(component.recentOrders.length).toBeGreaterThan(0);
  });

  it('should have correct recentOrder structure', () => {
    const order = component.recentOrders[0];
    expect(order.id).toBeDefined();
    expect(order.customer).toBeDefined();
    expect(order.item).toBeDefined();
    expect(order.amount).toBeDefined();
    expect(order.status).toBeDefined();
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should render sidebar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const sidebar = compiled.querySelector('app-sidebar');
      expect(sidebar).toBeTruthy();
    });
  });
});
