import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  sessionId = signal<string | null>(null);
  loading = signal(true);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Get session ID from URL
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      this.sessionId.set(sessionId);
      this.loading.set(false);
      
      // Clear the cart after successful payment
      if (sessionId) {
        this.cartService.clear();
        console.log('Cart cleared after successful payment');
      }
    });
  }

  goToOrders() {
    this.router.navigate(['/order-history']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToCollection() {
    this.router.navigate(['/collection']);
  }
}
