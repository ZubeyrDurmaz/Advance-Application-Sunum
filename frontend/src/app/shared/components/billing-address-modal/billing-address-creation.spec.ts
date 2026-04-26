import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BillingAddressModalComponent } from './billing-address-modal.component';
import { BillingAddressService } from '../../../core/services/billing-address.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateBillingAddressRequest, BillingProfile } from '../../../core/models/billing.model';

describe('BillingAddressModalComponent - Creation Form', () => {
  let component: BillingAddressModalComponent;
  let fixture: ComponentFixture<BillingAddressModalComponent>;
  let billingAddressService: jasmine.SpyObj<BillingAddressService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockBillingProfile: BillingProfile = {
    id: 'billing-123',
    accountHolderName: 'John Doe',
    address: {
      id: 'addr-123',
      addressTitle: 'Test Address',
      fullAddress: '123 Test Street',
      city: 'Istanbul',
      zipCode: '34000',
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const billingServiceSpy = jasmine.createSpyObj('BillingAddressService', [
      'createBillingAddress',
      'getAvailableAddresses'
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [BillingAddressModalComponent, ReactiveFormsModule],
      providers: [
        { provide: BillingAddressService, useValue: billingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingAddressModalComponent);
    component = fixture.componentInstance;
    billingAddressService = TestBed.inject(BillingAddressService) as jasmine.SpyObj<BillingAddressService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    billingAddressService.getAvailableAddresses.and.returnValue(of([]));
  });

  describe('Create Address Form', () => {
    beforeEach(() => {
      component.show = true;
      component.ngOnChanges();
      component.switchToCreateView();
      fixture.detectChanges();
    });

    it('should initialize create address form with proper validation', () => {
      expect(component.createAddressForm).toBeDefined();
      expect(component.createAddressForm.get('fullAddress')?.hasError('required')).toBeTruthy();
      expect(component.createAddressForm.get('city')?.hasError('required')).toBeTruthy();
      expect(component.createAddressForm.get('accountHolderName')?.hasError('required')).toBeTruthy();
    });

    it('should validate full address field', () => {
      const fullAddressControl = component.createAddressForm.get('fullAddress');
      
      // Test required validation
      fullAddressControl?.setValue('');
      expect(fullAddressControl?.hasError('required')).toBeTruthy();
      
      // Test minimum length validation
      fullAddressControl?.setValue('123');
      expect(fullAddressControl?.hasError('minlength')).toBeTruthy();
      
      // Test valid input
      fullAddressControl?.setValue('123 Main Street, Apartment 4B');
      expect(fullAddressControl?.valid).toBeTruthy();
    });

    it('should validate city field with pattern', () => {
      const cityControl = component.createAddressForm.get('city');
      
      // Test required validation
      cityControl?.setValue('');
      expect(cityControl?.hasError('required')).toBeTruthy();
      
      // Test pattern validation - invalid characters
      cityControl?.setValue('Istanbul123');
      expect(cityControl?.hasError('pattern')).toBeTruthy();
      
      // Test valid city name
      cityControl?.setValue('İstanbul');
      expect(cityControl?.valid).toBeTruthy();
      
      // Test city with spaces and punctuation
      cityControl?.setValue('New York');
      expect(cityControl?.valid).toBeTruthy();
    });

    it('should validate zip code field with pattern', () => {
      const zipCodeControl = component.createAddressForm.get('zipCode');
      
      // Test valid zip code
      zipCodeControl?.setValue('34000');
      expect(zipCodeControl?.valid).toBeTruthy();
      
      // Test zip code with dash
      zipCodeControl?.setValue('34000-123');
      expect(zipCodeControl?.valid).toBeTruthy();
      
      // Test invalid zip code with letters
      zipCodeControl?.setValue('34ABC');
      expect(zipCodeControl?.hasError('pattern')).toBeTruthy();
      
      // Test empty zip code (should be valid as it's optional)
      zipCodeControl?.setValue('');
      expect(zipCodeControl?.valid).toBeTruthy();
    });

    it('should validate account holder name field', () => {
      const accountHolderControl = component.createAddressForm.get('accountHolderName');
      
      // Test required validation
      accountHolderControl?.setValue('');
      expect(accountHolderControl?.hasError('required')).toBeTruthy();
      
      // Test minimum length validation
      accountHolderControl?.setValue('J');
      expect(accountHolderControl?.hasError('minlength')).toBeTruthy();
      
      // Test pattern validation - invalid characters
      accountHolderControl?.setValue('John123');
      expect(accountHolderControl?.hasError('pattern')).toBeTruthy();
      
      // Test valid name
      accountHolderControl?.setValue('John Doe');
      expect(accountHolderControl?.valid).toBeTruthy();
      
      // Test name with Turkish characters
      accountHolderControl?.setValue('Ahmet Özkan');
      expect(accountHolderControl?.valid).toBeTruthy();
    });

    it('should create billing address successfully', () => {
      billingAddressService.createBillingAddress.and.returnValue(of(mockBillingProfile));
      
      // Fill form with valid data
      component.createAddressForm.patchValue({
        addressTitle: 'Home Address',
        fullAddress: '123 Main Street, Apartment 4B',
        city: 'Istanbul',
        zipCode: '34000',
        accountHolderName: 'John Doe'
      });

      spyOn(component.billingAddressSet, 'emit');
      spyOn(component, 'closeModal');

      component.submitCreateForm();

      const expectedRequest: CreateBillingAddressRequest = {
        addressTitle: 'Home Address',
        fullAddress: '123 Main Street, Apartment 4B',
        city: 'Istanbul',
        zipCode: '34000',
        accountHolderName: 'John Doe'
      };

      expect(billingAddressService.createBillingAddress).toHaveBeenCalledWith(expectedRequest);
      expect(toastService.success).toHaveBeenCalledWith('Yeni fatura adresi başarıyla oluşturuldu');
      expect(component.billingAddressSet.emit).toHaveBeenCalledWith(mockBillingProfile);
      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should handle create billing address error', () => {
      const errorMessage = 'Fatura adresi oluşturulamadı';
      billingAddressService.createBillingAddress.and.returnValue(throwError(() => new Error(errorMessage)));
      
      // Fill form with valid data
      component.createAddressForm.patchValue({
        fullAddress: '123 Main Street',
        city: 'Istanbul',
        accountHolderName: 'John Doe'
      });

      component.submitCreateForm();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalsy();
    });

    it('should not submit form with invalid data', () => {
      // Leave form empty (invalid)
      component.submitCreateForm();

      expect(billingAddressService.createBillingAddress).not.toHaveBeenCalled();
      expect(component.createAddressForm.get('fullAddress')?.touched).toBeTruthy();
      expect(component.createAddressForm.get('city')?.touched).toBeTruthy();
      expect(component.createAddressForm.get('accountHolderName')?.touched).toBeTruthy();
    });

    it('should handle optional fields correctly', () => {
      billingAddressService.createBillingAddress.and.returnValue(of(mockBillingProfile));
      
      // Fill form without optional fields
      component.createAddressForm.patchValue({
        fullAddress: '123 Main Street',
        city: 'Istanbul',
        accountHolderName: 'John Doe'
      });

      component.submitCreateForm();

      const expectedRequest: CreateBillingAddressRequest = {
        addressTitle: undefined,
        fullAddress: '123 Main Street',
        city: 'Istanbul',
        zipCode: undefined,
        accountHolderName: 'John Doe'
      };

      expect(billingAddressService.createBillingAddress).toHaveBeenCalledWith(expectedRequest);
    });

    it('should provide correct field error messages', () => {
      // Test full address error
      component.createAddressForm.get('fullAddress')?.setValue('');
      component.createAddressForm.get('fullAddress')?.markAsTouched();
      expect(component.getFieldError('fullAddress', 'create')).toBe('Bu alan zorunludur');

      component.createAddressForm.get('fullAddress')?.setValue('123');
      expect(component.getFieldError('fullAddress', 'create')).toBe('En az 5 karakter olmalıdır');

      // Test city error
      component.createAddressForm.get('city')?.setValue('City123');
      component.createAddressForm.get('city')?.markAsTouched();
      expect(component.getFieldError('city', 'create')).toBe('Sadece harfler, boşluk ve yaygın noktalama işaretleri kullanılabilir');

      // Test zip code error
      component.createAddressForm.get('zipCode')?.setValue('ABC123');
      component.createAddressForm.get('zipCode')?.markAsTouched();
      expect(component.getFieldError('zipCode', 'create')).toBe('Sadece rakamlar, tire ve boşluk kullanılabilir');

      // Test account holder name error
      component.createAddressForm.get('accountHolderName')?.setValue('J');
      component.createAddressForm.get('accountHolderName')?.markAsTouched();
      expect(component.getFieldError('accountHolderName', 'create')).toBe('En az 2 karakter olmalıdır');
    });

    it('should switch between views correctly', () => {
      expect(component.currentView).toBe('create');

      component.switchToSelectView();
      expect(component.currentView).toBe('select');
      expect(component.errorMessage).toBe('');

      component.switchToCreateView();
      expect(component.currentView).toBe('create');
      expect(component.errorMessage).toBe('');
    });

    it('should reset modal state when closed', () => {
      // Set some form data
      component.createAddressForm.patchValue({
        fullAddress: '123 Test Street',
        city: 'Istanbul'
      });
      component.currentView = 'create';
      component.errorMessage = 'Some error';

      component.closeModal();

      expect(component.currentView).toBe('select');
      expect(component.errorMessage).toBe('');
      expect(component.createAddressForm.get('fullAddress')?.value).toBe('');
      expect(component.createAddressForm.get('city')?.value).toBe('');
    });
  });
});