import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Addresses } from '../../app/features/member/addresses/addresses';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddressService } from '../../app/core/services/address.service';
import { ToastService } from '../../app/core/services/toast.service';
import { of } from 'rxjs';

describe('Addresses Component', () => {
  let component: Addresses;
  let fixture: ComponentFixture<Addresses>;

  const mockAddressService = {
    getAddresses: vi.fn(() => of([])),
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn()
  };

  const mockToastService = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addresses],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AddressService, useValue: mockAddressService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Addresses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the addresses component', () => {
    expect(component).toBeTruthy();
  });

  describe('Template', () => {
    it('should render the addresses page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should have content in the template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
