import type { Metadata } from 'next';
import { Suspense } from 'react';
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
    default: 'Blue Square AI - Driving Innovation in Albania & The Balkans',
    template: '%s | Blue Square AI',
  },
  description: 'Based in Tirana, Blue Square AI uses state-of-the-art Artificial Intelligence to build innovation across Albania and the Balkan region.',
  icons: {
    icon: 'https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/logo_bluesquare.jpg', // Updated favicon URL
  },
  openGraph: {
    title: 'Blue Square AI - Driving Innovation in Albania & The Balkans',
    description: 'Based in Tirana, Blue Square AI uses state-of-the-art Artificial Intelligence to build innovation across Albania and the Balkan region.',
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
    title: 'Blue Square AI - Driving Innovation in Albania & The Balkans',
    description: 'Based in Tirana, Blue Square AI uses state-of-the-art Artificial Intelligence to build innovation across Albania and the Balkan region.',
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
      <body className={cn('min-h-screen bg-background font-body antialiased', inter.className, poppins.className)}>
        <FirebaseClientProvider>
          <Suspense>
            {children}
          </Suspense>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}