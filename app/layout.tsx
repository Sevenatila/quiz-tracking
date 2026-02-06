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
        {/* Facebook Pixel - inicialização direta (sem GTM) */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window,document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
              `,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
