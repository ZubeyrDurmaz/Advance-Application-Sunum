import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, CheckoutRequest } from '../../core/services/order.service';
import { OrderResponse } from '../../core/models/order.model';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { UserPaymentMethod } from '../../core/models/payment-method.model';
import { AddressService } from '../../core/services/address.service';
import { UserAddress } from '../../core/models/address.model';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  isAuthenticated = false;
  isCorporate = false;
  showPrompt = false;
  promptMessage = '';

  // Checkout flow
  checkoutStep: 'cart' | 'shipping' | 'payment' | 'processing' | 'success' = 'cart';
  completedOrder: OrderResponse | null = null;
  checkoutError = '';

  // Saved data
  savedAddresses: UserAddress[] = [];
  savedPayments: UserPaymentMethod[] = [];
  selectedAddressId: string | null = null;
  selectedPaymentId: string | null = null;
  useNewAddress = false;
  useNewPayment = false;

  // Shipping form (new)
  shipping = {
    fullName: '', address: '', city: '', state: '', zip: '', country: 'US', phone: ''
  };

  // Payment form (new)
  payment = {
    cardNumber: '', cardName: '', expiry: '', cvv: '', method: 'Credit Card'
  };

  // Buy Now mode (from product detail)
  buyNowItem: CartItem | null = null;

  footerCols = [
    ['Heritage', 'Our Craft'],
    ['Support', 'Bespoke Services'],
    ['Privacy'],
  ];

  constructor(
    public cartService: CartService,
    public responsive: ResponsiveService,
    private authService: AuthService,
    private orderService: OrderService,
    private paymentMethodService: PaymentMethodService,
    private addressService: AddressService,
    private router: Router
  ) {
    // Check for Buy Now navigation state
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['buyNow']) {
      this.buyNowItem = nav.extras.state['buyNow'] as CartItem;
    }
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isCorporate = this.authService.hasRole('CORPORATE');

    // If Buy Now item exists, go directly to checkout
    if (this.buyNowItem && this.isAuthenticated && !this.isCorporate) {
      this.loadSavedData();
      this.checkoutStep = 'shipping';
    }
  }

  private loadSavedData(): void {
    this.addressService.getAddresses().subscribe({
      next: (addrs) => {
        this.savedAddresses = addrs;
        const def = addrs.find(a => a.isDefault);
        if (def) this.selectedAddressId = def.id;
        else if (addrs.length > 0) this.selectedAddressId = addrs[0].id;
        else this.useNewAddress = true;
      },
      error: () => { this.useNewAddress = true; }
    });

    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.savedPayments = methods;
        const def = methods.find(m => m.isDefault);
        if (def) this.selectedPaymentId = def.id;
        else if (methods.length > 0) this.selectedPaymentId = methods[0].id;
        else this.useNewPayment = true;
      },
      error: () => { this.useNewPayment = true; }
    });
  }

  formatPrice(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  get checkoutItems(): CartItem[] {
    if (this.buyNowItem) return [this.buyNowItem];
    return this.cartService.cartItems();
  }

  get checkoutTotal(): number {
    return this.checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  checkout(): void {
    if (!this.isAuthenticated) {
      this.showPrompt = true;
      this.promptMessage = 'Please sign in to proceed with checkout.';
      return;
    }
    if (this.isCorporate) {
      this.showPrompt = true;
      this.promptMessage = 'Corporate accounts cannot make purchases. Please use an individual account.';
      return;
    }
    this.loadSavedData();
    this.checkoutStep = 'shipping';
  }

  goToPayment(): void {
    if (!this.useNewAddress && !this.selectedAddressId) return;
    if (this.useNewAddress && (!this.shipping.fullName || !this.shipping.address || !this.shipping.city || !this.shipping.zip)) return;
    this.checkoutStep = 'payment';
  }

  backToShipping(): void { this.checkoutStep = 'shipping'; }
  backToCart(): void {
    this.checkoutStep = 'cart';
    this.buyNowItem = null;
  }

  processPayment(): void {
    if (!this.useNewPayment && !this.selectedPaymentId) return;
    if (this.useNewPayment && (!this.payment.cardNumber || !this.payment.cardName || !this.payment.expiry || !this.payment.cvv)) return;

    this.checkoutError = '';
    this.checkoutStep = 'processing';

    // Determine payment method label
    let methodLabel = this.payment.method;
    if (!this.useNewPayment && this.selectedPaymentId) {
      const saved = this.savedPayments.find(p => p.id === this.selectedPaymentId);
      if (saved) methodLabel = `${saved.provider ?? saved.methodType} •••• ${saved.lastFour ?? ''}`;
    }

    const items = this.checkoutItems.map(i => ({ sku: i.ref, quantity: i.quantity }));

    const request: CheckoutRequest = { items, paymentMethod: methodLabel };

    // 3 second simulated delay
    setTimeout(() => {
      this.orderService.checkout(request).subscribe({
        next: (order) => {
          this.completedOrder = order;
          if (!this.buyNowItem) this.cartService.clear();
          this.buyNowItem = null;
          this.checkoutStep = 'success';
        },
        error: (err) => {
          this.checkoutError = err.error?.message || 'Payment failed. Please try again.';
          this.checkoutStep = 'payment';
        }
      });
    }, 3000);
  }

  goToOrders(): void { this.router.navigate(['/order-history']); }
  goToLogin(): void { this.router.navigate(['/login']); }

  closePrompt(): void {
    this.showPrompt = false;
    this.promptMessage = '';
  }

  selectAddress(id: string): void {
    this.selectedAddressId = id;
    this.useNewAddress = false;
  }

  selectPayment(id: string): void {
    this.selectedPaymentId = id;
    this.useNewPayment = false;
  }

  switchToNewAddress(): void {
    this.useNewAddress = true;
    this.selectedAddressId = null;
  }

  switchToNewPayment(): void {
    this.useNewPayment = true;
    this.selectedPaymentId = null;
  }

  getSelectedAddress(): UserAddress | null {
    return this.savedAddresses.find(a => a.id === this.selectedAddressId) ?? null;
  }

  getSelectedPayment(): UserPaymentMethod | null {
    return this.savedPayments.find(p => p.id === this.selectedPaymentId) ?? null;
  }

  paymentIcon(method: UserPaymentMethod): string {
    const t = (method.provider ?? method.methodType ?? '').toLowerCase();
    if (t.includes('visa')) return 'credit_card';
    if (t.includes('master')) return 'credit_card';
    if (t.includes('paypal') || t.includes('digital')) return 'account_balance_wallet';
    return 'credit_card';
  }
}
