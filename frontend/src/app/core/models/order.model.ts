/**
 * Order Models
 * 
 * TypeScript interfaces for order-related data structures.
 * Maps Java backend types to TypeScript types:
 * - UUID (String) → string
 * - BigDecimal → number
 * - Integer → number
 * - ISO 8601 String → string
 */

/**
 * Order item response from backend API
 * Represents a single item within an order
 */
export interface OrderItemResponse {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
}

/**
 * Order response from backend API
 * Represents a complete order with all its details including items, payment, and store information
 */
export interface OrderResponse {
  id: string;
  status: string;
  grandTotal: number;
  orderDate: string;
  paymentMethod: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemResponse[];
}
