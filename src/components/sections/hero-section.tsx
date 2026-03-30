'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image 
          src="/background/header_wallpaper.jpg"
          alt="Hero Wallpaper"
          fill
          className="object-cover scale-110"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#c29cd2] to-transparent shrink-0" />
      </motion.div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            <motion.h1 
              initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl font-headline text-white whitespace-pre-line leading-[1.1] sm:leading-[1.05]"
            >
              {currentContent.headline}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[850px] text-lg md:text-2xl text-white/90 leading-relaxed font-medium tracking-tight mx-auto"
            >
              {currentContent.subheadline}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
          >
            <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-12 text-xl font-bold h-16 border-white/20 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:border-white/40 group overflow-hidden"
                onClick={() => window.location.href = `/vision?lang=${lang}`}
            >
                <span className="relative z-10 group-hover:scale-110 transition-transform block">{currentContent.secondaryCta}</span>
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-24 flex flex-col items-center gap-6"
          >
             <div className="flex items-center gap-4 group">
                <div className="h-[1px] w-12 bg-white transition-all group-hover:w-20" />
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">{lang === 'sq' ? 'MUNDËSUAR NGA TEKNOLOGJIA AI' : 'POWERED BY AI TECHNOLOGY'}</p>
                <div className="h-[1px] w-12 bg-white transition-all group-hover:w-20" />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}