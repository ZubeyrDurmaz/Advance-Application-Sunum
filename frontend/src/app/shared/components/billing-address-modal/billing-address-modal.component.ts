import { Component, EventEmitter, Input, Output, OnInit, OnChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAddressService } from '../../../core/services/billing-address.service';
import { UserAddress } from '../../../core/models/address.model';
import { SetBillingAddressRequest, CreateBillingAddressRequest, UpdateBillingProfileRequest, BillingProfile } from '../../../core/models/billing.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-billing-address-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './billing-address-modal.component.html',
  styleUrl: './billing-address-modal.component.css'
})
export class BillingAddressModalComponent implements OnInit, OnChanges {
  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  
  @Input() show = false;
  @Input() editingBillingProfile: BillingProfile | null = null; // New input for editing mode
  @Output() closed = new EventEmitter<void>();
  @Output() billingAddressSet = new EventEmitter<BillingProfile>();

  // Keyboard navigation: Listen for Escape key to close modal
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.show) {
      keyboardEvent.preventDefault();
      this.closeModal();
    }
  }

  availableAddresses: UserAddress[] = [];
  selectedAddressId: string | null = null;
  billingForm!: FormGroup;
  createAddressForm!: FormGroup;
  editBillingForm!: FormGroup; // New form for editing
  isLoading = false;
  isLoadingAddresses = false;
  errorMessage = '';
  
  // Modal state management
  currentView: 'select' | 'create' | 'edit' = 'select'; // Added 'edit' view
  
  // Focus management
  private triggerButton: HTMLElement | null = null;

  constructor(
    private billingAddressService: BillingAddressService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCreateAddressForm();
    this.initializeEditBillingForm();
  }

  ngOnChanges(): void {
    if (this.show) {
      this.loadAvailableAddresses();
      this.storeFocusReference();
      this.resetModalState();
      
      // Determine initial view based on whether we're editing
      if (this.editingBillingProfile) {
        this.currentView = 'edit';
        this.populateEditForm();
      } else {
        this.currentView = 'select';
      }
      
      // Focus first input when modal opens
      setTimeout(() => {
        this.firstInput?.nativeElement.focus();
      }, 100);
    }
  }

  initializeForm(): void {
    this.billingForm = this.fb.group({
      accountHolderName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-\.\']+$/)
      ]]
    });
  }

  initializeCreateAddressForm(): void {
    this.createAddressForm = this.fb.group({
      addressTitle: ['', [Validators.maxLength(100)]],
      fullAddress: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(255)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-\.\']+$/)
      ]],
      zipCode: ['', [
        Validators.maxLength(10),
        Validators.pattern(/^[0-9\-\s]+$/)
      ]],
      accountHolderName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-\.\']+$/)
      ]]
    });
  }

  initializeEditBillingForm(): void {
    this.editBillingForm = this.fb.group({
      addressId: [''],
      accountHolderName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-\.\']+$/)
      ]],
      addressTitle: ['', [Validators.maxLength(100)]],
      fullAddress: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(255)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-\.\']+$/)
      ]],
      zipCode: ['', [
        Validators.maxLength(10),
        Validators.pattern(/^[0-9\-\s]+$/)
      ]]
    });
  }

  loadAvailableAddresses(): void {
    this.isLoadingAddresses = true;
    this.errorMessage = '';
    
    this.billingAddressService.getAvailableAddresses().subscribe({
      next: (addresses) => {
        this.availableAddresses = addresses;
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        const errorMsg = error.message || 'Adresler yüklenirken hata oluştu';
        this.errorMessage = errorMsg;
        this.isLoadingAddresses = false;
      }
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
    this.errorMessage = '';
  }

  resetModalState(): void {
    this.currentView = this.editingBillingProfile ? 'edit' : 'select';
    this.selectedAddressId = null;
    this.billingForm.reset();
    this.createAddressForm.reset();
    this.editBillingForm.reset();
    this.errorMessage = '';
  }

  switchToCreateView(): void {
    this.currentView = 'create';
    this.errorMessage = '';
    // Focus first input in create form
    setTimeout(() => {
      const firstCreateInput = document.querySelector('#addressTitle') as HTMLInputElement;
      firstCreateInput?.focus();
    }, 100);
  }

  switchToEditView(): void {
    this.currentView = 'edit';
    this.errorMessage = '';
    this.populateEditForm();
    // Focus first input in edit form
    setTimeout(() => {
      const firstEditInput = document.querySelector('#editAccountHolderName') as HTMLInputElement;
      firstEditInput?.focus();
    }, 100);
  }

  switchToSelectView(): void {
    this.currentView = 'select';
    this.errorMessage = '';
    // Focus first input in select form
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 100);
  }

  populateEditForm(): void {
    if (!this.editingBillingProfile) return;
    
    const profile = this.editingBillingProfile;
    this.editBillingForm.patchValue({
      addressId: profile.address?.id || '',
      accountHolderName: profile.accountHolderName || '',
      addressTitle: profile.address?.addressTitle || '',
      fullAddress: profile.address?.fullAddress || '',
      city: profile.address?.city || '',
      zipCode: profile.address?.zipCode || ''
    });
  }

  storeFocusReference(): void {
    this.triggerButton = document.activeElement as HTMLElement;
  }

  closeModal(): void {
    this.show = false;
    this.resetModalState();
    this.closed.emit();
    
    // Return focus to trigger button when modal closes
    if (this.triggerButton) {
      this.triggerButton.focus();
      this.triggerButton = null;
    }
  }

  onOverlayClick(): void {
    this.closeModal();
  }

  submitForm(): void {
    if (this.currentView === 'select') {
      this.submitSelectForm();
    } else if (this.currentView === 'create') {
      this.submitCreateForm();
    } else if (this.currentView === 'edit') {
      this.submitEditForm();
    }
  }

  submitSelectForm(): void {
    if (this.billingForm.invalid || !this.selectedAddressId) {
      if (!this.selectedAddressId) {
        this.errorMessage = 'Lütfen bir adres seçin';
      }
      return;
    }

    const formValue = this.billingForm.value;
    const request: SetBillingAddressRequest = {
      addressId: this.selectedAddressId,
      accountHolderName: formValue.accountHolderName
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.billingAddressService.setBillingAddress(request).subscribe({
      next: (billingProfile) => {
        this.isLoading = false;
        this.toastService.success('Fatura adresi başarıyla ayarlandı');
        this.billingAddressSet.emit(billingProfile);
        this.closeModal();
      },
      error: (error) => {
        const errorMsg = error.message || 'Fatura adresi ayarlanırken hata oluştu';
        this.errorMessage = errorMsg;
        this.isLoading = false;
      }
    });
  }

  submitCreateForm(): void {
    if (this.createAddressForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.createAddressForm.controls).forEach(key => {
        this.createAddressForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.createAddressForm.value;
    const request: CreateBillingAddressRequest = {
      addressTitle: formValue.addressTitle || undefined,
      fullAddress: formValue.fullAddress,
      city: formValue.city,
      zipCode: formValue.zipCode || undefined,
      accountHolderName: formValue.accountHolderName
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.billingAddressService.createBillingAddress(request).subscribe({
      next: (billingProfile) => {
        this.isLoading = false;
        this.toastService.success('Yeni fatura adresi başarıyla oluşturuldu');
        this.billingAddressSet.emit(billingProfile);
        this.closeModal();
      },
      error: (error) => {
        const errorMsg = error.message || 'Fatura adresi oluşturulurken hata oluştu';
        this.errorMessage = errorMsg;
        this.isLoading = false;
      }
    });
  }

  submitEditForm(): void {
    if (this.editBillingForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.editBillingForm.controls).forEach(key => {
        this.editBillingForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.editBillingForm.value;
    const request: UpdateBillingProfileRequest = {
      addressId: formValue.addressId || undefined,
      accountHolderName: formValue.accountHolderName,
      addressTitle: formValue.addressTitle || undefined,
      fullAddress: formValue.fullAddress || undefined,
      city: formValue.city || undefined,
      zipCode: formValue.zipCode || undefined
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.billingAddressService.updateBillingProfile(request).subscribe({
      next: (billingProfile) => {
        this.isLoading = false;
        this.toastService.success('Fatura profili başarıyla güncellendi');
        this.billingAddressSet.emit(billingProfile);
        this.closeModal();
      },
      error: (error) => {
        const errorMsg = error.message || 'Fatura profili güncellenirken hata oluştu';
        this.errorMessage = errorMsg;
        this.isLoading = false;
      }
    });
  }

  // Helper methods for form validation feedback
  isFieldInvalid(fieldName: string, formName: 'billing' | 'create' | 'edit' = 'billing'): boolean {
    let form: FormGroup;
    if (formName === 'billing') {
      form = this.billingForm;
    } else if (formName === 'create') {
      form = this.createAddressForm;
    } else {
      form = this.editBillingForm;
    }
    
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string, formName: 'billing' | 'create' | 'edit' = 'billing'): boolean {
    let form: FormGroup;
    if (formName === 'billing') {
      form = this.billingForm;
    } else if (formName === 'create') {
      form = this.createAddressForm;
    } else {
      form = this.editBillingForm;
    }
    
    const field = form.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formName: 'billing' | 'create' | 'edit' = 'billing'): string {
    let form: FormGroup;
    if (formName === 'billing') {
      form = this.billingForm;
    } else if (formName === 'create') {
      form = this.createAddressForm;
    } else {
      form = this.editBillingForm;
    }
    
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Bu alan zorunludur';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      if (requiredLength === 2) return 'En az 2 karakter olmalıdır';
      if (requiredLength === 5) return 'En az 5 karakter olmalıdır';
      return `En az ${requiredLength} karakter olmalıdır`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maksimum ${maxLength} karakter olmalıdır`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'city' || fieldName === 'accountHolderName') {
        return 'Sadece harfler, boşluk ve yaygın noktalama işaretleri kullanılabilir';
      }
      if (fieldName === 'zipCode') {
        return 'Sadece rakamlar, tire ve boşluk kullanılabilir';
      }
    }
    return 'Geçersiz değer';
  }

  getSelectedAddress(): UserAddress | null {
    if (!this.selectedAddressId) return null;
    return this.availableAddresses.find(addr => addr.id === this.selectedAddressId) || null;
  }

  trackByAddressId(index: number, address: UserAddress): string {
    return address.id;
  }
}