import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectShowcaseSection } from "@/components/sections/project-showcase-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
const Home = async ({ searchParams }: { searchParams: Promise<{ lang?: string }> }) => {
  const params = await searchParams;
  const lang = params.lang === 'sq' ? 'sq' : 'en';

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-grow">
        <HeroSection lang={lang} />
        <ServicesSection lang={lang} />
        <ProjectShowcaseSection lang={lang} />
        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default Home;