import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection({ lang }: { lang: 'en' | 'sq' }) {
  const content = {
    sq: {
      tag: "Ardhshmëria e Inteligjencës Artificiale",
      headline: "Fuqizoni Biznesin Tuaj me Zgjidhje\n Inteligjente AI",
      subheadline: "Zgjidhje të personalizuara që automatizojnë punën tuaj, kursejnë kohë dhe rrisin fitimet. Shndërroni idetë tuaja në realitet me teknologjinë më të fundit.",
      cta: "Merr një Konsultim Falas",
      secondaryCta: "Shiko Shërbimet",
    },
    en: {
      tag: "The Future of AI Integration",
      headline: "Empower Your Business with\n Smart AI Solutions",
      subheadline: "Custom solutions that automate your work, save time, and increase profits. Turn your ideas into reality with state-of-the-art technology.",
      cta: "Get a Free Consultation",
      secondaryCta: "Explore Services",
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full py-20 lg:py-32 flex items-center justify-center overflow-hidden bg-white">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-sm font-medium text-black/80 fade-in">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2" />
            {currentContent.tag}
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl font-headline text-black whitespace-pre-line leading-[1.1] fade-in-up">
            {currentContent.headline}
          </h1>
          
          <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed fade-in-up" style={{ animationDelay: '0.2s' }}>
            {currentContent.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild className="bg-black text-white hover:bg-black/90 rounded-full px-8 text-lg font-semibold h-14 shadow-lg shadow-black/10">
              <Link href={`/contact?lang=${lang}`}>{currentContent.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-lg font-semibold h-14 border-black/10 hover:bg-black/5">
              <Link href="#services">{currentContent.secondaryCta}</Link>
            </Button>
          </div>
          
          {/* Trust Element */}
          <div className="pt-12 flex flex-col items-center gap-4 fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm font-medium text-black/40 uppercase tracking-widest">Besuar nga inovatorët</p>
            <div className="flex flex-wrap justify-center gap-8 grayscale opacity-40">
              {/* Add company logos here if available */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}