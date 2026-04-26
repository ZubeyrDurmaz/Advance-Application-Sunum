import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreManagement } from '../../../app/features/member/admin/store-management/store-management';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('StoreManagement Component', () => {
  let component: StoreManagement;
  let fixture: ComponentFixture<StoreManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreManagement],
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

    fixture = TestBed.createComponent(StoreManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the store-management component', () => {
    expect(component).toBeTruthy();
  });

  it('should have stores signal defined with initial data', () => {
    expect(component.stores()).toBeDefined();
    expect(component.stores().length).toBeGreaterThan(0);
  });

  it('should have correct store structure', () => {
    const store = component.stores()[0];
    expect(store.id).toBeDefined();
    expect(store.name).toBeDefined();
    expect(store.location).toBeDefined();
    expect(store.manager).toBeDefined();
    expect(store.status).toBeDefined();
    expect(store.revenue).toBeDefined();
    expect(typeof store.orders).toBe('number');
  });

  describe('toggleStatus()', () => {
    it('should toggle store status from open to closed', () => {
      const openStore = component.stores().find(s => s.status === 'open');
      expect(openStore).toBeTruthy();

      component.toggleStatus(openStore!.id);

      const updated = component.stores().find(s => s.id === openStore!.id);
      expect(updated!.status).toBe('closed');
    });

    it('should toggle store status from closed to open', () => {
      const closedStore = component.stores().find(s => s.status === 'closed');
      expect(closedStore).toBeTruthy();

      component.toggleStatus(closedStore!.id);

      const updated = component.stores().find(s => s.id === closedStore!.id);
      expect(updated!.status).toBe('open');
    });

    it('should not affect other stores when toggling one', () => {
      const stores = component.stores();
      const firstStore = stores[0];
      const otherStores = stores.slice(1);

      component.toggleStatus(firstStore.id);

      const updatedOthers = component.stores().slice(1);
      updatedOthers.forEach((store, i) => {
        expect(store.status).toBe(otherStores[i].status);
      });
    });
  });

  describe('setMaintenance()', () => {
    it('should set store status to maintenance', () => {
      const store = component.stores()[0];
      component.setMaintenance(store.id);

      const updated = component.stores().find(s => s.id === store.id);
      expect(updated!.status).toBe('maintenance');
    });

    it('should not affect other stores', () => {
      const stores = component.stores();
      const firstStore = stores[0];

      component.setMaintenance(firstStore.id);

      const updatedOthers = component.stores().slice(1);
      updatedOthers.forEach(store => {
        expect(store.status).not.toBe('maintenance');
      });
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
