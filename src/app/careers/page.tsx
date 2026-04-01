'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const pageContent = {
    sq: {
        title: "Karriera",
        subtitle: "Bashkohuni me ekipin tonë vizionar dhe ndërtoni të ardhmen e teknologjisë AI së bashku me ne.",
        heroBadge: "Eja në Ekipin Tonë",
        openingsTitle: "Pozicionet e Hapura",
        openingsSubtitle: "Eksploroni mundësitë tuaja në Blue Square AI.",
        noOpenings: "Nuk ka pozicione të hapura për momentin.",
        noOpeningsDescription: "Në këtë moment nuk kemi ndonjë pozicion të lirë, por jemi gjithmonë të interesuar të njohim njerëz të talentuar.",
        talentPoolTitle: "Dërgoni CV-në tuaj",
        talentPoolDescription: "Na dërgoni profilin tuaj në info@bluesquare.ai dhe do t'ju kontaktojmë kur të hapet një pozicion që ju përshtatet."
    },
    en: {
        title: "Careers",
        subtitle: "Join our visionary team and build the future of AI technology together with us.",
        heroBadge: "Join Our Team",
        openingsTitle: "Current Openings",
        openingsSubtitle: "Explore your opportunities at Blue Square AI.",
        noOpenings: "No open positions at the moment.",
        noOpeningsDescription: "We don't have any active vacancies right now, but we're always interested in meeting talented people.",
        talentPoolTitle: "Join our Talent Pool",
        talentPoolDescription: "Send your CV/Portfolio to info@bluesquare.ai and we'll reach out when a suitable position opens up."
    }
}

function CareerContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header lang={lang} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-black text-white">
          {/* Background Wallpaper */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
             <Image 
                src="/background/wallpaper-dark1.jpg"
                alt="Careers Wallpaper"
                fill
                className="object-cover scale-110"
                priority
             />
             <div className="absolute inset-0 bg-black/60" />
             <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </motion.div>

          <div className="container relative z-10">
            <div className="max-w-5xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-white"
              >
                <Sparkles className="h-3 w-3" />
                {currentContent.heroBadge}
              </motion.div>
              
              <motion.h1 
                initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-7xl lg:text-8xl font-extrabold font-headline mb-10 tracking-tighter text-white leading-none"
              >
                {currentContent.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-2xl text-zinc-300 leading-tight font-medium tracking-tight max-w-3xl"
              >
                {currentContent.subtitle}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24 md:py-32 bg-white">
            <div className="container px-4 mx-auto text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black mb-6 tracking-tight">
                            {currentContent.openingsTitle}
                        </h2>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-tight mb-20 max-w-2xl mx-auto">
                            {currentContent.openingsSubtitle}
                        </p>

                        <div className="bg-zinc-50 border border-black/5 rounded-[2.5rem] p-12 md:p-20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                            <div className="h-20 w-20 rounded-full bg-white border border-black/5 flex items-center justify-center mx-auto mb-10 shadow-xl">
                                <Briefcase className="h-8 w-8 text-black/20" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-black mb-4 tracking-tight">
                                {currentContent.noOpenings}
                            </h3>
                            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-xl mx-auto mb-12">
                                {currentContent.noOpeningsDescription}
                            </p>
                            
                            <div className="h-px w-24 bg-black/5 mx-auto mb-12" />
                            
                            <div className="flex flex-col items-center">
                                <Link 
                                    href="mailto:info@bluesquare.ai"
                                    className="group flex items-center gap-6 p-6 rounded-3xl border border-black/5 bg-white hover:bg-black hover:text-white transition-all duration-500 shadow-sm hover:shadow-2xl"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-black group-hover:bg-white/10 group-hover:text-white transition-colors">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">{currentContent.talentPoolTitle}</p>
                                        <p className="text-lg md:text-xl font-bold">info@bluesquare.ai</p>
                                    </div>
                                </Link>
                                <p className="mt-8 text-zinc-400 text-sm font-medium">
                                    {currentContent.talentPoolDescription}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

export default function CareerPage() {
    return (
        <Suspense fallback={null}>
            <CareerContent />
        </Suspense>
    );
}
