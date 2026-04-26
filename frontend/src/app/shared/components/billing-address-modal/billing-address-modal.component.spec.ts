import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { BillingAddressModalComponent } from './billing-address-modal.component';
import { BillingAddressService } from '../../../core/services/billing-address.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserAddress } from '../../../core/models/address.model';
import { BillingProfile } from '../../../core/models/billing.model';

describe('BillingAddressModalComponent', () => {
  let component: BillingAddressModalComponent;
  let fixture: ComponentFixture<BillingAddressModalComponent>;
  let billingAddressService: any;
  let toastService: any;

  const mockAddresses: UserAddress[] = [
    {
      id: '1',
      addressTitle: 'Home',
      fullAddress: '123 Main St',
      city: 'Istanbul',
      zipCode: '34000',
      isDefault: true
    },
    {
      id: '2',
      addressTitle: 'Office',
      fullAddress: '456 Business Ave',
      city: 'Ankara',
      zipCode: '06000',
      isDefault: false
    }
  ];

  const mockBillingProfile: BillingProfile = {
    id: 'billing-1',
    accountHolderName: 'John Doe',
    address: mockAddresses[0],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const billingServiceSpy = {
      getAvailableAddresses: jest.fn(),
      setBillingAddress: jest.fn()
    };
    const toastServiceSpy = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BillingAddressModalComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: BillingAddressService, useValue: billingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingAddressModalComponent);
    component = fixture.componentInstance;
    billingAddressService = TestBed.inject(BillingAddressService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with account holder name field', () => {
    component.ngOnInit();
    
    expect(component.billingForm).toBeDefined();
    expect(component.billingForm.get('accountHolderName')).toBeDefined();
    expect(component.billingForm.get('accountHolderName')?.hasError('required')).toBeTruthy();
  });

  it('should load available addresses when modal is shown', () => {
    billingAddressService.getAvailableAddresses.mockReturnValue(of(mockAddresses));
    
    component.show = true;
    component.ngOnChanges();
    
    expect(billingAddressService.getAvailableAddresses).toHaveBeenCalled();
    expect(component.availableAddresses).toEqual(mockAddresses);
    expect(component.isLoadingAddresses).toBeFalsy();
  });

  it('should handle error when loading addresses fails', () => {
    const errorMessage = 'Failed to load addresses';
    billingAddressService.getAvailableAddresses.mockReturnValue(throwError(() => new Error(errorMessage)));
    
    component.show = true;
    component.ngOnChanges();
    
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.isLoadingAddresses).toBeFalsy();
  });

  it('should select address when clicked', () => {
    component.availableAddresses = mockAddresses;
    
    component.selectAddress('1');
    
    expect(component.selectedAddressId).toBe('1');
    expect(component.errorMessage).toBe('');
  });

  it('should return selected address correctly', () => {
    component.availableAddresses = mockAddresses;
    component.selectedAddressId = '1';
    
    const selectedAddress = component.getSelectedAddress();
    
    expect(selectedAddress).toEqual(mockAddresses[0]);
  });

  it('should validate account holder name correctly', () => {
    component.ngOnInit();
    const accountHolderControl = component.billingForm.get('accountHolderName');
    
    // Test required validation
    accountHolderControl?.setValue('');
    expect(accountHolderControl?.hasError('required')).toBeTruthy();
    
    // Test minimum length validation
    accountHolderControl?.setValue('A');
    expect(accountHolderControl?.hasError('minlength')).toBeTruthy();
    
    // Test pattern validation (invalid characters)
    accountHolderControl?.setValue('John123');
    expect(accountHolderControl?.hasError('pattern')).toBeTruthy();
    
    // Test valid input
    accountHolderControl?.setValue('John Doe');
    expect(accountHolderControl?.valid).toBeTruthy();
  });

  it('should submit form successfully when valid', () => {
    billingAddressService.setBillingAddress.mockReturnValue(of(mockBillingProfile));
    component.ngOnInit();
    component.selectedAddressId = '1';
    component.billingForm.patchValue({ accountHolderName: 'John Doe' });
    
    jest.spyOn(component.billingAddressSet, 'emit');
    jest.spyOn(component, 'closeModal');
    
    component.submitForm();
    
    expect(billingAddressService.setBillingAddress).toHaveBeenCalledWith({
      addressId: '1',
      accountHolderName: 'John Doe'
    });
    expect(toastService.success).toHaveBeenCalledWith('Fatura adresi başarıyla ayarlandı');
    expect(component.billingAddressSet.emit).toHaveBeenCalledWith(mockBillingProfile);
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should handle form submission error', () => {
    const errorMessage = 'Failed to set billing address';
    billingAddressService.setBillingAddress.mockReturnValue(throwError(() => new Error(errorMessage)));
    component.ngOnInit();
    component.selectedAddressId = '1';
    component.billingForm.patchValue({ accountHolderName: 'John Doe' });
    
    component.submitForm();
    
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.isLoading).toBeFalsy();
  });

  it('should not submit form when no address is selected', () => {
    component.ngOnInit();
    component.selectedAddressId = null;
    component.billingForm.patchValue({ accountHolderName: 'John Doe' });
    
    component.submitForm();
    
    expect(component.errorMessage).toBe('Lütfen bir adres seçin');
    expect(billingAddressService.setBillingAddress).not.toHaveBeenCalled();
  });

  it('should close modal and reset state', () => {
    component.selectedAddressId = '1';
    component.billingForm.patchValue({ accountHolderName: 'John Doe' });
    component.errorMessage = 'Some error';
    
    jest.spyOn(component.closed, 'emit');
    
    component.closeModal();
    
    expect(component.show).toBeFalsy();
    expect(component.selectedAddressId).toBeNull();
    expect(component.errorMessage).toBe('');
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should track addresses by id', () => {
    const address = mockAddresses[0];
    const result = component.trackByAddressId(0, address);
    
    expect(result).toBe(address.id);
  });
});