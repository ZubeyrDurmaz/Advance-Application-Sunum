import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Payments } from '../../app/features/member/payments/payments';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentMethodService } from '../../app/core/services/payment-method.service';
import { BillingAddressService } from '../../app/core/services/billing-address.service';
import { ToastService } from '../../app/core/services/toast.service';
import { of, throwError } from 'rxjs';
import { BillingProfile } from '../../app/core/models/billing.model';

describe('Payments Component', () => {
  let component: Payments;
  let fixture: ComponentFixture<Payments>;

  const mockPaymentMethodService = {
    getPaymentMethods: vi.fn(() => of([])),
    createPaymentMethod: vi.fn(),
    updatePaymentMethod: vi.fn(),
    deletePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn()
  };

  const mockBillingAddressService = {
    getBillingProfile: vi.fn(() => of(null)),
    setBillingAddress: vi.fn(),
    createBillingAddress: vi.fn(),
    updateBillingProfile: vi.fn(),
    clearBillingAddress: vi.fn(),
    getAvailableAddresses: vi.fn()
  };

  const mockToastService = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Payments],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PaymentMethodService, useValue: mockPaymentMethodService },
        { provide: BillingAddressService, useValue: mockBillingAddressService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Payments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the payments component', () => {
    expect(component).toBeTruthy();
  });

  it('should load billing profile on initialization', () => {
    expect(mockBillingAddressService.getBillingProfile).toHaveBeenCalled();
    expect(component.billingProfile).toBeNull();
    expect(component.isBillingLoading).toBe(false);
  });

  it('should handle billing profile loading success', () => {
    const mockBillingProfile: BillingProfile = {
      id: '1',
      accountHolderName: 'John Doe',
      address: {
        id: 'addr-1',
        addressTitle: 'Home',
        fullAddress: '123 Main St',
        city: 'Istanbul',
        zipCode: '34000',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    mockBillingAddressService.getBillingProfile.mockReturnValue(of(mockBillingProfile));
    
    component.loadBillingProfile();
    
    expect(component.billingProfile).toEqual(mockBillingProfile);
    expect(component.isBillingLoading).toBe(false);
    expect(component.billingErrorMessage).toBe('');
  });

  it('should handle billing profile loading error', () => {
    const errorMessage = 'Failed to load billing profile';
    mockBillingAddressService.getBillingProfile.mockReturnValue(throwError(() => new Error(errorMessage)));
    
    component.loadBillingProfile();
    
    expect(component.billingProfile).toBeNull();
    expect(component.isBillingLoading).toBe(false);
    expect(component.billingErrorMessage).toBe(errorMessage);
  });

  it('should show info toast when edit billing profile is clicked', () => {
    component.openEditBillingProfile();
    
    expect(mockToastService.info).toHaveBeenCalledWith('Fatura adresi düzenleme özelliği yakında eklenecek');
  });

  it('should initialize with empty payment methods', () => {
    expect(component.paymentMethods).toEqual([]);
  });

  it('should have a payment form', () => {
    expect(component.paymentForm).toBeDefined();
  });

  describe('Template', () => {
    it('should render the payments page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should have content in the template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
