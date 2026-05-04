import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeService } from '../../core/services/stripe.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AddressService } from '../../core/services/address.service';
import { UserAddress } from '../../core/models/address.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems = signal<any[]>([]);
  subtotal = signal(0);
  discountAmount = signal(0);
  total = signal(0);
  
  discountCode = signal('');
  discountApplied = signal(false);
  discountMessage = signal('');
  discountError = signal('');
  
  // Address related
  addresses = signal<UserAddress[]>([]);
  selectedAddressId = signal<string | null>(null);
  loadingAddresses = signal(false);
  showAddressForm = signal(false);
  
  // New address form
  newAddress = signal({
    addressTitle: '',
    fullAddress: '',
    city: '',
    zipCode: '',
    isDefault: false
  });
  
  updateNewAddress(field: string, value: any) {
    this.newAddress.update(addr => ({ ...addr, [field]: value }));
  }
  
  loading = signal(false);
  processingPayment = signal(false);

  constructor(
    private stripeService: StripeService,
    private cartService: CartService,
    private authService: AuthService,
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.loadAddresses();
  }

  goToCollection() {
    this.router.navigate(['/collection']);
  }

  loadCart() {
    this.cartItems.set(this.cartService.cartItems());
    this.calculateTotals();
  }

  loadAddresses() {
    this.loadingAddresses.set(true);
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        // Auto-select default address
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId.set(defaultAddress.id);
        } else if (addresses.length > 0) {
          this.selectedAddressId.set(addresses[0].id);
        }
        this.loadingAddresses.set(false);
      },
      error: (error) => {
        console.error('Failed to load addresses:', error);
        this.loadingAddresses.set(false);
      }
    });
  }

  calculateTotals() {
    const items = this.cartItems();
    const subtotalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.subtotal.set(subtotalAmount);
    
    const discount = this.discountAmount();
    this.total.set(Math.max(0, subtotalAmount - discount));
  }

  async applyDiscount() {
    const code = this.discountCode().trim();
    if (!code) {
      this.discountError.set('Please enter a discount code');
      return;
    }

    this.loading.set(true);
    this.discountError.set('');
    this.discountMessage.set('');

    const subtotalInCents = Math.round(this.subtotal() * 100);

    this.stripeService.validateDiscount({
      code,
      originalAmount: subtotalInCents
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        if (response.valid) {
          this.discountApplied.set(true);
          this.discountAmount.set((response.discountAmount || 0) / 100);
          this.discountMessage.set(response.message || 'Discount applied!');
          this.calculateTotals();
        } else {
          this.discountError.set(response.errorMessage || 'Invalid discount code');
          this.discountApplied.set(false);
          this.discountAmount.set(0);
          this.calculateTotals();
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.discountError.set('Failed to validate discount code');
        console.error('Discount validation error:', error);
      }
    });
  }

  removeDiscount() {
    this.discountCode.set('');
    this.discountApplied.set(false);
    this.discountAmount.set(0);
    this.discountMessage.set('');
    this.discountError.set('');
    this.calculateTotals();
  }

  toggleAddressForm() {
    this.showAddressForm.set(!this.showAddressForm());
  }

  saveNewAddress() {
    const address = this.newAddress();
    
    if (!address.fullAddress || !address.city) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading.set(true);
    this.addressService.createAddress(address).subscribe({
      next: (createdAddress) => {
        this.addresses.update(addrs => [...addrs, createdAddress]);
        this.selectedAddressId.set(createdAddress.id);
        this.showAddressForm.set(false);
        this.newAddress.set({
          addressTitle: '',
          fullAddress: '',
          city: '',
          zipCode: '',
          isDefault: false
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to create address:', error);
        alert('Failed to create address. Please try again.');
        this.loading.set(false);
      }
    });
  }

  async proceedToPayment() {
    if (this.cartItems().length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!this.selectedAddressId()) {
      alert('Please select a delivery address');
      return;
    }

    this.processingPayment.set(true);

    const user = this.authService.getCurrentUser();
    const selectedAddress = this.addresses().find(addr => addr.id === this.selectedAddressId());
    
    const items = this.cartItems().map(item => ({
      productId: item.slug, // Using slug as productId
      name: item.name,
      amount: Math.round(item.price * 100), // Convert to cents
      currency: 'usd',
      quantity: item.quantity,
      imageUrl: item.image || undefined
    }));

    const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/checkout/cancel`;

    const request = {
      items,
      successUrl,
      cancelUrl,
      customerEmail: user?.email,
      discountCode: this.discountApplied() ? this.discountCode() : undefined,
      // Include shipping address in metadata
      metadata: {
        shippingAddressId: this.selectedAddressId(),
        shippingAddress: selectedAddress ? 
          `${selectedAddress.fullAddress}, ${selectedAddress.city} ${selectedAddress.zipCode}` : ''
      }
    };

    this.stripeService.createCheckoutSession(request).subscribe({
      next: async (response) => {
        if (response.url) {
          // Redirect to Stripe Checkout
          window.location.href = response.url;
        } else {
          this.processingPayment.set(false);
          alert('Failed to create checkout session. Please try again.');
        }
      },
      error: (error) => {
        this.processingPayment.set(false);
        console.error('Checkout error:', error);
        alert('Failed to create checkout session. Please try again.');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
