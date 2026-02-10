import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Fonte otimizada: apenas pesos usados + swap para carregamento rápido
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

// Viewport otimizado para mobile
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Diagnóstico Financeiro - Descubra quanto você está perdendo',
  description: 'Diagnóstico financeiro gratuito em 2 minutos. Descubra quanto dinheiro você está perdendo sem perceber e como recuperar.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Diagnóstico Financeiro - Descubra quanto você está perdendo',
    description: 'Diagnóstico financeiro gratuito em 2 minutos. Descubra quanto dinheiro você está perdendo sem perceber.',
    images: ['/og-image.webp'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect para origens críticas - melhora LCP em ~350-320ms */}
        <link rel="preconnect" href="https://api6.ipify.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tracking.utmify.com.br" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://apps.abacus.ai" />
        <link rel="dns-prefetch" href="https://mpc-prod-14-s6uit34pua-ue.a.run.app" />

        {/* Abacus AI - carregado após interação para não bloquear render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.pixelId = "69530b208ca5e6056799814f";
              // Carrega Abacus apenas após primeira interação do usuário
              var abacusLoaded = false;
              function loadAbacus() {
                if (abacusLoaded) return;
                abacusLoaded = true;
                var s = document.createElement('script');
                s.src = 'https://apps.abacus.ai/chatllm/appllm-lib.js';
                s.async = true;
                document.head.appendChild(s);
              }
              ['click', 'scroll', 'touchstart', 'mousemove'].forEach(function(e) {
                document.addEventListener(e, loadAbacus, { once: true, passive: true });
              });
              // Fallback: carrega após 3s se não houver interação
              setTimeout(loadAbacus, 5000);
            `,
          }}
        />
        <script
          async
          defer
          src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"
        ></script>
        <script
          async
          defer
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
        ></script>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
