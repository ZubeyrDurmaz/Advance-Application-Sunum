/**
 * Development environment configuration
 * This file is used during local development
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  tokenExpiration: 900000, // 15 minutes in milliseconds
  cacheTimeout: {
    categories: 300000, // 5 minutes in milliseconds
    products: 120000    // 2 minutes in milliseconds
  }
};
