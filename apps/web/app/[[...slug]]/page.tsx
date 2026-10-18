import AppClient from './AppClient';

// Static export generates just the root HTML; client-side routing plus the SPA
// fallback in public/.htaccess serve every other path. In server/dev mode the
// optional catch-all still renders the SPA for any path at runtime.
export function generateStaticParams() {
  return [{ slug: [] }];
}

export default function CatchAllPage() {
  return <AppClient />;
}
