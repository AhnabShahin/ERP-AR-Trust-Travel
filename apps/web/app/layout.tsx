import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'AR Trust Travel & Tourism — Qatar ERP Dashboard',
  description:
    'Modern SaaS ERP for AR Trust Travel & Tourism in Doha, Qatar — agent desk POS, hotel vendor partnerships, multi-currency ledger, live passenger dispatch, and EOD shift reconciliation.',
};

// Runs before paint to set the theme class, preventing a flash of the wrong theme.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('artrust_theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors">
        {children}
      </body>
    </html>
  );
}
