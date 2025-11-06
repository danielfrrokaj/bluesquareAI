
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { VisionSection } from '@/components/sections/vision-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Chatbot } from '@/components/chatbot';

export default function Home({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1">
        <HeroSection lang={lang} />
        <ServicesSection lang={lang} />
        <ProductsSection lang={lang} />
        <VisionSection lang={lang} />
        <ContactSection />
      </main>
      <Chatbot lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}
