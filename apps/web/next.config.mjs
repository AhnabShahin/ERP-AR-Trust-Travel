/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // This app is served by a Node server (`next start`) so public pages can be
  // rendered on the server (SSR). Static export is intentionally NOT used — it
  // would force every page back to client-only rendering and disable the
  // server-side data fetching the public website now relies on.

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
