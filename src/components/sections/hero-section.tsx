
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection({ lang }: { lang: 'en' | 'sq' }) {
  const content = {
    sq: {
      headline: "Sillni Teknologjinë e Zgjuar në Biznesin Tuaj",
      subheadline: "Blue Square AI krijon zgjidhje inteligjente që automatizojnë, monitorojnë dhe optimizojnë çdo aspekt të biznesit tuaj.",
      cta: "Mëso Më Shumë",
    },
    en: {
      headline: "Bring Smart Technology to Your Business",
      subheadline: "Blue Square AI creates intelligent solutions that automate, monitor, and optimize every aspect of your business.",
      cta: "See our services",
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-primary-foreground overflow-hidden">
      <Image
        src="https://i.postimg.cc/TwVmG3dR/background.png"
        alt="Abstract technology globe background"
        fill
        className="object-cover fade-in"
        priority
      />
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 fade-in-up">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              {currentContent.headline}
            </h1>
            <p className="max-w-[700px] md:text-xl">
              {currentContent.subheadline}
            </p>
            <Button size="lg" asChild>
                <Link href="#services">{currentContent.cta}</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
