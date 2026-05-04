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
 * Represents a product with all its details including category and store information.
 * Image, description and feature lists come straight from the database — no
 * client-side mock data is ever rendered.
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

  // Marketing / display data (from DB)
  imageUrl?: string;
  description?: string;
  brand?: string;
  model?: string;
  movement?: string;
  material?: string;
  diameter?: string;
  powerReserve?: string;
  waterResistance?: string;
  availabilityStatus?: string;
  features?: string[];
  images?: string[];
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
