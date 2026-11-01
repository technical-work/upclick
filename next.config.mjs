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
      { source: '/Data-deletion', destination: '/data-deletion' }
    ];
  }
};

export default nextConfig;
