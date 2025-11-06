import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { VisionSection } from '@/components/sections/vision-section';
import { Chatbot } from '@/components/chatbot';
import { ContentGeneratorSection } from '@/components/sections/content-generator-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <ContentGeneratorSection />
        <VisionSection />
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}
