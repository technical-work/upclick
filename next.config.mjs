/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose']
};

export default nextConfig;
