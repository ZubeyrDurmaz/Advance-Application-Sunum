/**
 * Product Models
 * 
 * TypeScript interfaces for product-related data structures.
 * Maps Java backend types to TypeScript types:
 * - UUID (String) → string
 * - BigDecimal → number
 * - Integer → number
 * - ISO 8601 String → string
 */

/**
 * Product response from backend API
 * Represents a product with all its details including category and store information
 */
export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  categoryName: string;
  storeName: string;
  createdAt: string;
}

/**
 * Category response from backend API
 * Represents a product category
 */
export interface Category {
  id: string;
  name: string;
}

/**
 * Generic paginated response wrapper
 * Used for paginated API responses containing a list of items with pagination metadata
 * 
 * @template T - The type of items in the content array
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
