/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Build a fully static site (out/) when NEXT_OUTPUT=export — ideal for
  // shared hosting (just upload the files). Normal builds stay server-mode.
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,

  // Compile the shared workspace package (it ships TypeScript source).
  transpilePackages: ['@ar-trust/shared'],

  // The existing components were written for Vite, where `import img from
  // './x.jpg'` yields a URL string. Next normally returns a StaticImageData
  // object instead. Disabling static-image handling and treating images as
  // plain resources restores the Vite behaviour, so components work unchanged.
  images: {
    disableStaticImages: true,
    unoptimized: true,
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
