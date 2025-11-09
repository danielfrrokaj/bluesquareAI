import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google'
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: {
    default: 'Blue Square AI - Zgjidhje Inteligjente për Biznesin',
    template: '%s | Blue Square AI',
  },
  description: 'Blue Square AI krijon zgjidhje inteligjente për biznese të vogla dhe të mesme, duke kombinuar eksperiencën me fuqinë e Inteligjencës Artificiale.',
  // Removed 'icons' property to rely on the explicit link tag below
  openGraph: {
    title: 'Blue Square AI - Zgjidhje Inteligjente për Biznesin',
    description: 'Blue Square AI krijon zgjidhje inteligjente për biznese të vogla dhe të mesme, duke kombinuar eksperiencën me fuqinë e Inteligjencës Artificiale.',
    url: 'https://bluesquare.ai',
    siteName: 'Blue Square AI',
    images: [
      {
        url: '/logo.png',
        width: 200,
        height: 200,
        alt: 'Blue Square AI Logo',
      },
    ],
    locale: 'sq_AL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Square AI - Zgjidhje Inteligjente për Biznesin',
    description: 'Blue Square AI krijon zgjidhje inteligjente për biznese të vogla dhe të mesme, duke kombinuar eksperiencën me fuqinë e Inteligjencës Artificiale.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Explicitly link the favicon to bypass caching/environment overrides */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', inter.className, poppins.className)}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}