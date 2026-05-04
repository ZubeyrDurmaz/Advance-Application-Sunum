/**
 * Development environment configuration
 * This file is used during local development
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  stripePublishableKey: 'pk_test_51TTCIMFaS5zHJEgIAxPf1pS0zGctrvTVCz8ODY6Lh7LL47gnfcQ5GyYOO7aChH3Dt4ok3cFmk9T6g1ZJi4XWYuJPr00AtzwFeIF',
  tokenExpiration: 900000, // 15 minutes in milliseconds
  cacheTimeout: {
    categories: 300000, // 5 minutes in milliseconds
    products: 120000    // 2 minutes in milliseconds
  }
};
