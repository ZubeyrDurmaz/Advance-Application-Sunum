import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { Router, ActivatedRoute } from '@angular/router';
import { signal, computed } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('Navbar - Mobile Menu State Management', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let mockResponsiveService: ResponsiveService;

  beforeEach(async () => {
    // Mock window.innerWidth for mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375 // Mobile viewport
    });

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        ResponsiveService,
        {
          provide: CartService,
          useValue: {
            cartItems: signal([]),
            itemCount: computed(() => 0),
            total: computed(() => 0)
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null),
            isLoggedIn: () => false,
            initials: () => '',
            logout: () => {}
          }
        }
      ]
    }).compileComponents();

    mockResponsiveService = TestBed.inject(ResponsiveService);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize mobileMenuOpen signal as false', () => {
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should have isMobile computed signal that uses ResponsiveService', () => {
    expect(component.isMobile).toBeDefined();
    expect(component.isMobile()).toBe(true);
  });

  it('should toggle mobileMenuOpen when toggleMobileMenu is called', () => {
    expect(component.mobileMenuOpen()).toBe(false);
    
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should prevent body scroll when mobile menu is opened', () => {
    component.toggleMobileMenu();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when mobile menu is closed', () => {
    component.toggleMobileMenu(); // Open
    expect(document.body.style.overflow).toBe('hidden');
    
    component.toggleMobileMenu(); // Close
    expect(document.body.style.overflow).toBe('');
  });

  it('should auto-close mobile menu when viewport resizes from mobile to desktop', async () => {
    // Open mobile menu
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate viewport resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440 // Desktop viewport
    });

    window.dispatchEvent(new Event('resize'));

    // Wait for debounce (150ms) + buffer
    await new Promise(resolve => setTimeout(resolve, 200));

    // Trigger change detection
    fixture.detectChanges();

    // Menu should be auto-closed and body scroll restored
    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should keep mobile menu closed when resizing within mobile range', async () => {
    expect(component.mobileMenuOpen()).toBe(false);

    // Resize within mobile range (375px -> 500px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();

    // Menu should remain closed
    expect(component.mobileMenuOpen()).toBe(false);
  });
});

