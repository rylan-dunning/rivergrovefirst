/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, 
  },
  // Add this for Amplify
  trailingSlash: true,
};

export default nextConfig;