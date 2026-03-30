import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function HeroSection({ lang }: { lang: 'en' | 'sq' }) {
  const content = {
    sq: {
      tag: "Inovacioni i Inteligjencës Artificiale në Ballkan",
      headline: "Ndërtojmë të Ardhmen e Shqipërisë me AI",
      subheadline: "Me bazë në Tiranë, ne jemi forca lëvizëse e inovacionit në rajon. Transformojmë idetë në realitet duke përdorur teknologjinë më të fundit të Inteligjencës Artificiale.",
      cta: "Nisni Inovacionin",
      secondaryCta: "Mëso më Shumë",
    },
    en: {
      tag: "AI Innovation in the Balkans",
      headline: "Building the Future of Albania with AI",
      subheadline: "Based in Tirana, we are the driving force of innovation in the region. We turn ideas into reality using state-of-the-art Artificial Intelligence technology.",
      cta: "Start Innovating",
      secondaryCta: "Learn More",
    }
  }
  const currentContent = content[lang];

  return (
    <section id="home" className="relative w-full py-32 lg:py-48 min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/background/header_wallpaper.jpg"
          alt="Hero Wallpaper"
          fill
          className="object-cover"
          priority
        />
        {/* Darkening overlay for better contrast if needed, but we use blend modes */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Bottom fading transition to #c29cd2 */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#c29cd2] to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto">

          
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl font-headline text-white whitespace-pre-line leading-[1.1] sm:leading-[1.05] fade-in-up mix-blend-difference">
            {currentContent.headline}
          </h1>
          
          <p className="max-w-[850px] text-lg md:text-2xl text-white/90 leading-relaxed fade-in-up font-medium tracking-tight mix-blend-difference" style={{ animationDelay: '0.2s' }}>
            {currentContent.subheadline}
          </p>
          
            <Button size="lg" variant="outline" asChild className="rounded-full px-12 text-xl font-bold h-16 border-white/20 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:border-white/40">
              <Link href={`/vision?lang=${lang}`}>{currentContent.secondaryCta}</Link>
            </Button>
          
          {/* Subtle Trust Element */}
          <div className="pt-24 flex flex-col items-center gap-6 fade-in" style={{ animationDelay: '0.6s' }}>
             <div className="flex items-center gap-4 opacity-70 group">
                <div className="h-[1px] w-12 bg-white transition-all group-hover:w-20 group-hover:bg-[#ae012f]" />
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.4em] mix-blend-difference">{lang === 'sq' ? 'MUNDËSUAR NGA TEKNOLOGJIA AI' : 'POWERED BY AI TECHNOLOGY'}</p>
                <div className="h-[1px] w-12 bg-white transition-all group-hover:w-20 group-hover:bg-[#ae012f]" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}