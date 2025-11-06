import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type HeroSectionProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    title: 'Bring Smart Technology to Your Business',
    subtitle: 'Blue Square AI creates intelligent solutions that automate, monitor, and optimize every aspect of your business.',
    button: 'Learn More',
  },
  sq: {
    title: 'Sillni Teknologjinë e Zgjuar në Biznesin Tuaj',
    subtitle: 'Blue Square AI krijon zgjidhje inteligjente që automatizojnë, monitorojnë dhe optimizojnë çdo aspekt të biznesit tuaj.',
    button: 'Mëso Më Shumë',
  },
};

export function HeroSection({ lang }: HeroSectionProps) {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const t = translations[lang];

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center text-center text-primary-foreground overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-primary/70 backdrop-brightness-75" />
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 fade-in-up">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            {t.title}
          </h1>
          <p className="max-w-[700px] md:text-xl">
            {t.subtitle}
          </p>
          <Button size="lg" asChild>
            <Link href="#services">{t.button}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
