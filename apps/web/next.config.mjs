/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Compile the shared workspace package (it ships TypeScript source).
  transpilePackages: ['@ar-trust/shared'],

  // The existing components were written for Vite, where `import img from
  // './x.jpg'` yields a URL string. Next normally returns a StaticImageData
  // object instead. Disabling static-image handling and treating images as
  // plain resources restores the Vite behaviour, so components work unchanged.
  images: {
    disableStaticImages: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|svg)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
