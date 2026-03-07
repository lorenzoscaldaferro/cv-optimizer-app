/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress punycode deprecation warning from pdf-parse
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas", "jsdom"];
    }
    return config;
  },
};

export default nextConfig;
