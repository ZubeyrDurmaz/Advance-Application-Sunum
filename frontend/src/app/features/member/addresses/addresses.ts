import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { UserAddress, CreateAddressRequest, UpdateAddressRequest } from '../../../core/models/address.model';
import { BillingAddressService } from '../../../core/services/billing-address.service';
import { BillingProfile } from '../../../core/models/billing.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton/skeleton-card.component';
import { BillingAddressModalComponent } from '../../../shared/components/billing-address-modal/billing-address-modal.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-addresses',
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ConfirmDialogComponent, SkeletonCardComponent, BillingAddressModalComponent],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses implements OnInit {
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
  
  addresses: UserAddress[] = [];
  billingProfile: BillingProfile | null = null;
  isLoading = false;
  isInitialLoad = true;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  showBillingModal = false;
  editingAddress: UserAddress | null = null;
  addressForm!: FormGroup;
  
  // Confirmation dialog state
  showDeleteConfirm = false;
  deleteTargetId: string | null = null;
  
  // Focus management
  private triggerButton: HTMLElement | null = null;

  constructor(
    private addressService: AddressService,
    private billingAddressService: BillingAddressService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAddresses();
  }

  initializeForm(): void {
    this.addressForm = this.fb.group({
      addressTitle: ['', [Validators.maxLength(50)]],
      fullAddress: ['', [Validators.required]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      zipCode: ['', [Validators.maxLength(10)]],
      isDefault: [false]
    });
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    forkJoin({
      addresses: this.addressService.getAddresses(),
      billingProfile: this.billingAddressService.getBillingProfile().pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: (result) => {
        this.addresses = result.addresses;
        this.billingProfile = result.billingProfile;
        this.isLoading = false;
        this.isInitialLoad = false;
      },
      error: (error) => {
        const errorMsg = error.message || 'Bilgiler yüklenirken hata oluştu';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
        this.isInitialLoad = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingAddress = null;
    this.addressForm.reset();
    
    // If this is the first address, set isDefault to true
    if (this.addresses.length === 0) {
      this.addressForm.patchValue({ isDefault: true });
    }
    
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

  openEditModal(address: UserAddress): void {
    this.editingAddress = address;
    
    // Populate form with existing data
    this.addressForm.patchValue({
      addressTitle: address.addressTitle || '',
      fullAddress: address.fullAddress,
      city: address.city,
      zipCode: address.zipCode || '',
      isDefault: address.isDefault
    });
    
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
    this.editingAddress = null;
    this.addressForm.reset();
    this.errorMessage = '';
    
    // Return focus to trigger button when modal closes
    if (this.triggerButton) {
      this.triggerButton.focus();
      this.triggerButton = null;
    }
  }

  submitForm(): void {
    if (this.addressForm.invalid) {
      return;
    }

    const formValue = this.addressForm.value;
    
    if (this.editingAddress) {
      // Update existing address
      const updateRequest: UpdateAddressRequest = {
        addressTitle: formValue.addressTitle,
        fullAddress: formValue.fullAddress,
        city: formValue.city,
        zipCode: formValue.zipCode,
        isDefault: formValue.isDefault
      };
      
      this.isLoading = true;
      this.addressService.updateAddress(this.editingAddress.id, updateRequest).subscribe({
        next: (updatedAddress) => {
          // Update the address in the list
          const index = this.addresses.findIndex(a => a.id === updatedAddress.id);
          if (index !== -1) {
            this.addresses[index] = updatedAddress;
            
            // If this was set as default, update others
            if (updatedAddress.isDefault) {
              this.addresses.forEach(a => {
                if (a.id !== updatedAddress.id) {
                  a.isDefault = false;
                }
              });
            }
          }
          
          this.isLoading = false;
          this.toastService.success('Adres başarıyla güncellendi');
          this.closeModal();
        },
        error: (error) => {
          const errorMsg = error.message || 'Adres güncellenirken hata oluştu';
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg);
          this.isLoading = false;
        }
      });
    } else {
      // Create new address
      const createRequest: CreateAddressRequest = {
        addressTitle: formValue.addressTitle,
        fullAddress: formValue.fullAddress,
        city: formValue.city,
        zipCode: formValue.zipCode,
        isDefault: formValue.isDefault
      };
      
      this.isLoading = true;
      this.addressService.createAddress(createRequest).subscribe({
        next: (newAddress) => {
          // If new address is default, update others
          if (newAddress.isDefault) {
            this.addresses.forEach(a => a.isDefault = false);
          }
          
          this.addresses.push(newAddress);
          this.isLoading = false;
          this.toastService.success('Adres başarıyla eklendi');
          this.closeModal();
        },
        error: (error) => {
          const errorMsg = error.message || 'Adres eklenirken hata oluştu';
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg);
          this.isLoading = false;
        }
      });
    }
  }

  deleteAddress(id: string): void {
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
    
    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.id !== id);
        this.isLoading = false;
        this.toastService.success('Adres başarıyla silindi');
      },
      error: (error) => {
        const errorMsg = error.message || 'Adres silinirken hata oluştu';
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
    
    this.addressService.setDefaultAddress(id).subscribe({
      next: (updatedAddress) => {
        // Update all addresses: set selected one to default, others to false
        this.addresses.forEach(a => {
          a.isDefault = a.id === updatedAddress.id;
        });
        
        this.isLoading = false;
        this.toastService.success('Varsayılan adres güncellendi');
      },
      error: (error) => {
        const errorMsg = error.message || 'Varsayılan adres ayarlanırken hata oluştu';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  openBillingModal(): void {
    this.triggerButton = document.activeElement as HTMLElement;
    this.showBillingModal = true;
  }

  closeBillingModal(): void {
    this.showBillingModal = false;
    if (this.triggerButton) {
      this.triggerButton.focus();
      this.triggerButton = null;
    }
  }

  onBillingAddressSet(profile: BillingProfile): void {
    this.billingProfile = profile;
  }

  clearBillingAddress(): void {
    if (confirm('Fatura adresini kaldırmak istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.billingAddressService.clearBillingAddress().subscribe({
        next: () => {
          this.billingProfile = null;
          this.isLoading = false;
          this.toastService.success('Fatura adresi kaldırıldı');
        },
        error: (error) => {
          const errorMsg = error.message || 'Fatura adresi kaldırılırken hata oluştu';
          this.toastService.error(errorMsg);
          this.isLoading = false;
        }
      });
    }
  }

  // Helper methods for form validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Bu alan zorunludur';
    if (field.errors['maxlength']) return `Maksimum ${field.errors['maxlength'].requiredLength} karakter olmalıdır`;
    return 'Geçersiz değer';
  }
}
