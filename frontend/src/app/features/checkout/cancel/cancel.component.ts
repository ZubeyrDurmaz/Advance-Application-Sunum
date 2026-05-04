import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent {
  constructor(private router: Router) {}

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToCollection() {
    this.router.navigate(['/collection']);
  }
}
