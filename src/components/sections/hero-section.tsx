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
      cta: "Learn More"
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center text-center text-primary-foreground overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1738082956254-1dd63ad1db71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMG5ldHdvcmt8ZW58MHx8fHwxNzYyNDI3NTg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Abstract AI network background"
        fill
        className="object-cover"
        data-ai-hint="abstract network"
        priority
      />
      <div className="absolute inset-0 bg-primary/70 backdrop-brightness-75" />
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
