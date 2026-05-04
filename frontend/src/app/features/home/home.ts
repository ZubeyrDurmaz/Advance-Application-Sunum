import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ApiService, ProductResponse } from '../../core/services/api.service';
import { LazyLoadDirective } from '../../shared/directives/lazy-load.directive';

interface Product {
  name: string;
  subtitle: string;
  price: string;
  image: string;
  limited?: boolean;
  slug: string;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, Navbar, Footer, LazyLoadDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  email = '';

  products: Product[] = [];

  footerLinks = ['About', 'Shipping', 'Contact', 'Privacy'];

  constructor(private router: Router, private api: ApiService) {
    this.api.getProducts().subscribe(res => {
      this.products = res.slice(0, 3).map(p => ({
        name: p.name,
        subtitle: `${p.categoryName || 'Watch'} • ${p.storeName || 'Official'}`,
        price: `$${p.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
        limited: p.stockQuantity < 5,
        slug: p.sku,
        // Image comes from the database (image_url / images columns)
        image: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : ''),
      }));
    });
  }

  onDiscoverMore(): void {
    this.router.navigate(['/collection']);
  }

  onViewHeritage(): void {
    this.router.navigate(['/deals']);
  }

  onQuickView(product: Product): void {
    console.log('Quick view:', product.name);
  }

  onNewsletterSubmit(): void {
    if (this.email) {
      console.log('Newsletter signup:', this.email);
      this.email = '';
    }
  }
}
