import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { AllInOneSection } from '@/components/sections/all-in-one-section';
import { BenefitsSection } from '@/components/sections/benefits-section';
import { LiveVoiceChatSection } from '@/components/sections/live-voice-chat-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { FaqSection } from '@/components/sections/faq-section';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { ClientsSection } from '@/components/sections/clients-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ClientsSection />
        <FeaturesSection />
        <AllInOneSection />
        <BenefitsSection />
        <LiveVoiceChatSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
