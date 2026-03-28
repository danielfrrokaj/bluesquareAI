import Link from 'next/link';
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
    <section id="home" className="relative w-full py-24 lg:py-48 flex items-center justify-center overflow-hidden bg-white text-black">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[140px] opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 fade-in shadow-sm backdrop-blur-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-lime-400 animate-pulse mr-3 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
            {currentContent.tag}
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl font-headline text-black whitespace-pre-line leading-[1.1] sm:leading-[1.05] fade-in-up">
            {currentContent.headline}
          </h1>
          
          <p className="max-w-[850px] text-lg md:text-2xl text-zinc-500 leading-relaxed fade-in-up font-medium tracking-tight" style={{ animationDelay: '0.2s' }}>
            {currentContent.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 pt-8 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild className="bg-black text-white hover:bg-zinc-800 rounded-full px-12 text-xl font-bold h-16 shadow-xl transition-all hover:scale-105 hover:shadow-lime-400/20 active:scale-95">
              <Link href={`/contact?lang=${lang}`}>{currentContent.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-12 text-xl font-bold h-16 border-black/5 text-black hover:bg-zinc-50 transition-all hover:border-blue-400/30">
              <Link href="#services">{currentContent.secondaryCta}</Link>
            </Button>
          </div>
          
          {/* Subtle Trust Element */}
          <div className="pt-24 flex flex-col items-center gap-6 fade-in" style={{ animationDelay: '0.6s' }}>
             <div className="flex items-center gap-4 opacity-30 group">
                <div className="h-[1px] w-12 bg-black transition-all group-hover:w-20 group-hover:bg-blue-500" />
                <p className="text-[10px] font-bold text-black uppercase tracking-[0.4em]">{lang === 'sq' ? 'MUNDËSUAR NGA TEKNOLOGJIA AI' : 'POWERED BY AI TECHNOLOGY'}</p>
                <div className="h-[1px] w-12 bg-black transition-all group-hover:w-20 group-hover:bg-lime-500" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}