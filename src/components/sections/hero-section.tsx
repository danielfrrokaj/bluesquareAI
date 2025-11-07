import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import background from '/public/background.png';

export function HeroSection({ lang }: { lang: 'en' | 'sq' }) {
  const content = {
    sq: {
      headline: "Sillni Teknologjinë e Zgjuar në Biznesin Tuaj",
      subheadline: "Blue Square AI krijon zgjidhje inteligjente që automatizojnë, monitorojnë dhe optimizojnë çdo aspekt të biznesit tuaj.",
      cta: "Mëso Më Shumë",
      rating: "Vlerësuar 4.9/5 nga klientët tanë"
    },
    en: {
      headline: "Bring Smart Technology to Your Business",
      subheadline: "Blue Square AI creates intelligent solutions that automate, monitor, and optimize every aspect of your business.",
      cta: "Learn More",
      rating: "Rated 4.9/5 by our clients"
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-primary-foreground overflow-hidden">
      <Image
        src={background}
        alt="Abstract technology globe background"
        fill
        className="object-cover"
        priority
        placeholder="blur"
      />
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 fade-in-up">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm p-2 px-4 rounded-full border border-primary/50">
              <div className="flex text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
               <span className="font-semibold text-lg">4.9/5</span>
            </div>
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
