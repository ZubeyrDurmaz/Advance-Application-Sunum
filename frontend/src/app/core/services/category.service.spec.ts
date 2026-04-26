import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { CategoryService } from './category.service';

function makeHttpMock() {
  return { get: vi.fn(), post: vi.fn() } as any;
}

const mockCategories = [
  { id: 'c1', name: 'Diving' },
  { id: 'c2', name: 'Dress' },
];

describe('CategoryService', () => {
  let service: CategoryService;
  let http: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    http = makeHttpMock();
    service = new CategoryService(http);
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCategories — Requirements 6.1, 6.2', () => {
    it('should call GET /api/categories', () => {
      http.get.mockReturnValue(of(mockCategories));
      service.getAllCategories().subscribe(cats => expect(cats).toEqual(mockCategories));
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/categories'));
    });
  });

  describe('Caching — Requirements 18.1, 18.3', () => {
    it('should return cached categories on second call without HTTP request', () => {
      http.get.mockReturnValue(of(mockCategories));
      service.getAllCategories().subscribe();
      http.get.mockClear();

      service.getAllCategories().subscribe(cats => expect(cats).toEqual(mockCategories));
      expect(http.get).not.toHaveBeenCalled();
    });

    it('should fetch again after clearCache', () => {
      http.get.mockReturnValue(of(mockCategories));
      service.getAllCategories().subscribe();
      service.clearCache();
      http.get.mockClear();

      service.getAllCategories().subscribe();
      expect(http.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCache — Requirement 18.5', () => {
    it('should clear cached category data', () => {
      http.get.mockReturnValue(of(mockCategories));
      service.getAllCategories().subscribe();
      service.clearCache();
      http.get.mockClear();

      service.getAllCategories().subscribe();
      expect(http.get).toHaveBeenCalled();
    });
  });
});
