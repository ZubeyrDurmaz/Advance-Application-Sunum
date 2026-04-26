import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { UserPaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '../../../core/models/payment-method.model';
import { BillingAddressService } from '../../../core/services/billing-address.service';
import { BillingProfile } from '../../../core/models/billing.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton/skeleton-card.component';
import { BillingAddressModalComponent } from '../../../shared/components/billing-address-modal/billing-address-modal.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-payments',
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ConfirmDialogComponent, SkeletonCardComponent, BillingAddressModalComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  
  // Keyboard navigation: Listen for Escape key to close modal
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.showModal) {
      keyboardEvent.preventDefault();
      this.closeModal();
    }
  }
  paymentMethods: UserPaymentMethod[] = [];
  isLoading = false;
  isInitialLoad = true;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  editingPaymentMethod: UserPaymentMethod | null = null;
  paymentForm!: FormGroup;
  
  // Billing profile state
  billingProfile: BillingProfile | null = null;
  isBillingLoading = false;
  billingErrorMessage = '';
  
  // Confirmation dialog state
  showDeleteConfirm = false;
  deleteTargetId: string | null = null;
  
  // Billing address modal state
  showBillingModal = false;
  editingBillingProfile: BillingProfile | null = null;
  
  // Focus management
  private triggerButton: HTMLElement | null = null;

  constructor(
    private paymentMethodService: PaymentMethodService,
    private billingAddressService: BillingAddressService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPaymentMethods();
    this.loadBillingProfile();
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      methodType: ['', [Validators.required, Validators.maxLength(50)]],
      provider: ['', [Validators.maxLength(50)]],
      cardToken: ['', [Validators.maxLength(255)]],
      lastFour: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{4}$/)]],
      isDefault: [false]
    });
  }

  loadPaymentMethods(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        this.isLoading = false;
        this.isInitialLoad = false;
      },
      error: (error) => {
        const errorMsg = error.message || 'Ödeme yöntemleri yüklenirken hata oluştu';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
        this.isInitialLoad = false;
      }
    });
  }

  loadBillingProfile(): void {
    this.isBillingLoading = true;
    this.billingErrorMessage = '';
    
    this.billingAddressService.getBillingProfile().pipe(
      catchError((error: any) => {
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      })
    ).subscribe({
      next: (profile) => {
        this.billingProfile = profile;
        this.isBillingLoading = false;
      },
      error: (error) => {
        const errorMsg = error.message || 'Fatura adresi yüklenirken hata oluştu';
        this.billingErrorMessage = errorMsg;
        this.isBillingLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingPaymentMethod = null;
    this.paymentForm.reset();
    
    // If this is the first payment method, set isDefault to true
    if (this.paymentMethods.length === 0) {
      this.paymentForm.patchValue({ isDefault: true });
    }
    
    // Make cardToken required for create
    this.paymentForm.get('cardToken')?.setValidators([Validators.required, Validators.maxLength(255)]);
    this.paymentForm.get('cardToken')?.updateValueAndValidity();
    
    // Store reference to trigger button for focus management
    this.triggerButton = document.activeElement as HTMLElement;
    
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Focus first input when modal opens
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 100);
  }

  openEditModal(paymentMethod: UserPaymentMethod): void {
    this.editingPaymentMethod = paymentMethod;
    
    // Populate form with existing data, leave cardToken empty for security
    this.paymentForm.patchValue({
      methodType: paymentMethod.methodType,
      provider: paymentMethod.provider || '',
      cardToken: '',
      lastFour: paymentMethod.lastFour || '',
      expiryDate: paymentMethod.expiryDate || '',
      isDefault: paymentMethod.isDefault
    });
    
    // Make cardToken optional for update
    this.paymentForm.get('cardToken')?.clearValidators();
    this.paymentForm.get('cardToken')?.setValidators([Validators.maxLength(255)]);
    this.paymentForm.get('cardToken')?.updateValueAndValidity();
    
    // Store reference to trigger button for focus management
    this.triggerButton = document.activeElement as HTMLElement;
    
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Focus first input when modal opens
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 100);
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPaymentMethod = null;
    this.paymentForm.reset();
    this.errorMessage = '';
    
    // Return focus to trigger button when modal closes
    if (this.triggerButton) {
      this.triggerButton.focus();
      this.triggerButton = null;
    }
  }

  submitForm(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    const formValue = this.paymentForm.value;
    
    if (this.editingPaymentMethod) {
      // Update existing payment method
      const updateRequest: UpdatePaymentMethodRequest = {
        methodType: formValue.methodType,
        provider: formValue.provider,
        lastFour: formValue.lastFour,
        expiryDate: formValue.expiryDate,
        isDefault: formValue.isDefault
      };
      
      // Only include cardToken if it was provided
      if (formValue.cardToken) {
        updateRequest.cardToken = formValue.cardToken;
      }
      
      this.isLoading = true;
      this.paymentMethodService.updatePaymentMethod(this.editingPaymentMethod.id, updateRequest).subscribe({
        next: (updatedMethod) => {
          // Update the payment method in the list
          const index = this.paymentMethods.findIndex(m => m.id === updatedMethod.id);
          if (index !== -1) {
            this.paymentMethods[index] = updatedMethod;
            
            // If this was set as default, update others
            if (updatedMethod.isDefault) {
              this.paymentMethods.forEach(m => {
                if (m.id !== updatedMethod.id) {
                  m.isDefault = false;
                }
              });
            }
          }
          
          this.isLoading = false;
          this.toastService.success('Ödeme yöntemi başarıyla güncellendi');
          this.closeModal();
        },
        error: (error) => {
          const errorMsg = error.message || 'Ödeme yöntemi güncellenirken hata oluştu';
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg);
          this.isLoading = false;
        }
      });
    } else {
      // Create new payment method
      const createRequest: CreatePaymentMethodRequest = {
        methodType: formValue.methodType,
        provider: formValue.provider,
        cardToken: formValue.cardToken,
        lastFour: formValue.lastFour,
        expiryDate: formValue.expiryDate,
        isDefault: formValue.isDefault
      };
      
      this.isLoading = true;
      this.paymentMethodService.createPaymentMethod(createRequest).subscribe({
        next: (newMethod) => {
          // If new method is default, update others
          if (newMethod.isDefault) {
            this.paymentMethods.forEach(m => m.isDefault = false);
          }
          
          this.paymentMethods.push(newMethod);
          this.isLoading = false;
          this.toastService.success('Ödeme yöntemi başarıyla eklendi');
          this.closeModal();
        },
        error: (error) => {
          const errorMsg = error.message || 'Ödeme yöntemi eklenirken hata oluştu';
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg);
          this.isLoading = false;
        }
      });
    }
  }

  deletePaymentMethod(id: string): void {
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTargetId) return;

    const id = this.deleteTargetId;
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentMethodService.deletePaymentMethod(id).subscribe({
      next: () => {
        this.paymentMethods = this.paymentMethods.filter(m => m.id !== id);
        this.isLoading = false;
        this.toastService.success('Ödeme yöntemi başarıyla silindi');
      },
      error: (error) => {
        const errorMsg = error.message || 'Ödeme yöntemi silinirken hata oluştu';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  setAsDefault(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentMethodService.setDefaultPaymentMethod(id).subscribe({
      next: (updatedMethod) => {
        // Update all payment methods: set selected one to default, others to false
        this.paymentMethods.forEach(m => {
          m.isDefault = m.id === updatedMethod.id;
        });
        
        this.isLoading = false;
        this.toastService.success('Varsayılan ödeme yöntemi güncellendi');
      },
      error: (error) => {
        const errorMsg = error.message || 'Varsayılan ödeme yöntemi ayarlanırken hata oluştu';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  // Helper methods for form validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Bu alan zorunludur';
    if (field.errors['maxlength']) return `Maksimum ${field.errors['maxlength'].requiredLength} karakter olmalıdır`;
    if (field.errors['pattern']) {
      if (fieldName === 'lastFour') return 'Tam olarak 4 rakam olmalıdır';
      if (fieldName === 'expiryDate') return 'MM/YYYY formatında olmalıdır';
    }
    return 'Geçersiz değer';
  }

  openEditBillingProfile(): void {
    // Set the current billing profile for editing if it exists
    this.editingBillingProfile = this.billingProfile;
    this.showBillingModal = true;
  }

  onBillingModalClosed(): void {
    this.showBillingModal = false;
    this.editingBillingProfile = null; // Clear editing state
  }

  onBillingAddressSet(billingProfile: BillingProfile): void {
    // Update the local billing profile state
    this.billingProfile = billingProfile;
    this.showBillingModal = false;
    this.editingBillingProfile = null; // Clear editing state
  }
}
