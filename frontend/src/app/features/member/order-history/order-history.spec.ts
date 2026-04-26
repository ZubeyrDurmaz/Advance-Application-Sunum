import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderHistory } from './order-history';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('OrderHistory - Responsive Table', () => {
  let component: OrderHistory;
  let fixture: ComponentFixture<OrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistory],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistory);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have orders data', () => {
    expect(component.orders).toBeDefined();
    expect(component.orders.length).toBeGreaterThan(0);
  });

  it('should have isMobile signal from ResponsiveService', () => {
    expect(component.isMobile).toBeDefined();
    expect(typeof component.isMobile()).toBe('boolean');
  });

  it('should render order data correctly', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check that either mobile cards or desktop table is rendered
    const mobileCards = compiled.querySelector('.oh-table-cards');
    const desktopTable = compiled.querySelector('.oh-table');
    
    // One of them should be present
    expect(mobileCards || desktopTable).toBeTruthy();
  });

  it('should open tracking modal when order is clicked', () => {
    fixture.detectChanges();
    
    expect(component.selectedOrder).toBeNull();
    
    const order = component.orders[0];
    component.openTracking(order);
    
    expect(component.selectedOrder).toBe(order);
  });

  it('should close tracking modal', () => {
    const order = component.orders[0];
    component.openTracking(order);
    
    expect(component.selectedOrder).toBe(order);
    
    component.closeTracking();
    
    expect(component.selectedOrder).toBeNull();
  });

  it('should have all required order properties', () => {
    const order = component.orders[0];
    
    expect(order.name).toBeDefined();
    expect(order.ref).toBeDefined();
    expect(order.date).toBeDefined();
    expect(order.value).toBeDefined();
    expect(order.status).toBeDefined();
    expect(order.image).toBeDefined();
    expect(order.tracking).toBeDefined();
  });
});
