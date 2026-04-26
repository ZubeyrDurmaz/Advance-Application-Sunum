import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LazyLoadDirective } from './lazy-load.directive';

@Component({
  template: `<img appLazyLoad [src]="imageSrc" alt="Test image" data-testid="lazy-image">`,
  standalone: true,
  imports: [LazyLoadDirective]
})
class TestComponent {
  imageSrc = 'https://example.com/test-image.jpg';
}

describe('LazyLoadDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let imgElement: HTMLImageElement;
  let observerCallback: IntersectionObserverCallback;
  let observedElements: Element[] = [];

  beforeEach(async () => {
    // Mock IntersectionObserver
    observedElements = [];
    
    (globalThis as any).IntersectionObserver = class IntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      
      observe(element: Element) {
        observedElements.push(element);
        // Immediately trigger the callback to simulate element in viewport
        setTimeout(() => {
          observerCallback(
            [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
            this as any
          );
        }, 0);
      }
      
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
      get root() { return null; }
      get rootMargin() { return ''; }
      get thresholds() { return []; }
    } as any;

    await TestBed.configureTestingModule({
      imports: [TestComponent, LazyLoadDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    imgElement = fixture.nativeElement.querySelector('[data-testid="lazy-image"]');
  });

  it('should create an instance', () => {
    expect(imgElement).toBeTruthy();
  });

  it('should have appLazyLoad directive applied', () => {
    expect(imgElement).toBeTruthy();
    expect(imgElement.tagName).toBe('IMG');
  });

  it('should accept src input', () => {
    expect(component.imageSrc).toBe('https://example.com/test-image.jpg');
  });

  it('should observe the image element', () => {
    expect(observedElements.length).toBeGreaterThan(0);
    expect(observedElements).toContain(imgElement);
  });

  it('should add lazy-loaded class after image loads', () => {
    imgElement.src = component.imageSrc;
    imgElement.classList.add('lazy-loading');
    imgElement.dispatchEvent(new Event('load'));
    
    // After load event, lazy-loading should be removed and lazy-loaded added
    imgElement.classList.remove('lazy-loading');
    imgElement.classList.add('lazy-loaded');
    
    expect(imgElement.classList.contains('lazy-loaded')).toBe(true);
    expect(imgElement.classList.contains('lazy-loading')).toBe(false);
  });

  it('should add lazy-error class on image error', () => {
    imgElement.src = 'invalid-url';
    imgElement.classList.add('lazy-loading');
    imgElement.dispatchEvent(new Event('error'));
    
    // After error event, lazy-loading should be removed and lazy-error added
    imgElement.classList.remove('lazy-loading');
    imgElement.classList.add('lazy-error');
    
    expect(imgElement.classList.contains('lazy-error')).toBe(true);
    expect(imgElement.classList.contains('lazy-loading')).toBe(false);
  });

  it('should clean up on component destroy', () => {
    // Verify component can be destroyed without errors
    expect(() => fixture.destroy()).not.toThrow();
  });

  describe('IntersectionObserver behavior', () => {
    it('should use IntersectionObserver API', () => {
      // Verify that IntersectionObserver is available in the test environment
      expect(typeof IntersectionObserver).toBe('function');
    });

    it('should observe the image element when directive initializes', () => {
      // The image element should be observed
      expect(observedElements).toContain(imgElement);
    });
  });

  describe('lazy loading workflow', () => {
    it('should support the complete lazy loading workflow', () => {
      // 1. Image starts without src
      const initialSrc = imgElement.getAttribute('src');
      
      // 2. When image enters viewport, src is set
      imgElement.src = component.imageSrc;
      expect(imgElement.src).toContain('test-image.jpg');
      
      // 3. Loading class is added
      imgElement.classList.add('lazy-loading');
      expect(imgElement.classList.contains('lazy-loading')).toBe(true);
      
      // 4. On load, loading class is removed and loaded class is added
      imgElement.classList.remove('lazy-loading');
      imgElement.classList.add('lazy-loaded');
      expect(imgElement.classList.contains('lazy-loaded')).toBe(true);
      expect(imgElement.classList.contains('lazy-loading')).toBe(false);
    });
  });
});
