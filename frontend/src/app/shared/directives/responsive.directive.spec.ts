import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowOnDirective } from './responsive.directive';
import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  template: `
    <div *appShowOn="'mobile'" data-testid="mobile-content">Mobile Content</div>
    <div *appShowOn="'tablet'" data-testid="tablet-content">Tablet Content</div>
    <div *appShowOn="'desktop'" data-testid="desktop-content">Desktop Content</div>
  `,
  standalone: true,
  imports: [ShowOnDirective]
})
class TestComponent {}

describe('ShowOnDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let responsiveService: ResponsiveService;
  let viewportWidthSignal: ReturnType<typeof signal<number>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, ShowOnDirective],
      providers: [ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    
    // Access the private viewportWidth signal for testing
    viewportWidthSignal = (responsiveService as any).viewportWidth;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mobile viewport', () => {
    beforeEach(() => {
      viewportWidthSignal.set(375); // Mobile width
      fixture.detectChanges();
    });

    it('should show mobile content when viewport is mobile', () => {
      const mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      expect(mobileContent).toBeTruthy();
      expect(mobileContent?.textContent).toContain('Mobile Content');
    });

    it('should hide tablet content when viewport is mobile', () => {
      const tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(tabletContent).toBeFalsy();
    });

    it('should hide desktop content when viewport is mobile', () => {
      const desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(desktopContent).toBeFalsy();
    });
  });

  describe('tablet viewport', () => {
    beforeEach(() => {
      viewportWidthSignal.set(800); // Tablet width
      fixture.detectChanges();
    });

    it('should hide mobile content when viewport is tablet', () => {
      const mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      expect(mobileContent).toBeFalsy();
    });

    it('should show tablet content when viewport is tablet', () => {
      const tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(tabletContent).toBeTruthy();
      expect(tabletContent?.textContent).toContain('Tablet Content');
    });

    it('should hide desktop content when viewport is tablet', () => {
      const desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(desktopContent).toBeFalsy();
    });
  });

  describe('desktop viewport', () => {
    beforeEach(() => {
      viewportWidthSignal.set(1200); // Desktop width
      fixture.detectChanges();
    });

    it('should hide mobile content when viewport is desktop', () => {
      const mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      expect(mobileContent).toBeFalsy();
    });

    it('should hide tablet content when viewport is desktop', () => {
      const tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(tabletContent).toBeFalsy();
    });

    it('should show desktop content when viewport is desktop', () => {
      const desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(desktopContent).toBeTruthy();
      expect(desktopContent?.textContent).toContain('Desktop Content');
    });
  });

  describe('viewport changes', () => {
    it('should update visibility when viewport changes from mobile to desktop', () => {
      // Start with mobile
      viewportWidthSignal.set(375);
      fixture.detectChanges();
      
      let mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      let desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(mobileContent).toBeTruthy();
      expect(desktopContent).toBeFalsy();

      // Change to desktop
      viewportWidthSignal.set(1200);
      fixture.detectChanges();
      
      mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(mobileContent).toBeFalsy();
      expect(desktopContent).toBeTruthy();
    });

    it('should update visibility when viewport changes from desktop to tablet', () => {
      // Start with desktop
      viewportWidthSignal.set(1200);
      fixture.detectChanges();
      
      let desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      let tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(desktopContent).toBeTruthy();
      expect(tabletContent).toBeFalsy();

      // Change to tablet
      viewportWidthSignal.set(800);
      fixture.detectChanges();
      
      desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(desktopContent).toBeFalsy();
      expect(tabletContent).toBeTruthy();
    });

    it('should update visibility when viewport changes from tablet to mobile', () => {
      // Start with tablet
      viewportWidthSignal.set(800);
      fixture.detectChanges();
      
      let tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      let mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      expect(tabletContent).toBeTruthy();
      expect(mobileContent).toBeFalsy();

      // Change to mobile
      viewportWidthSignal.set(375);
      fixture.detectChanges();
      
      tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      expect(tabletContent).toBeFalsy();
      expect(mobileContent).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle breakpoint boundary at 768px (mobile/tablet)', () => {
      // 767px should be mobile
      viewportWidthSignal.set(767);
      fixture.detectChanges();
      
      let mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      let tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(mobileContent).toBeTruthy();
      expect(tabletContent).toBeFalsy();

      // 768px should be tablet
      viewportWidthSignal.set(768);
      fixture.detectChanges();
      
      mobileContent = fixture.nativeElement.querySelector('[data-testid="mobile-content"]');
      tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      expect(mobileContent).toBeFalsy();
      expect(tabletContent).toBeTruthy();
    });

    it('should handle breakpoint boundary at 1024px (tablet/desktop)', () => {
      // 1023px should be tablet
      viewportWidthSignal.set(1023);
      fixture.detectChanges();
      
      let tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      let desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(tabletContent).toBeTruthy();
      expect(desktopContent).toBeFalsy();

      // 1024px should be desktop
      viewportWidthSignal.set(1024);
      fixture.detectChanges();
      
      tabletContent = fixture.nativeElement.querySelector('[data-testid="tablet-content"]');
      desktopContent = fixture.nativeElement.querySelector('[data-testid="desktop-content"]');
      expect(tabletContent).toBeFalsy();
      expect(desktopContent).toBeTruthy();
    });
  });
});
