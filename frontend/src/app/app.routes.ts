import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'collection', loadComponent: () => import('./features/collection/collection').then(m => m.Collection) },
  { path: 'deals', loadComponent: () => import('./features/deals/deals').then(m => m.Deals) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup) },
  { path: 'product/:slug', loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart').then(m => m.Cart) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'checkout/success', loadComponent: () => import('./features/checkout/success/success.component').then(m => m.SuccessComponent) },
  { path: 'checkout/cancel', loadComponent: () => import('./features/checkout/cancel/cancel.component').then(m => m.CancelComponent) },
  { path: 'chronos-ai', loadComponent: () => import('./features/chronos-ai/chronos-ai').then(m => m.ChronosAi) },

  // Individual
  { path: 'dashboard', canActivate: [roleGuard('INDIVIDUAL')], loadComponent: () => import('./features/member/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'order-history', canActivate: [authGuard], loadComponent: () => import('./features/member/order-history/order-history').then(m => m.OrderHistory) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./features/member/settings/settings').then(m => m.Settings) },
  { path: 'addresses', canActivate: [authGuard], loadComponent: () => import('./features/member/addresses/addresses').then(m => m.Addresses) },
  { path: 'payments', canActivate: [authGuard], loadComponent: () => import('./features/member/payments/payments').then(m => m.Payments) },

  // Corporate
  { path: 'corporate', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/corporate').then(m => m.Corporate) },
  { path: 'corporate/inventory', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/inventory/inventory').then(m => m.Inventory) },
  { path: 'corporate/orders', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/orders/orders').then(m => m.Orders) },
  { path: 'corporate/analytics', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/analytics/analytics').then(m => m.Analytics) },
  { path: 'corporate/customers', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/customers/customers').then(m => m.Customers) },
  { path: 'corporate/corp-settings', canActivate: [roleGuard('CORPORATE')], loadComponent: () => import('./features/member/corporate/corp-settings/corp-settings').then(m => m.CorpSettings) },

  // Admin
  { path: 'admin', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/admin').then(m => m.Admin) },
  { path: 'admin/stores', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/store-management/store-management').then(m => m.StoreManagement) },
  { path: 'admin/users', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/user-management/user-management').then(m => m.UserManagement) },
  { path: 'admin/orders', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/admin-orders/admin-orders').then(m => m.AdminOrders) },
  { path: 'admin/products', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/admin-products/admin-products').then(m => m.AdminProducts) },
  { path: 'admin/discounts', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/admin-discounts/admin-discounts').then(m => m.AdminDiscounts) },
  { path: 'admin/analytics', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/platform-analytics/platform-analytics').then(m => m.PlatformAnalytics) },
  { path: 'admin/config', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/global-config/global-config').then(m => m.GlobalConfig) },
  { path: 'admin/logs', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/member/admin/admin-logs/admin-logs').then(m => m.AdminLogs) },
];
