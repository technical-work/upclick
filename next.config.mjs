/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  async rewrites() {
    return [
      { source: '/Privacy-policy', destination: '/privacy-policy' },
      { source: '/Privacy-Policy', destination: '/privacy-policy' },
      { source: '/privacy', destination: '/privacy-policy' },
      { source: '/Terms-of-Service', destination: '/terms-of-service' },
      { source: '/Terms-Of-Service', destination: '/terms-of-service' },
      { source: '/terms-of-Service', destination: '/terms-of-service' },
      { source: '/terms', destination: '/terms-of-service' },
      { source: '/Data-Deletion', destination: '/data-deletion' },
      { source: '/Data-deletion', destination: '/data-deletion' },
      { source: '/Refund-policy', destination: '/refund-policy' },
      { source: '/Refund-Policy', destination: '/refund-policy' },
      { source: '/refund', destination: '/refund-policy' },
      { source: '/Shipping-policy', destination: '/shipping-policy' },
      { source: '/Shipping-Policy', destination: '/shipping-policy' },
      { source: '/shipping', destination: '/shipping-policy' },
      { source: '/delivery-policy', destination: '/shipping-policy' },
      { source: '/Contact-us', destination: '/contact-us' },
      { source: '/Contact-Us', destination: '/contact-us' },
      { source: '/contact', destination: '/contact-us' },
      { source: '/Checkout', destination: '/checkout' }
    ];
  }
};

export default nextConfig;
