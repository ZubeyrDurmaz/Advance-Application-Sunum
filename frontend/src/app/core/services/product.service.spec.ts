import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ProductService } from './product.service';

function makeHttpMock() {
  return { get: vi.fn(), post: vi.fn() } as any;
}

const mockProduct = {
  id: 'p1', name: 'Submariner Date', sku: 'SUB-001',
  unitPrice: 10400, stockQuantity: 5,
  categoryName: 'Diving', storeName: 'Rolex', createdAt: '2024-01-01T00:00:00Z',
};

describe('ProductService', () => {
  let service: ProductService;
  let http: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    http = makeHttpMock();
    service = new ProductService(http);
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProducts — Requirement 5.1', () => {
    it('should call GET /api/products', () => {
      http.get.mockReturnValue(of([mockProduct]));
      service.getAllProducts().subscribe(res => expect(res).toEqual([mockProduct]));
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/products'));
    });
  });

  describe('searchProducts — Requirements 5.2, 19.1', () => {
    it('should call GET /api/products with search param', () => {
      http.get.mockReturnValue(of([mockProduct]));
      service.searchProducts('rolex').subscribe(res => expect(res).toEqual([mockProduct]));
      expect(http.get).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({ params: expect.objectContaining({ search: 'rolex' }) })
      );
    });
  });

  describe('getProductsByCategory — Requirement 5.3', () => {
    it('should call GET /api/products with categoryId param', () => {
      http.get.mockReturnValue(of([mockProduct]));
      service.getProductsByCategory('cat1').subscribe();
      expect(http.get).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({ params: expect.objectContaining({ categoryId: 'cat1' }) })
      );
    });
  });

  describe('getProductById — Requirements 5.4, 18.2, 18.3', () => {
    it('should call GET /api/products/p1 on cache miss', () => {
      http.get.mockReturnValue(of(mockProduct));
      service.getProductById('p1').subscribe(p => expect(p).toEqual(mockProduct));
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/products/p1'));
    });

    it('should return cached value on second call without HTTP request', () => {
      http.get.mockReturnValue(of(mockProduct));
      service.getProductById('p1').subscribe();
      http.get.mockClear();

      service.getProductById('p1').subscribe(p => expect(p).toEqual(mockProduct));
      expect(http.get).not.toHaveBeenCalled();
    });

    it('should fetch again after clearCache', () => {
      http.get.mockReturnValue(of(mockProduct));
      service.getProductById('p1').subscribe();
      service.clearCache();
      http.get.mockClear();

      service.getProductById('p1').subscribe();
      expect(http.get).toHaveBeenCalled();
    });
  });

  describe('getProductBySku — Requirement 5.5', () => {
    it('should call GET /api/products/sku/SUB-001', () => {
      http.get.mockReturnValue(of(mockProduct));
      service.getProductBySku('SUB-001').subscribe();
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/sku/SUB-001'));
    });
  });

  describe('getProductsPaginated — Requirements 20.1, 20.2, 20.3', () => {
    it('should call GET /api/products with page and size params', () => {
      const paginated = { content: [mockProduct], totalElements: 1, totalPages: 1, currentPage: 0, size: 20 };
      http.get.mockReturnValue(of(paginated));
      service.getProductsPaginated(0, 20).subscribe(res => {
        expect(res.content).toEqual([mockProduct]);
        expect(res.totalPages).toBe(1);
      });
      expect(http.get).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({ params: expect.objectContaining({ page: '0', size: '20' }) })
      );
    });
  });

  describe('clearCache — Requirement 18.5', () => {
    it('should force re-fetch after clearCache', () => {
      http.get.mockReturnValue(of(mockProduct));
      service.getProductById('p1').subscribe();
      service.clearCache();
      http.get.mockClear();
      service.getProductById('p1').subscribe();
      expect(http.get).toHaveBeenCalledTimes(1);
    });
  });
});
