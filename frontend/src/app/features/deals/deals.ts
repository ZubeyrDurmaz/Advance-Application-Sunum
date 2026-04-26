import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ProductService } from '../../core/services/product.service';
import { ProductResponse } from '../../core/models/product.model';
import { LazyLoadDirective } from '../../shared/directives/lazy-load.directive';

interface DealWatch {
  id: string;
  brand: string;
  name: string;
  categoryName: string;
  price: string;
  priceValue: number;
  badge?: string;
  badgeStyle?: 'primary' | 'tertiary';
  image: string;
  slug: string;
}

const PLACEHOLDER_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6skQdK0hl6R30Q0C5uVJvH4sPfO61wi-eOBpssod_edgeuBVtZH1rA7DQpnbplYos1CQOff5gU8AXfx_EIsGVl05dWgXrI_szVDNP4uZ8legkNRXgYiIzCJBEfx_PwelLqOGL1ei7KJsCiag1KzOfuTyHgOwjfyHEmFtfsADmVR0346if23XJRJeOT2_F7owbQPT1GAuQwbL4KNWAL6U0A0O3n4C0D4FsGTw2SudjgQqmW7ciojccoFxoug-XZ7vEf62knf3ZG3VO';

@Component({
  selector: 'app-deals',
  imports: [FormsModule, RouterLink, Navbar, Footer, LazyLoadDirective],
  templateUrl: './deals.html',
  styleUrl: './deals.css',
})
export class Deals implements OnInit {
  email = '';
  watches: DealWatch[] = [];
  loading = true;

  private badgePool = [
    { text: 'Featured', style: 'tertiary' as const },
    { text: 'Best Seller', style: 'primary' as const },
    { text: 'Rare Find', style: 'tertiary' as const },
    { text: 'New Arrival', style: 'primary' as const },
    { text: 'Limited', style: 'tertiary' as const },
    { text: 'Exclusive', style: 'primary' as const },
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.watches = products.map((p, i) => this.mapProduct(p, i));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private mapProduct(p: ProductResponse, index: number): DealWatch {
    const badge = this.badgePool[index % this.badgePool.length];
    return {
      id: p.id,
      brand: p.storeName || 'Chronos',
      name: p.name,
      categoryName: p.categoryName || 'Watch',
      price: `$${p.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      priceValue: p.unitPrice,
      badge: badge.text,
      badgeStyle: badge.style,
      slug: p.sku,
      image: PLACEHOLDER_IMG,
    };
  }

  onSubscribe(): void {
    if (this.email) {
      console.log('Subscribed:', this.email);
      this.email = '';
    }
  }
}
