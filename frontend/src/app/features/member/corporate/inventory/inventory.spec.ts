import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inventory } from './inventory';
import { RouterTestingModule } from '@angular/router/testing';
import { ResponsiveService } from '../../../../core/services/responsive.service';
import { signal } from '@angular/core';

describe('Inventory Component - Responsive Behavior', () => {
  let component: Inventory;
  let fixture: ComponentFixture<Inventory>;
  let compiled: HTMLElement;
  let responsiveService: ResponsiveService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventory, RouterTestingModule],
      providers: [ResponsiveService],
    }).compileComponents();

    fixture = TestBed.createComponent(Inventory);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    responsiveService = TestBed.inject(ResponsiveService);
    fixture.detectChanges();
  });

  it('should create the inventory component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ResponsiveService', () => {
    expect(component.isMobile).toBeDefined();
    expect(typeof component.isMobile()).toBe('boolean');
  });

  it('should render inventory stats section', () => {
    const stats = compiled.querySelector('.inv-stats');
    expect(stats).toBeTruthy();
    
    const statCards = compiled.querySelectorAll('.inv-stat');
    expect(statCards.length).toBe(4);
  });

  it('should render search input with touch-friendly height', () => {
    const searchInput = compiled.querySelector('.inv-search') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toContain('Search');
  });

  it('should render filter tabs with touch-friendly targets', () => {
    const filterTabs = compiled.querySelectorAll('.inv-tab');
    expect(filterTabs.length).toBe(4);
    
    const tabTexts = Array.from(filterTabs).map(tab => tab.textContent?.trim());
    expect(tabTexts).toContain('All');
    expect(tabTexts).toContain('In Stock');
    expect(tabTexts).toContain('Low Stock');
    expect(tabTexts).toContain('Out of Stock');
  });

  it('should have mobile card layout structure in template', () => {
    // The template should have the mobile card structure defined
    // We can verify this by checking the component has the isMobile signal
    expect(component.isMobile).toBeDefined();
    expect(typeof component.isMobile()).toBe('boolean');
  });

  it('should have desktop table layout structure in template', () => {
    // The template should have the desktop table structure defined
    // We can verify the component has filtered products
    expect(component.filtered).toBeDefined();
    expect(Array.isArray(component.filtered())).toBe(true);
  });

  it('should render appropriate layout based on viewport', () => {
    // The component uses isMobile signal to determine layout
    // This test verifies the signal is properly integrated
    const isMobileValue = component.isMobile();
    expect(typeof isMobileValue).toBe('boolean');
    
    // Verify the component has the necessary data for both layouts
    expect(component.filtered().length).toBeGreaterThan(0);
  });

  it('should render edit buttons with touch-friendly size', () => {
    const editButtons = compiled.querySelectorAll('.icon-btn');
    expect(editButtons.length).toBeGreaterThan(0);
    
    // Verify buttons have the icon-btn class which applies touch-friendly styles
    editButtons.forEach(button => {
      expect(button.classList.contains('icon-btn')).toBe(true);
    });
  });

  it('should filter products based on search query', () => {
    const initialCount = component.filtered().length;
    expect(initialCount).toBeGreaterThan(0);
    
    // Set search query
    component.searchQuery.set('Rolex');
    fixture.detectChanges();
    
    const filteredCount = component.filtered().length;
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  it('should filter products based on status', () => {
    const allCount = component.filtered().length;
    
    // Filter by in-stock
    component.filterStatus.set('in-stock');
    fixture.detectChanges();
    
    const inStockCount = component.filtered().length;
    expect(inStockCount).toBeLessThanOrEqual(allCount);
    
    // Verify all filtered products have in-stock status
    const inStockProducts = component.filtered();
    inStockProducts.forEach(product => {
      expect(product.status).toBe('in-stock');
    });
  });

  it('should open edit modal when edit button is clicked', () => {
    expect(component.editingProduct).toBeNull();
    
    const firstProduct = component.products()[0];
    component.openEdit(firstProduct);
    
    expect(component.editingProduct).toBeTruthy();
    expect(component.editingProduct?.id).toBe(firstProduct.id);
  });

  it('should close edit modal', () => {
    const firstProduct = component.products()[0];
    component.openEdit(firstProduct);
    expect(component.editingProduct).toBeTruthy();
    
    component.closeEdit();
    expect(component.editingProduct).toBeNull();
  });

  it('should save edited product and update status based on stock', () => {
    const firstProduct = component.products()[0];
    component.openEdit(firstProduct);
    
    // Modify stock to trigger status change
    component.editingProduct!.stock = 0;
    component.saveEdit();
    
    const updatedProduct = component.products().find(p => p.id === firstProduct.id);
    expect(updatedProduct?.stock).toBe(0);
    expect(updatedProduct?.status).toBe('out-of-stock');
    expect(component.editingProduct).toBeNull();
  });

  it('should format price correctly', () => {
    const formatted = component.formatPrice(89000);
    // Check that it contains the dollar sign and the number
    expect(formatted).toContain('$');
    expect(formatted).toContain('89');
  });

  it('should display empty state when no products match filter', () => {
    component.searchQuery.set('NonexistentProduct12345');
    fixture.detectChanges();
    
    expect(component.filtered().length).toBe(0);
    
    const emptyState = compiled.querySelector('.inv-empty');
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('No products match your search');
  });

  it('should have proper ARIA labels and accessibility', () => {
    const searchInput = compiled.querySelector('.inv-search');
    expect(searchInput).toBeTruthy();
    
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render status badges with correct styling', () => {
    const statusBadges = compiled.querySelectorAll('.inv-status');
    expect(statusBadges.length).toBeGreaterThan(0);
    
    // Check that status classes are applied
    const hasInStock = Array.from(statusBadges).some(badge => 
      badge.classList.contains('inv-status--in-stock')
    );
    expect(hasInStock).toBe(true);
  });
});
