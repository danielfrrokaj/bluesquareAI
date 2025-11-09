import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { VisionSection } from '@/components/sections/vision-section';
import { Chatbot } from '@/components/chatbot';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  searchParams: { lang?: string };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const lang = searchParams?.lang === 'sq' ? 'sq' : 'en';
  
  const titleEn = 'Blue Square AI | Smart Automation & AI Solutions for Business';
  const descriptionEn = 'Blue Square AI provides intelligent solutions for small and medium businesses, combining expertise with the power of Artificial Intelligence to automate processes and reduce costs.';
  
  const titleSq = 'Blue Square AI | Zgjidhje Inteligjente & Automatizim për Biznesin';
  const descriptionSq = 'Blue Square AI krijon zgjidhje inteligjente për biznese të vogla dhe të mesme, duke kombinuar eksperiencën me fuqinë e Inteligjencës Artificiale për të automatizuar proceset dhe ulur kostot.';

  const title = titleSq;
  const description = descriptionSq;
  const locale = lang === 'sq' ? 'sq_AL' : 'en_US';
  const featuredImage = '/background/homepage_background.avif';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [featuredImage],
    },
  };
}

export default function Home({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams?.lang === 'sq' ? 'sq' : 'en';

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1">
        <HeroSection lang={lang} />
        <ServicesSection lang={lang} />
        <ProductsSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <VisionSection lang={lang} />
      </main>
      <Chatbot lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}