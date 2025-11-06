import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { VisionSection } from '@/components/sections/vision-section';
import { Chatbot } from '@/components/chatbot';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <VisionSection />
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}
