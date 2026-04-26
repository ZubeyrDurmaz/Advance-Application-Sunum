import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BillingAddressService } from './billing-address.service';
import { 
  BillingProfile, 
  SetBillingAddressRequest, 
  CreateBillingAddressRequest, 
  UpdateBillingProfileRequest 
} from '../models/billing.model';
import { UserAddress } from '../models/address.model';
import { environment } from '../../../environments/environment';

describe('BillingAddressService', () => {
  let service: BillingAddressService;
  let httpMock: HttpTestingController;
  const API_URL = `${environment.apiUrl}/users/me/billing`;

  const mockUserAddress: UserAddress = {
    id: 'addr-123',
    addressTitle: 'Home',
    fullAddress: '123 Main St',
    city: 'Istanbul',
    zipCode: '34000',
    isDefault: false
  };

  const mockBillingProfile: BillingProfile = {
    id: 'billing-123',
    accountHolderName: 'John Doe',
    address: mockUserAddress,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BillingAddressService]
    });
    service = TestBed.inject(BillingAddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBillingProfile', () => {
    it('should get billing profile', () => {
      service.getBillingProfile().subscribe(profile => {
        expect(profile).toEqual(mockBillingProfile);
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBillingProfile);
    });

    it('should handle error when getting billing profile', () => {
      service.getBillingProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Fatura adresi bulunamadı');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('setBillingAddress', () => {
    it('should set billing address', () => {
      const request: SetBillingAddressRequest = {
        addressId: 'addr-123',
        accountHolderName: 'John Doe'
      };

      service.setBillingAddress(request).subscribe(profile => {
        expect(profile).toEqual(mockBillingProfile);
      });

      const req = httpMock.expectOne(`${API_URL}/set-address`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockBillingProfile);
    });
  });

  describe('createBillingAddress', () => {
    it('should create billing address', () => {
      const request: CreateBillingAddressRequest = {
        addressTitle: 'Billing Address',
        fullAddress: '123 Main St',
        city: 'Istanbul',
        zipCode: '34000',
        accountHolderName: 'John Doe'
      };

      service.createBillingAddress(request).subscribe(profile => {
        expect(profile).toEqual(mockBillingProfile);
      });

      const req = httpMock.expectOne(`${API_URL}/create-address`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockBillingProfile);
    });
  });

  describe('updateBillingProfile', () => {
    it('should update billing profile', () => {
      const request: UpdateBillingProfileRequest = {
        accountHolderName: 'Jane Doe',
        addressId: 'addr-456'
      };

      service.updateBillingProfile(request).subscribe(profile => {
        expect(profile).toEqual(mockBillingProfile);
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockBillingProfile);
    });
  });

  describe('clearBillingAddress', () => {
    it('should clear billing address', () => {
      service.clearBillingAddress().subscribe(result => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getAvailableAddresses', () => {
    it('should get available addresses', () => {
      const addresses: UserAddress[] = [mockUserAddress];

      service.getAvailableAddresses().subscribe(result => {
        expect(result).toEqual(addresses);
      });

      const req = httpMock.expectOne(`${API_URL}/available-addresses`);
      expect(req.request.method).toBe('GET');
      req.flush(addresses);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      service.getBillingProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Sunucuya bağlanılamıyor');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });

    it('should handle validation errors', () => {
      service.getBillingProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Geçersiz fatura adresi bilgileri');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush({ message: 'Validation failed' }, { status: 422, statusText: 'Unprocessable Entity' });
    });

    it('should handle server errors', () => {
      service.getBillingProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Sunucu hatası oluştu');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});