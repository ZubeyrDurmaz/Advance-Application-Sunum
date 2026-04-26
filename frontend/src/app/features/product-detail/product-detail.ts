import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { ReviewResponse, ReviewRequest } from '../../core/models/review.model';
import { AuthService } from '../../core/services/auth.service';

interface Spec { label: string; value: string; }
interface CraftItem { number: string; title: string; description: string; }
interface Review { title: string; author: string; date: string; body: string; starRating: number; }
interface RatingBar { label: string; pct: number; }
interface ProductData {
  name: string;
  brand: string;
  model: string;
  category: string;
  price: string;
  heroImage: string;
  description: string;
  specs: Spec[];
}

const PRODUCTS: Record<string, ProductData> = {
  'vanguard-skeleton': {
    name: 'Vanguard Skeleton', brand: 'Vanguard', model: 'Skeleton', category: 'Grand Complications',
    price: '$12,400', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sKqM25tajyHx49E8AmC01WoOZSim69pWB4GjaWNWqfHQ7I6jgjhd8edCebN8fuSG41FRNsQD1ymylzxmZphHO-RSopvPAsbGXEopbLsn-yMgNk1jPIOO0b3NXzdwkIWulKF7h0MUcQRQb1GuiKuZgpm2rrxMOxtvmtQx1K1mfKT8NQVTxH5Cz4Z6yKPMl2fxsSRTZf5EqzQnOe7Rr8r2Bd866hIIxGXnsA1X5SjFB4WAom4jIiYfKW9fJLKy2gv5murE26cWMPvo',
    description: 'The Vanguard Skeleton reveals the intricate mechanics of its automatic movement through a meticulously crafted open-worked dial. Every bridge and plate is hand-finished to perfection.',
    specs: [
      { label: 'Reference', value: 'VG-SK-001' }, { label: 'Movement', value: 'Automatic Skeleton' },
      { label: 'Material', value: 'Brushed Steel' }, { label: 'Diameter', value: '42 mm' }, { label: 'Power Reserve', value: '48 Hours' },
    ],
  },
  'heritage-moonphase': {
    name: 'Heritage Moonphase', brand: 'Heritage', model: 'Moonphase', category: 'Complications',
    price: '$18,950', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk-t-4gZ1-rJ9Q8a3ErSyE5K8DfkTjNSfkRqKfmjlF4xCSlxx0bs9kSXg8CksKS8G3-q4vQyJkL7bulTFG-GcayPpi4s-pHazsUutPffmjor-NjXVR-93PlXXyulArilROR9kMkdNgr3XQq2F2p5SNrhu_7SCoqgbbKyovn8Fd_7PAdzdf2vuYMRhpdquwtZmPZh0Zb3WX_GSWGj7Gg5wRVbmix8F8MiJIEDjwkRZh62sMVbQUXXAwjoonCdeXq9tJ_Q3HrjL1BYNg',
    description: 'A poetic complication that tracks the lunar cycle with breathtaking accuracy. Set in 18k rose gold with a hand-stitched alligator leather strap.',
    specs: [
      { label: 'Reference', value: 'HM-MP-002' }, { label: 'Movement', value: 'Manual Winding' },
      { label: 'Material', value: 'Rose Gold' }, { label: 'Diameter', value: '39 mm' }, { label: 'Power Reserve', value: '72 Hours' },
    ],
  },
  'ocean-master-300': {
    name: 'Ocean Master 300', brand: 'Ocean', model: 'Master 300', category: 'Professional Diving',
    price: '$9,200', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFEm1W4r6Eg36_ktemOFk3MAuaycKUtwpkXK0kMBlXyLaYSoDblECJt2xn2iPZvDXTCbNARzxwWrJNbhbGNc9zDwtuyQp-BjWHyhVAvHf8aNR2o6X0PRhzc3PU2qdRUOB1rvXwqs9r50Ge9osvl48ugMHXHkmfKtF6Dhh9Pwpt80UeAHsy06VuOSI9ns9_BXY3xk5iHbdE8va0TCA6J9AbN1aesRmx8-S2CQWpXSVs45S0CcxvTpOV8dKeKMmapm63eGeQtZMa-Xbl',
    description: 'Engineered for the depths, the Ocean Master 300 combines professional diving capability with refined aesthetics. Water resistant to 300 meters.',
    specs: [
      { label: 'Reference', value: 'OM-300-003' }, { label: 'Movement', value: 'Automatic' },
      { label: 'Material', value: 'Titanium' }, { label: 'Diameter', value: '44 mm' }, { label: 'Water Resistance', value: '300m / 1000ft' },
    ],
  },
  'submariner-date': {
    name: 'Submariner Date', brand: 'Rolex', model: 'Submariner Date', category: 'Professional Diving',
    price: '$10,400', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmlO-EOAQOUNdEwmTJglIBp8zxmiiX79QMK266iIFgGqI00YNi_3Xgg1-yDQ2MMnT4W1VtlEMpDhENR7v-M-qd3hc41a7jcPXPSDjDZz8ZKy_FQRLxrGLHBrJw8vE3aCqpziNdjoNcgAv71dPfds2OQiRBthEg_1aXL6BEVyUAnk0KHsNSuuHLVrD4vE-LDB8XJOb7TtAsBHA0FfpISky7WCYebCgH5RGx9T7OTqifYRd0Z0H7Chp76r6eixl7WWOBZMds89_w9ICZ',
    description: 'The quintessential diving watch. The Submariner Date combines robust functionality with timeless elegance, a true icon of watchmaking.',
    specs: [
      { label: 'Reference', value: '126610LN' }, { label: 'Movement', value: 'Caliber 3235' },
      { label: 'Material', value: 'Oystersteel' }, { label: 'Diameter', value: '41 mm' }, { label: 'Water Resistance', value: '300m' },
    ],
  },
  'cosmograph-daytona': {
    name: 'Cosmograph Daytona', brand: 'Rolex', model: 'Cosmograph Daytona', category: 'Grand Complications',
    price: '$32,450', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6skQdK0hl6R30Q0C5uVJvH4sPfO61wi-eOBpssod_edgeuBVtZH1rA7DQpnbplYos1CQOff5gU8AXfx_EIsGVl05dWgXrI_szVDNP4uZ8legkNRXgYiIzCJBEfx_PwelLqOGL1ei7KJsCiag1KzOfuTyHgOwjfyHEmFtfsADmVR0346if23XJRJeOT2_F7owbQPT1GAuQwbL4KNWAL6U0A0O3n4C0D4FsGTw2SudjgQqmW7ciojccoFxoug-XZ7vEf62knf3ZG3VO',
    description: 'Born to race. The Cosmograph Daytona is the ultimate chronograph, designed for professional racing drivers who demand precision timing.',
    specs: [
      { label: 'Reference', value: '116500LN' }, { label: 'Movement', value: 'Caliber 4130' },
      { label: 'Material', value: 'Oystersteel' }, { label: 'Diameter', value: '40 mm' }, { label: 'Power Reserve', value: '72 Hours' },
    ],
  },
  'calatrava-5227r': {
    name: 'Calatrava 5227R', brand: 'Patek Philippe', model: 'Calatrava 5227R', category: 'Dress Watch',
    price: '$38,200', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6InNE-lGgpgQmYBD2LBLp9rNeY5hCn-OBNShOkp0TMSOFGVjggGy3jnp39VvK7SPSc9qcMgpUzUXKO7OHDYfNePBFvkj30xZZP5d-QL57JjLwnKKHM5Vsp9UZAvtTRvGOJ41HVGE-cKZiCFI5VyWr84UY-PfRzY_QkYq3iS-2x9j23WLzIpmvnxvnW1-xkfY_d8Q8fnGvmytOsiCt1pRQXrXOIv4qF3383W3HVvk9oAedyp88COraiVV0vlLPTLv5_Ska_iFS_Sr3',
    description: 'The Calatrava 5227R in rose gold epitomizes the pure, round wristwatch. Its officer-style case back conceals a hand-finished movement of extraordinary refinement.',
    specs: [
      { label: 'Reference', value: '5227R-001' }, { label: 'Movement', value: 'Caliber 324 S C' },
      { label: 'Material', value: 'Rose Gold' }, { label: 'Diameter', value: '39 mm' }, { label: 'Power Reserve', value: '45 Hours' },
    ],
  },
  'royal-oak-jumbo': {
    name: 'Royal Oak Jumbo', brand: 'Audemars Piguet', model: 'Royal Oak Jumbo', category: 'Iconic Sports',
    price: '$72,000', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpBpC2fUG6iCx5454xWOE9lf1nU1LOUQr-QX1sKqxBZafSmYoHnkurfzunURG3zfBno_B1Bx5iPv6xJkKc36THuK5BB9WB6lboLsseTdDKm-2w3ykGM7mswujKi-kCjVECJ-A0bUfNzCHJjLi4LMYfM2iVXiljrIlK7y-lyd8y4U4HpLjirn6Dm9oMTPa_BXh4_2agudLmsTGW_wlqjTWemDZOQ6zUw-aO9nwVXJIH7rScKO07_mUXn4QoKaw6wDMY7dkxO3KtkchJ',
    description: 'The Royal Oak Jumbo — the original luxury sports watch. Designed by Gérald Genta in 1972, its octagonal bezel and integrated bracelet remain icons of modern horology.',
    specs: [
      { label: 'Reference', value: '15202ST' }, { label: 'Movement', value: 'Caliber 2121' },
      { label: 'Material', value: 'Titanium' }, { label: 'Diameter', value: '39 mm' }, { label: 'Power Reserve', value: '40 Hours' },
    ],
  },
  'overseas-dual-time': {
    name: 'Overseas Dual Time', brand: 'Vacheron Constantin', model: 'Overseas Dual Time', category: 'Travel Watch',
    price: '$51,500', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8G07Si3KUaj-jD4w14XngjvzK_VCJcDBLjXvm9OykMatQbf6w6i71rqBzsNCjqum8kmK4mLQj7hWf_b962SZwRF6P4121rMYEbwROhS6dSIF47kQkQMKDkCZ120Zo-ia_kScRMQxeOU0atbqceVkJKgz0bXB34ASXx0J7GwFzLVRzedenY-Ar0BAmXO84qlNfxixLUz4xfSUquxoHov4fDBAZcRE1GVaaBVZjve4hrl9XWS-D-35riKKnHF9e0myZ5ClLtNnlZ4ZN',
    description: 'The Overseas Dual Time displays two time zones simultaneously with effortless elegance. A companion for the global traveller who refuses to compromise on refinement.',
    specs: [
      { label: 'Reference', value: '7900V/110R' }, { label: 'Movement', value: 'Caliber 5110 DT' },
      { label: 'Material', value: 'Pink Gold' }, { label: 'Diameter', value: '41 mm' }, { label: 'Power Reserve', value: '60 Hours' },
    ],
  },
  'speedmaster-moonwatch': {
    name: 'Speedmaster Moonwatch', brand: 'Omega', model: 'Speedmaster Moonwatch', category: 'Professional Chronograph',
    price: '$6,240', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4A9R7aGk_WG5Ijy91_rFFl85Oi9akgZeGu4_9nwMYa9EDgzvgfEqe44Flx-XkalRaPjXVuIAHn4i8obdpCc0eAUo5cxJLN_rh-K9L68H2PtuK5ylAgVLQb_cfCyQmFI9Ur8BuzeWoShgqfo8B9GIQOmCaGXd5Rv2eDuGycsXBc5tKqnEa7dtSHuD4IBz7QTEZxzJ8qGmaM9nDmT8M3vkaKovYd0uj6tPsrzBei-e9o2DzUQ7Z-nakwuAIV8LKbrA3PDKXgysyY-iy',
    description: 'The watch that went to the moon. The Speedmaster Moonwatch Professional has been NASA\'s choice since 1965, a testament to its unmatched reliability under extreme conditions.',
    specs: [
      { label: 'Reference', value: '310.30.42.50.01.001' }, { label: 'Movement', value: 'Caliber 3861' },
      { label: 'Material', value: 'Stainless Steel' }, { label: 'Diameter', value: '42 mm' }, { label: 'Power Reserve', value: '50 Hours' },
    ],
  },
  'carrera-chronograph': {
    name: 'Carrera Chronograph', brand: 'TAG Heuer', model: 'Carrera Chronograph', category: 'Racing Chronograph',
    price: '$4,100', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCicfwUxDfFQXXzfrokBONh_lyN4WD3rxRhdvyM-8mqwFB4mAe32p8egHHncV93tyNaE3V3g7bocf-ACWSISi_R42inhVF5mAJDDbdTmzcO9M9EEu6lvt3-nhfqB9Y2FI4UAhlSUfo1506F5rdKjmkXR65WtbW2vf_cZ3udQB3KuZ8wrRJFiO83y30sifKl9ivNOKA65XPYlarg0oU506g7ZExp-7S26mhM0p3awTBdZbshdt3U-CicfB8wXvWVYWTvQ1tkavvlWcp7',
    description: 'Born on the racing circuits of the 1960s, the Carrera Chronograph captures the spirit of motorsport with its clean, legible dial and precise timing capabilities.',
    specs: [
      { label: 'Reference', value: 'CBN2A1B.FC6492' }, { label: 'Movement', value: 'Caliber Heuer 02' },
      { label: 'Material', value: 'Stainless Steel' }, { label: 'Diameter', value: '44 mm' }, { label: 'Power Reserve', value: '80 Hours' },
    ],
  },
  'nautilus-blue-dial': {
    name: 'Nautilus Blue Dial', brand: 'Patek Philippe', model: 'Nautilus', category: 'Luxury Sports',
    price: '$89,000', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp1t0MFw_Hzdwak7Fn-neSeN5CVzNLFLUvr0c_mw8JqhNZfBdB0gfa1zpwj1BJY06Ch6ovGWV2Qxup54fnEucdp-qeurtT5FV0fbx0991eNOwQjzuSfHqoYRDdXg5Zh0BoFDXbl8OkTa8guobK3f3d1x-6gtje9oUA4MNFEF9fBMkfxWCJureTecP7kHazOvdh9kavHdr41--5QUiseBQ6Dwv7FX8QrdOX57xowwpNOgLoQuzmBNftd_7hR26cLwyWwnktPvcwcDOK',
    description: 'The Nautilus with its iconic porthole-inspired case is perhaps the most coveted watch in the world. The blue gradient dial is a masterpiece of dial-making artistry.',
    specs: [
      { label: 'Reference', value: '5711/1A-010' }, { label: 'Movement', value: 'Caliber 26-330 S C' },
      { label: 'Material', value: 'Stainless Steel' }, { label: 'Diameter', value: '40 mm' }, { label: 'Power Reserve', value: '45 Hours' },
    ],
  },
  'defy-el-primero': {
    name: 'Defy El Primero', brand: 'Zenith', model: 'Defy El Primero', category: 'High-Frequency Chronograph',
    price: '$11,500', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDopk5r3qLeGQmjEk6WILSZ_c3nEMwjgvyGi4ErlLpLUDIy8E86s9GasMrzqymkKZFo8KPxqp1FHYahmTRQKUayoB_8hudLr7mKiFBsITphUk3gvl2ftBRI4sMYQZB3sYHyWdEoczbZeEUtwJjdeA9oThmm830CuB9Mewuc5lEzrxu9w_RRUggyR7JispswIqRVxBXYhj8t4_Fp2nIVHB_n17VstdRH4kmJVR7mOBe2RWtvw1qs1Lqq04CTseVHgffKmUYqKAiiCiSF',
    description: 'The Defy El Primero houses the legendary El Primero movement — the world\'s first automatic chronograph caliber, beating at 36,000 vph for 1/10th second precision.',
    specs: [
      { label: 'Reference', value: '95.9000.9004' }, { label: 'Movement', value: 'El Primero 9004' },
      { label: 'Material', value: 'Titanium' }, { label: 'Diameter', value: '44 mm' }, { label: 'Power Reserve', value: '60 Hours' },
    ],
  },
  'santos-de-cartier': {
    name: 'Santos de Cartier', brand: 'Cartier', model: 'Santos de Cartier', category: 'Iconic Dress Sport',
    price: '$6,800', heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Xs2kNN92MNI7Zm-7YUVVoi44Pfcrz0HfQ0jNBa2vrJhh2Tk0RqIB_n2z_qy-lzjUrlliw5_d19yoS0zi1tpiijcTXd0DVDThpyVoyd2gx-ScTpCaT2lje9J0o_qfz6LwMRcg_ya5ssQuOxp10XhStdPJVN2nbeObU3sG9v5oUMw0MyFV4qZ4LAd_UkEDsi8pkOXeBYWEBU-eXNOD6nfuDMNskYxh99IxN8Q5GwexzMDKc9IwlvmISnEhsHkQ4CEagOHm9JMIEcmr',
    description: 'The Santos de Cartier is the world\'s first purpose-built wristwatch, created in 1904 for aviator Alberto Santos-Dumont. Its exposed screws and square case remain instantly recognizable.',
    specs: [
      { label: 'Reference', value: 'WSSA0018' }, { label: 'Movement', value: 'Caliber 1847 MC' },
      { label: 'Material', value: 'Stainless Steel' }, { label: 'Diameter', value: '39.8 mm' }, { label: 'Power Reserve', value: '42 Hours' },
    ],
  },
};

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: ProductData | null = null;
  loading = true;
  currentProductId = '';

  craftsmanship: CraftItem[] = [
    { number: '01', title: 'Hand-Polished', description: 'Every single surface of the case is hand-finished by master polishers.' },
    { number: '02', title: 'Mechanical', description: 'The movement features hundreds of parts decorated with Côtes de Genève.' },
    { number: '03', title: 'The Seal', description: 'Our seal guarantees lifetime maintenance for every timepiece in our collection.' },
  ];

  reviews: Review[] = [];
  reviewsLoading = false;

  averageRating = 0;
  reviewCount = 0;
  ratingBars: RatingBar[] = [
    { label: '5', pct: 0 }, { label: '4', pct: 0 }, { label: '3', pct: 0 }, { label: '2', pct: 0 }, { label: '1', pct: 0 },
  ];

  showReviewForm = false;
  reviewRating = 5;
  reviewBody = '';
  reviewSubmitted = false;
  reviewError = '';
  isAuthenticated = false;
  isCorporate = false;
  showAuthPrompt = false;
  authPromptMessage = '';

  openReviewModal(): void {
    this.showReviewForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeReviewModal(): void {
    this.showReviewForm = false;
    document.body.style.overflow = '';
  }

  submitReview(): void {
    if (!this.reviewBody || !this.currentProductId) return;
    this.reviewError = '';
    const request: ReviewRequest = { starRating: this.reviewRating, sentiment: this.reviewBody };
    this.reviewService.submitReview(this.currentProductId, request).subscribe({
      next: (res) => {
        this.reviews.unshift({
          title: `${res.starRating} Star Review`,
          author: res.userName,
          date: new Date(res.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          body: res.sentiment,
          starRating: res.starRating,
        });
        this.computeRatingStats();
        this.reviewSubmitted = true;
        this.closeReviewModal();
        this.reviewBody = '';
        this.reviewRating = 5;
        setTimeout(() => this.reviewSubmitted = false, 3000);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.reviewError = 'You must be logged in to submit a review.';
        } else {
          this.reviewError = 'Failed to submit review. Please try again.';
        }
      }
    });
  }

  setRating(n: number): void { this.reviewRating = n; }

  constructor(
    private route: ActivatedRoute,
    public cartService: CartService,
    private productService: ProductService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isCorporate = this.authService.hasRole('CORPORATE');
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.loading = true;

      // Check if we have a rich hardcoded entry for this SKU
      const hardcoded = Object.values(PRODUCTS).find(p => p.specs[0]?.value === slug);

      this.productService.getProductBySku(slug).subscribe({
        next: (res) => {
          this.currentProductId = res.id;
          if (hardcoded) {
            // Use rich hardcoded data but with real price from backend
            this.product = {
              ...hardcoded,
              price: `$${res.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 0})}`,
            };
          } else {
            this.product = {
              name: res.name,
              brand: res.storeName || 'Chronos',
              model: res.categoryName || 'Watch',
              category: res.categoryName || 'Luxury',
              price: `$${res.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 0})}`,
              heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sKqM25tajyHx49E8AmC01WoOZSim69pWB4GjaWNWqfHQ7I6jgjhd8edCebN8fuSG41FRNsQD1ymylzxmZphHO-RSopvPAsbGXEopbLsn-yMgNk1jPIOO0b3NXzdwkIWulKF7h0MUcQRQb1GuiKuZgpm2rrxMOxtvmtQx1K1mfKT8NQVTxH5Cz4Z6yKPMl2fxsSRTZf5EqzQnOe7Rr8r2Bd866hIIxGXnsA1X5SjFB4WAom4jIiYfKW9fJLKy2gv5murE26cWMPvo',
              description: 'An exceptional piece from our collection. The movement features hundreds of parts decorated to the highest standards of fine watchmaking.',
              specs: [
                { label: 'Reference', value: res.sku },
                { label: 'Category', value: res.categoryName || 'Watch' },
                { label: 'Store', value: res.storeName || 'Chronos' },
                { label: 'Stock', value: res.stockQuantity + ' available' },
                { label: 'Added', value: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : '—' },
              ]
            };
          }
          this.loading = false;
          this.loadReviews(res.id);
        },
        error: () => {
          this.product = PRODUCTS['vanguard-skeleton'];
          this.loading = false;
        }
      });
    });
  }

  private loadReviews(productId: string): void {
    this.reviewsLoading = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews = data.map(r => ({
          title: `${r.starRating} Star Review`,
          author: r.userName,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          body: r.sentiment,
          starRating: r.starRating,
        }));
        this.computeRatingStats();
        this.reviewsLoading = false;
      },
      error: () => { this.reviewsLoading = false; }
    });
  }

  private computeRatingStats(): void {
    this.reviewCount = this.reviews.length;
    if (this.reviewCount === 0) {
      this.averageRating = 0;
      this.ratingBars = [
        { label: '5', pct: 0 }, { label: '4', pct: 0 }, { label: '3', pct: 0 }, { label: '2', pct: 0 }, { label: '1', pct: 0 },
      ];
      return;
    }
    const sum = this.reviews.reduce((acc, r) => acc + r.starRating, 0);
    this.averageRating = Math.round((sum / this.reviewCount) * 10) / 10;
    this.ratingBars = [5, 4, 3, 2, 1].map(star => {
      const count = this.reviews.filter(r => r.starRating === star).length;
      return { label: String(star), pct: Math.round((count / this.reviewCount) * 100) };
    });
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.isAuthenticated) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Please sign in to add items to your cart.';
      return;
    }
    if (this.isCorporate) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Corporate accounts cannot make purchases. Please use an individual account.';
      return;
    }
    this.cartService.add({
      slug: this.product.specs[0]?.value ?? '',
      name: this.product.name,
      brand: this.product.brand,
      price: parseInt(this.product.price.replace(/[^0-9]/g, '')),
      priceLabel: this.product.price,
      image: this.product.heroImage,
      ref: this.product.specs[0]?.value ?? '',
      description: this.product.description,
    });
  }

  buyNow(): void {
    if (!this.product) return;
    if (!this.isAuthenticated) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Please sign in to purchase.';
      return;
    }
    if (this.isCorporate) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Corporate accounts cannot make purchases. Please use an individual account.';
      return;
    }
    const item = {
      slug: this.product.specs[0]?.value ?? '',
      name: this.product.name,
      brand: this.product.brand,
      price: parseInt(this.product.price.replace(/[^0-9]/g, '')),
      priceLabel: this.product.price,
      image: this.product.heroImage,
      ref: this.product.specs[0]?.value ?? '',
      description: this.product.description,
      quantity: 1,
    };
    this.router.navigate(['/cart'], { state: { buyNow: item } });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  closeAuthPrompt(): void {
    this.showAuthPrompt = false;
    this.authPromptMessage = '';
  }
}
