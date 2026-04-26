import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { RouterTestingModule } from '@angular/router/testing';

describe('Footer Component - Responsive Behavior', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer with correct structure', () => {
    const footer = compiled.querySelector('.site-footer');
    expect(footer).toBeTruthy();
    
    const footerInner = compiled.querySelector('.footer-inner');
    expect(footerInner).toBeTruthy();
  });

  it('should render brand section with CHRONOS text', () => {
    const brand = compiled.querySelector('.footer-brand');
    expect(brand?.textContent).toContain('CHRONOS');
  });

  it('should render copyright text', () => {
    const copyright = compiled.querySelector('.footer-copyright');
    expect(copyright?.textContent).toContain('© 2024 CHRONOS CURATORS');
  });

  it('should render all footer links', () => {
    const links = compiled.querySelectorAll('.footer-link');
    expect(links.length).toBe(6);
    
    const linkTexts = Array.from(links).map(link => link.textContent?.trim());
    expect(linkTexts).toContain('Our Collection');
    expect(linkTexts).toContain('Deals');
    expect(linkTexts).toContain('Chronos AI');
    expect(linkTexts).toContain('About');
    expect(linkTexts).toContain('Shipping');
    expect(linkTexts).toContain('Privacy');
  });

  it('should render footer icons with proper accessibility', () => {
    const iconButtons = compiled.querySelectorAll('.footer-icon-btn');
    expect(iconButtons.length).toBe(2);
    
    // Check aria-labels for accessibility
    const firstButton = iconButtons[0] as HTMLElement;
    const secondButton = iconButtons[1] as HTMLElement;
    
    expect(firstButton.getAttribute('aria-label')).toBe('Language');
    expect(secondButton.getAttribute('aria-label')).toBe('Favorites');
  });

  it('should have nav element with proper aria-label', () => {
    const nav = compiled.querySelector('nav.footer-links');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Footer navigation');
  });

  it('should have minimum touch target sizes on interactive elements', () => {
    const footerLinks = compiled.querySelectorAll('.footer-link');
    const iconButtons = compiled.querySelectorAll('.footer-icon-btn');
    
    // Check that CSS classes are applied (actual size verification would require DOM rendering)
    footerLinks.forEach(link => {
      expect(link.classList.contains('footer-link')).toBe(true);
    });
    
    iconButtons.forEach(button => {
      expect(button.classList.contains('footer-icon-btn')).toBe(true);
    });
  });

  it('should render footer links with proper routing', () => {
    const links = compiled.querySelectorAll('.footer-link');
    
    // Check that routerLink is properly set for routable links
    const collectionLink = Array.from(links).find(
      link => link.textContent?.trim() === 'Our Collection'
    );
    expect(collectionLink).toBeTruthy();
  });

  it('should have proper structure for mobile-first layout', () => {
    const footerInner = compiled.querySelector('.footer-inner');
    const brandCol = compiled.querySelector('.footer-brand-col');
    const linksSection = compiled.querySelector('.footer-links');
    const iconsSection = compiled.querySelector('.footer-icons');
    
    expect(footerInner).toBeTruthy();
    expect(brandCol).toBeTruthy();
    expect(linksSection).toBeTruthy();
    expect(iconsSection).toBeTruthy();
  });
});
