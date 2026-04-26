/**
 * Review Models
 * 
 * TypeScript interfaces for review-related data structures.
 * Maps Java backend types to TypeScript types:
 * - UUID (String) → string
 * - Integer → number
 * - ISO 8601 String → string
 */

/**
 * Review response from backend API
 * Represents a product review with user and product information
 */
export interface ReviewResponse {
  id: string;
  userName: string;
  productName: string;
  starRating: number;
  sentiment: string;
  createdAt: string;
}

/**
 * Review request payload
 * Used for POST /api/reviews/product/{productId}
 */
export interface ReviewRequest {
  starRating: number;
  sentiment: string;
}
