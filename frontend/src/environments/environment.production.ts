export const environment = {
  production: true,
  apiUrl: 'https://YOUR_DOMAIN/api',
  stripePublishableKey: 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY',
  tokenExpiration: 900000,
  cacheTimeout: {
    categories: 300000,
    products: 120000
  }
};
