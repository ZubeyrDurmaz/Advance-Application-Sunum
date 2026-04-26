/**
 * Production environment configuration
 * This file is used when building for production
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com/api', // Update with actual production URL
  tokenExpiration: 900000, // 15 minutes in milliseconds
  cacheTimeout: {
    categories: 300000, // 5 minutes in milliseconds
    products: 120000    // 2 minutes in milliseconds
  }
};
