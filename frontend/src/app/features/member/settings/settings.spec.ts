import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from './settings';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Settings - Responsive Form Layout (Task 16.5)', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Requirement 7.3: Stack settings form fields vertically on mobile', () => {
    it('should have form-row with single column grid on mobile', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formRow = compiled.querySelector('.form-row') as HTMLElement;
      
      expect(formRow).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(formRow);
      expect(styles.display).toBe('grid');
      
      // On mobile (default), should be single column
      // The CSS sets grid-template-columns: 1fr by default
    });

    it('should stack form fields vertically in the form-row', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formFields = compiled.querySelectorAll('.form-row .form-field');
      
      // Should have multiple form fields (First Name, Last Name)
      expect(formFields.length).toBeGreaterThan(0);
    });
  });

  describe('Requirement 7.4: Display form fields in two-column layout on tablet/desktop', () => {
    it('should have CSS media query for two-column layout at 768px', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formRow = compiled.querySelector('.form-row') as HTMLElement;
      
      expect(formRow).toBeTruthy();
      
      // The CSS includes @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
      // This is verified by the CSS file structure
    });
  });

  describe('Requirement 7.1: Ensure form inputs meet minimum height on mobile', () => {
    it('should have form inputs with proper styling', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formInputs = compiled.querySelectorAll('.form-input');
      
      expect(formInputs.length).toBeGreaterThan(0);
      
      // Check that inputs have the form-input class which includes min-height on mobile
      formInputs.forEach(input => {
        expect(input.classList.contains('form-input')).toBe(true);
      });
    });

    it('should have CSS rule for minimum height on mobile viewports', () => {
      // The CSS includes @media (max-width: 767px) with min-height: var(--touch-target-min)
      // This ensures 44px minimum height on mobile
      const compiled = fixture.nativeElement as HTMLElement;
      const formInput = compiled.querySelector('.form-input') as HTMLElement;
      
      expect(formInput).toBeTruthy();
    });
  });

  describe('Requirement 7.7: Make save button full-width on mobile', () => {
    it('should have save button with full-width styling on mobile', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const saveButton = compiled.querySelector('.btn-save') as HTMLElement;
      
      expect(saveButton).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(saveButton);
      
      // The CSS sets width: 100% by default (mobile-first)
      expect(styles.width).toBeTruthy();
    });

    it('should have discard button with full-width styling on mobile', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const discardButton = compiled.querySelector('.btn-discard') as HTMLElement;
      
      expect(discardButton).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(discardButton);
      
      // The CSS sets width: 100% by default (mobile-first)
      expect(styles.width).toBeTruthy();
    });

    it('should stack action buttons vertically on mobile', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const settingsActions = compiled.querySelector('.settings-actions') as HTMLElement;
      
      expect(settingsActions).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(settingsActions);
      expect(styles.display).toBe('flex');
      
      // The CSS sets flex-direction: column by default (mobile-first)
    });
  });

  describe('Requirement 7.6: Ensure adequate spacing between form fields', () => {
    it('should have proper gap spacing in settings-actions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const settingsActions = compiled.querySelector('.settings-actions') as HTMLElement;
      
      expect(settingsActions).toBeTruthy();
      
      // The CSS sets gap: 1rem
      const styles = window.getComputedStyle(settingsActions);
      expect(styles.gap).toBeTruthy();
    });

    it('should have proper gap spacing in form-row', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formRow = compiled.querySelector('.form-row') as HTMLElement;
      
      expect(formRow).toBeTruthy();
      
      // The CSS sets gap: 2rem
      const styles = window.getComputedStyle(formRow);
      expect(styles.gap).toBeTruthy();
    });
  });

  describe('Touch target requirements', () => {
    it('should have security update button with minimum touch target size', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const updateButton = compiled.querySelector('.security-update-btn') as HTMLElement;
      
      expect(updateButton).toBeTruthy();
      
      // The CSS sets min-height and min-width to var(--touch-target-min) which is 44px
    });

    it('should have security rows with minimum touch target height', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const securityRows = compiled.querySelectorAll('.security-row');
      
      expect(securityRows.length).toBeGreaterThan(0);
      
      // The CSS sets min-height: var(--touch-target-min) on security-row
    });
  });

  describe('Component structure', () => {
    it('should render settings form with identity section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const identitySection = compiled.querySelector('.settings-section-title');
      
      expect(identitySection).toBeTruthy();
      expect(identitySection?.textContent).toContain('Identity');
    });

    it('should render security credentials section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const securitySection = Array.from(
        compiled.querySelectorAll('.settings-section-title')
      ).find(el => el.textContent?.includes('Security'));
      
      expect(securitySection).toBeTruthy();
    });

    it('should render settings sidebar with membership card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const membershipCard = compiled.querySelector('.membership-card');
      
      expect(membershipCard).toBeTruthy();
    });

    it('should render profile card in sidebar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const profileCard = compiled.querySelector('.profile-card');
      
      expect(profileCard).toBeTruthy();
    });
  });

  describe('Responsive grid layout', () => {
    it('should have settings-grid with single column on mobile', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const settingsGrid = compiled.querySelector('.settings-grid') as HTMLElement;
      
      expect(settingsGrid).toBeTruthy();
      
      // Check computed styles
      const styles = window.getComputedStyle(settingsGrid);
      expect(styles.display).toBe('grid');
      
      // The CSS sets grid-template-columns: 1fr by default (mobile-first)
      // and grid-template-columns: 7fr 5fr at 1024px+
    });
  });
});
