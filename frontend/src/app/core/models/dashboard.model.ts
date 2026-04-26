export interface DashboardStats {
  orderCount: number;
  totalSpent: number;
  memberSince: string;
  lastOrderDate: string | null;
  membershipType: string;
  addressCount: number;
  paymentMethodCount: number;
  cartItemCount: number;
  hasDefaultAddress: boolean;
  hasDefaultPaymentMethod: boolean;
}

export interface CorporateAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalReviews: number;
  averageStoreRating: number;
  monthlySales: MonthlyStat[];
  topProducts: TopProduct[];
}

export interface MonthlyStat {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
  averageRating: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: MonthlyStat[];
  topStores: TopStore[];
}

export interface TopStore {
  name: string;
  orders: number;
  revenue: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  status: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastActivity: string | null;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
