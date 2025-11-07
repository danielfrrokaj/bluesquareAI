import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

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
        src="https://images.unsplash.com/photo-1596005333619-2cf313397984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBnbG9iZXxlbnwwfHx8fDE3NjI0NTg5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Abstract technology globe background"
        fill
        className="object-cover"
        data-ai-hint="abstract technology globe"
        priority
      />
      <div className="absolute inset-0 bg-primary/70 backdrop-brightness-75" />
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
