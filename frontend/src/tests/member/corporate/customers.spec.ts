import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customers } from '../../../app/features/member/corporate/customers/customers';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('Customers Component', () => {
  let component: Customers;
  let fixture: ComponentFixture<Customers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customers],
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

    fixture = TestBed.createComponent(Customers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the customers component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchQuery as empty string', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should initialize filterTier as "all"', () => {
    expect(component.filterTier()).toBe('all');
  });

  it('should initialize selectedCustomer as null', () => {
    expect(component.selectedCustomer).toBeNull();
  });

  it('should have customers signal with initial data', () => {
    expect(component.customers()).toBeDefined();
    expect(component.customers().length).toBeGreaterThan(0);
  });

  it('should have correct customer structure', () => {
    const customer = component.customers()[0];
    expect(customer.id).toBeDefined();
    expect(customer.name).toBeDefined();
    expect(customer.email).toBeDefined();
    expect(customer.tier).toBeDefined();
    expect(typeof customer.totalSpent).toBe('number');
    expect(typeof customer.orders).toBe('number');
    expect(customer.lastOrder).toBeDefined();
    expect(customer.location).toBeDefined();
  });

  describe('filtered computed', () => {
    it('should return all customers when no filter is applied', () => {
      expect(component.filtered().length).toBe(component.customers().length);
    });

    it('should filter customers by name', () => {
      component.searchQuery.set('Alexander');
      const results = component.filtered();
      expect(results.every(c => c.name.toLowerCase().includes('alexander'))).toBe(true);
    });

    it('should filter customers by email', () => {
      component.searchQuery.set('elena@example');
      const results = component.filtered();
      expect(results.length).toBe(1);
      expect(results[0].email).toContain('elena@example');
    });

    it('should filter customers by location', () => {
      component.searchQuery.set('London');
      const results = component.filtered();
      expect(results.every(c => c.location.toLowerCase().includes('london'))).toBe(true);
    });

    it('should filter customers by tier', () => {
      component.filterTier.set('Platinum');
      const results = component.filtered();
      expect(results.every(c => c.tier === 'Platinum')).toBe(true);
    });

    it('should combine search and tier filters', () => {
      component.filterTier.set('Gold');
      component.searchQuery.set('Elena');
      const results = component.filtered();
      expect(results.every(c => c.tier === 'Gold' && c.name.toLowerCase().includes('elena'))).toBe(true);
    });
  });

  describe('formatPrice()', () => {
    it('should format price with locale formatting', () => {
      const result = component.formatPrice(248500);
      // Locale-agnostic: just verify it contains the number digits
      expect(result).toContain('248');
      expect(result).toContain('500');
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
