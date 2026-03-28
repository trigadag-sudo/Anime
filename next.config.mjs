/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shikimori.one',
      },
      {
        protocol: 'https',
        hostname: 'ashdi.vip',
      },
    ],
  },
};

export default nextConfig;
