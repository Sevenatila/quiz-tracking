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
    images: ['/og-image.png'],
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
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.pixelId = "69530b208ca5e6056799814f";`,
          }}
        />
        <script
          async
          defer
          src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"
        ></script>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
