/**
 * Unit tests for Review Models
 * 
 * Tests verify that the TypeScript interfaces are properly structured
 * and can be used for type-safe API communication.
 */

import { ReviewResponse, ReviewRequest } from './review.model';

describe('Review Models', () => {
  describe('ReviewResponse', () => {
    it('should create a valid ReviewResponse object', () => {
      const reviewResponse: ReviewResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userName: 'John Doe',
        productName: 'Luxury Watch',
        starRating: 5,
        sentiment: 'Excellent product!',
        createdAt: '2024-01-15T10:30:00Z'
      };

      expect(reviewResponse.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(reviewResponse.userName).toBe('John Doe');
      expect(reviewResponse.productName).toBe('Luxury Watch');
      expect(reviewResponse.starRating).toBe(5);
      expect(reviewResponse.sentiment).toBe('Excellent product!');
      expect(reviewResponse.createdAt).toBe('2024-01-15T10:30:00Z');
    });

    it('should have all required properties', () => {
      const reviewResponse: ReviewResponse = {
        id: '1',
        userName: 'Test User',
        productName: 'Test Product',
        starRating: 4,
        sentiment: 'Good',
        createdAt: '2024-01-01T00:00:00Z'
      };

      expect(reviewResponse).toHaveProperty('id');
      expect(reviewResponse).toHaveProperty('userName');
      expect(reviewResponse).toHaveProperty('productName');
      expect(reviewResponse).toHaveProperty('starRating');
      expect(reviewResponse).toHaveProperty('sentiment');
      expect(reviewResponse).toHaveProperty('createdAt');
    });
  });

  describe('ReviewRequest', () => {
    it('should create a valid ReviewRequest object', () => {
      const reviewRequest: ReviewRequest = {
        starRating: 5,
        sentiment: 'Amazing watch, highly recommend!'
      };

      expect(reviewRequest.starRating).toBe(5);
      expect(reviewRequest.sentiment).toBe('Amazing watch, highly recommend!');
    });

    it('should have all required properties', () => {
      const reviewRequest: ReviewRequest = {
        starRating: 3,
        sentiment: 'Average product'
      };

      expect(reviewRequest).toHaveProperty('starRating');
      expect(reviewRequest).toHaveProperty('sentiment');
    });

    it('should accept valid star ratings', () => {
      const ratings = [1, 2, 3, 4, 5];
      
      ratings.forEach(rating => {
        const reviewRequest: ReviewRequest = {
          starRating: rating,
          sentiment: `Rating ${rating}`
        };
        
        expect(reviewRequest.starRating).toBe(rating);
      });
    });
  });
});
