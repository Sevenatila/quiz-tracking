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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
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
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
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
              setTimeout(loadAbacus, 3000);
            `,
          }}
        />
        <script
          async
          defer
          src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"
        ></script>
        {/* Google Tag Manager - Facebook Pixel agora e gerenciado via GTM */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
