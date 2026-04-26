import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

/**
 * LazyLoadDirective
 * 
 * Implements lazy loading for images using IntersectionObserver API.
 * Images are loaded only when they enter the viewport, improving initial page load performance.
 * 
 * Usage:
 * <img appLazyLoad [src]="imageUrl" alt="Description">
 * 
 * Requirements: 6.5, 6.6, 18.2
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
  @Input() src!: string;
  
  private observer: IntersectionObserver | null = null;
  
  constructor(private el: ElementRef<HTMLImageElement>) {}
  
  ngAfterViewInit(): void {
    // Create IntersectionObserver to detect when image enters viewport
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
          }
        });
      },
      {
        // Load image when it's within 50px of entering viewport
        rootMargin: '50px',
        threshold: 0.01
      }
    );
    
    // Start observing the image element
    this.observer.observe(this.el.nativeElement);
  }
  
  private loadImage(): void {
    const img = this.el.nativeElement;
    
    // Set the src attribute to trigger image load
    img.src = this.src;
    
    // Add loading class for potential styling
    img.classList.add('lazy-loading');
    
    // Listen for load event to remove loading state
    img.addEventListener('load', () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      // Disconnect observer after image loads to prevent memory leaks
      this.disconnectObserver();
    }, { once: true });
    
    // Handle error case
    img.addEventListener('error', () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      
      // Disconnect observer even on error
      this.disconnectObserver();
    }, { once: true });
  }
  
  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  ngOnDestroy(): void {
    // Clean up observer when directive is destroyed
    this.disconnectObserver();
  }
}
