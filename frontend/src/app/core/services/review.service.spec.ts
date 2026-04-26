import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { ReviewService } from './review.service';

function makeHttpMock() {
  return { get: vi.fn(), post: vi.fn() } as any;
}

const mockReview = {
  id: 'r1', userName: 'Julian V.', productName: 'Submariner Date',
  starRating: 5, sentiment: 'Exceptional.', createdAt: '2024-03-12T00:00:00Z',
};

describe('ReviewService', () => {
  let service: ReviewService;
  let http: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    http = makeHttpMock();
    service = new ReviewService(http);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProductReviews — Requirements 8.1, 8.3', () => {
    it('should call GET /api/reviews/product/p1', () => {
      http.get.mockReturnValue(of([mockReview]));
      service.getProductReviews('p1').subscribe(reviews => {
        expect(reviews).toEqual([mockReview]);
        expect(reviews[0].starRating).toBe(5);
      });
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/reviews/product/p1'));
    });

    it('should return empty array when no reviews', () => {
      http.get.mockReturnValue(of([]));
      service.getProductReviews('p1').subscribe(r => expect(r).toEqual([]));
    });
  });

  describe('submitReview — Requirements 8.2, 8.3', () => {
    it('should call POST /api/reviews/product/p1 with body', () => {
      http.post.mockReturnValue(of(mockReview));
      const req = { starRating: 5, sentiment: 'Exceptional.' };
      service.submitReview('p1', req).subscribe(r => expect(r).toEqual(mockReview));
      expect(http.post).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/product/p1'),
        req
      );
    });

    it('should send correct starRating in body', () => {
      http.post.mockReturnValue(of({ ...mockReview, starRating: 3 }));
      service.submitReview('p1', { starRating: 3, sentiment: 'Average.' }).subscribe();
      const [, body] = http.post.mock.calls[0];
      expect(body.starRating).toBe(3);
    });
  });
});
